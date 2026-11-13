#!/usr/bin/env python3
"""Low-volume CC-BY Thai OTP/Namtang GTFS static-data probe, NOT live arrivals.

No paywall, key or billing. Avoids sending data to end users before validating
the dataset and the actual itinerary service dates, route direction and stops.
"""
import csv
import datetime as dt
import hashlib
import io
import json
import os
import re
import unicodedata
import urllib.request
import zipfile

URL = "https://namtang-api.otp.go.th/download/namtang-gtfs.zip"
OUT = "coverage-evidence/thailand-otp-gtfs-source.json"
LIMIT = 120 * 1024 * 1024
BBOX = (13.60, 13.95, 100.35, 100.75)
RESULT = {
    "source": URL,
    "owner": "Thailand Office of Transport and Traffic Policy and Planning (OTP)",
    "license": "CC BY — verify exact attribution at https://namtang-api.otp.go.th/opendata",
    "feed_type": "GTFS STATIC, not GTFS-RT",
    "not_a_realtime_guarantee": True,
    "tested_at": dt.datetime.now(dt.timezone.utc).isoformat(),
    "status": "not_verified",
    "cases": [],
}
os.makedirs(os.path.dirname(OUT), exist_ok=True)

def canonical(value):
    s = unicodedata.normalize("NFKC", str(value or "")).lower().strip()
    s = re.sub(r"\((?:bts|mrt|station|stop)\)", "", s, flags=re.I)
    s = re.sub(r"(?:\s+(?:station|bts|mrt))$", "", s, flags=re.I)
    return re.sub(r"[\s.\-_·]", "", s)

SIAM = {"siam", "สยาม"}
ASOK = {"asok", "asoke", "อโศก"}
def station_kind(name):
    # OTP records multiple official Thai/English names in one field,
    # e.g. "BTS สยาม;BTS Siam" and "BTS อโศก;BTS Asok".
    # Check each complete language variant, not fuzzy Asok-substrings that
    # would incorrectly accept the unrelated ASOKHAR station.
    for part in re.split(r"[;；]", str(name or "")):
        part = re.sub(r"^(?:BTS|MRT)\s+", "", part.strip(), flags=re.I)
        normalized = canonical(part)
        if normalized in SIAM:
            return "Siam"
        if normalized in ASOK:
            return "Asok"
    return None

try:
    req = urllib.request.Request(URL, headers={"User-Agent": "VOYAGE-static-GTFS-audit/1 (+https://github.com/6zny8sjvy7-spec/voyage-travel-app)", "Accept": "application/zip,application/octet-stream"})
    with urllib.request.urlopen(req, timeout=42) as response:
        data = response.read(LIMIT + 1)
    if len(data) > LIMIT:
        raise RuntimeError("Feed exceeds 120 MiB safety limit")
    if not zipfile.is_zipfile(io.BytesIO(data)):
        raise RuntimeError("Official endpoint did not return a GTFS ZIP")
    RESULT["size_bytes"] = len(data)
    RESULT["sha256"] = hashlib.sha256(data).hexdigest()
    with zipfile.ZipFile(io.BytesIO(data)) as z:
        members = {n.rsplit("/", 1)[-1].lower(): n for n in z.namelist()}
        def rows(file):
            name = members.get(file)
            if not name:
                raise RuntimeError("Missing GTFS table: " + file)
            with z.open(name) as raw, io.TextIOWrapper(raw, encoding="utf-8-sig", errors="replace", newline="") as f:
                yield from csv.DictReader(f)
        try:
            feed = next(rows("feed_info.txt"))
            RESULT["feed_publisher"] = feed.get("feed_publisher_name")
            RESULT["feed_version"] = feed.get("feed_version")
            RESULT["feed_start_date"] = feed.get("feed_start_date")
            RESULT["feed_end_date"] = feed.get("feed_end_date")
        except (RuntimeError, StopIteration):
            pass
        agencies = {x.get("agency_id") or "": x.get("agency_name", "") for x in rows("agency.txt")}
        routes = {x["route_id"]: x for x in rows("routes.txt")}
        RESULT["route_count"] = len(routes)
        RESULT["agency_count"] = len(agencies)
        stops = {}
        located = {"Siam": set(), "Asok": set()}
        for x in rows("stops.txt"):
            stops[x["stop_id"]] = x
            try:
                lat, lon = float(x["stop_lat"]), float(x["stop_lon"])
            except (ValueError, TypeError, KeyError):
                continue
            if not (BBOX[0] <= lat <= BBOX[1] and BBOX[2] <= lon <= BBOX[3]):
                continue
            kind = station_kind(x.get("stop_name"))
            if kind:
                located[kind].add(x["stop_id"])
        # Expand to parent/platform IDs without matching approximate neighboring names.
        for id, x in stops.items():
            parent = x.get("parent_station")
            if parent:
                for kind in located:
                    if parent in located[kind]:
                        located[kind].add(id)
        RESULT["matched_station_ids"] = {k: sorted(v)[:70] for k, v in located.items()}
        RESULT["stop_count"] = len(stops)
        # Every GTFS trip has its own direction, headsign and stop sequence.
        trip_metadata = {}
        for x in rows("trips.txt"):
            r = routes.get(x.get("route_id"), {})
            if r.get("route_type") in ("0", "1", "2") or "bts" in agencies.get(r.get("agency_id",""), "").lower():
                trip_metadata[x["trip_id"]] = {
                    "route_id": x.get("route_id"),
                    "service_id": x.get("service_id"),
                    "direction_id": x.get("direction_id"),
                    "headsign": x.get("trip_headsign"),
                    "line": r.get("route_short_name") or r.get("route_long_name"),
                    "agency": agencies.get(r.get("agency_id", ""), ""),
                }
        RESULT["candidate_rail_trips"] = len(trip_metadata)
        # Calendar and exceptions determine which GTFS pattern is valid on a
        # traveller's chosen date. A route geometry alone is not enough.
        calendar = {row.get("service_id"): row for row in rows("calendar.txt")}
        exceptions = {}
        for row in rows("calendar_dates.txt"):
            exceptions[(row.get("service_id"),row.get("date"))] = row.get("exception_type")
        def is_active(service_id, day):
            if exceptions.get((service_id,day)) == "1":
                return True
            if exceptions.get((service_id,day)) == "2":
                return False
            row = calendar.get(service_id)
            if not row or not(row.get("start_date","") <= day <= row.get("end_date","")):
                return False
            weekday = dt.datetime.strptime(day, "%Y%m%d").strftime("%A").lower()
            return row.get(weekday) == "1"
        markers = {}
        siam_ids, asok_ids = located["Siam"], located["Asok"]
        for x in rows("stop_times.txt"):
            trip_id = x.get("trip_id")
            if trip_id not in trip_metadata:
                continue
            sid = x.get("stop_id")
            if sid in siam_ids or sid in asok_ids:
                marker = markers.setdefault(trip_id, {})
                kind = "Siam" if sid in siam_ids else "Asok"
                try:
                    seq = int(x.get("stop_sequence",""))
                except ValueError:
                    continue
                marker[kind] = (seq, sid)
        eligible = [
            (trip, value["Siam"], value["Asok"])
            for trip, value in markers.items()
            if "Siam" in value and "Asok" in value and value["Siam"][0] < value["Asok"][0]
        ]
        eligible.sort(key=lambda x:(trip_metadata[x[0]]["route_id"] or "", x[1][0], x[2][0]))
        RESULT["matching_forward_trips"] = len(eligible)
        sample_ids = {x[0] for x in eligible[:12]}
        segment_rows = {id: [] for id in sample_ids}
        for row in rows("stop_times.txt"):
            trip_id = row.get("trip_id")
            if trip_id not in sample_ids:
                continue
            a, b = markers[trip_id]["Siam"][0], markers[trip_id]["Asok"][0]
            try:
                seq = int(row.get("stop_sequence",""))
            except ValueError:
                continue
            if a <= seq <= b:
                st = stops.get(row.get("stop_id"), {})
                segment_rows[trip_id].append((seq,row.get("stop_id"),st.get("stop_name","")))
        for tid, siam, asok in eligible[:12]:
            segment = sorted(segment_rows[tid])
            if len(segment)<2 or segment[0][0]!=siam[0] or segment[-1][0]!=asok[0]:
                continue
            RESULT["cases"].append({
                "trip_id":tid,
                "trip_metadata":trip_metadata[tid],
                "boarding_stop_id":siam[1],
                "alighting_stop_id":asok[1],
                "boarding_sequence":siam[0],
                "alighting_sequence":asok[0],
                "stop_count":len(segment)-1,
                "stops":[{"sequence":seq,"id":sid,"name":name} for seq,sid,name in segment],
                "sample_travel_date": "2026-11-19",
                "sample_date_service_active": is_active(trip_metadata[tid]["service_id"],"20261119"),
                "verified_service_date": is_active(trip_metadata[tid]["service_id"],"20261119")
            })
        RESULT["status"] = "sample_static_sequences_found" if RESULT["cases"] else "no_exact_Siam_Asok_sequence"
        RESULT["warning"] = (
          "Static feed does not prove service runs on the requested date; "
          "service calendar and exceptions must be checked before showing a user route."
        )
except Exception as exc:
    RESULT["status"] = "source_unavailable_or_invalid"
    RESULT["error"] = str(exc)[:420]
finally:
    with open(OUT,"w",encoding="utf-8") as f:
        json.dump(RESULT,f,ensure_ascii=False,indent=2)
    print(json.dumps({k:RESULT.get(k) for k in ["status","error","size_bytes","feed_start_date","feed_end_date","route_count","stop_count","matching_forward_trips"]},ensure_ascii=False))
    for item in RESULT["cases"][:3]:
        print("SAMPLE",item["trip_metadata"]["line"],item["trip_metadata"]["headsign"],"SERVICE",item["trip_metadata"]["service_id"],"2026-11-19 ACTIVE",item["sample_date_service_active"],"STOPS",item["stop_count"],"NAMES",[s["name"] for s in item["stops"]])
    print("AUDIT OUTPUT:",OUT, "-- result is NOT a live-arrival guarantee")
