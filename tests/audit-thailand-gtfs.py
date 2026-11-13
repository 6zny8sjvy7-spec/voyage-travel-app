"""Download and inspect official Thai OTP Namtang GTFS, no license or live-feed assumptions.
Never publish unverified routes or request paid API keys."""
from urllib.request import Request, urlopen
from zipfile import ZipFile
from io import BytesIO, TextIOWrapper
from collections import Counter
import csv, json, sys

url="https://namtang-api.otp.go.th/download/namtang-gtfs.zip"
req=Request(url,headers={"User-Agent":"VOYAGE-OpenData-Audit/1.0 (https://github.com/6zny8sjvy7-spec/voyage-travel-app)","Accept":"application/zip"})
print("Downloading official Thai GTFS:",url,flush=True)
try:
    with urlopen(req,timeout=55) as response:
        data=response.read(150_000_001)
        if len(data)>150_000_000: raise RuntimeError("File too large; refuse >150MB")
        print("HTTP status:",response.status,"bytes:",len(data),flush=True)
    with ZipFile(BytesIO(data)) as z:
        files=z.namelist()
        print("ZIP files:",files[:35])
        for n in ["feed_info.txt","agency.txt","calendar.txt"]:
            try:
                rows=list(csv.DictReader(TextIOWrapper(z.open(n),encoding="utf-8-sig")))
                print(n, "count",len(rows),"head",json.dumps(rows[:3],ensure_ascii=False),flush=True)
            except KeyError: print(n,"not present",flush=True)
        try:
            routes=list(csv.DictReader(TextIOWrapper(z.open("routes.txt"),encoding="utf-8-sig")))
            print("Route modes:",dict(Counter(r.get("route_type","") for r in routes)),"total:",len(routes))
            print("Bangkok BTS/MRT route samples:",json.dumps([r for r in routes if "bts" in str(r).lower() or "mrt" in str(r).lower()][:7],ensure_ascii=False))
        except KeyError:pass
        try:
            stop_rows=list(csv.DictReader(TextIOWrapper(z.open("stops.txt"),encoding="utf-8-sig")))
            print("Stops total:",len(stop_rows))
            select=[r for r in stop_rows if any(k in str(r).lower() for k in ("asok","อโศก","siam","สยาม","bến thành"))]
            print("Siam/Asok stop candidates:",json.dumps(select[:20],ensure_ascii=False),flush=True)
        except KeyError:pass
except Exception as e:
    print("OFFICIAL_GTFS_FETCH_FAILED",type(e).__name__,str(e),flush=True)
    sys.exit(1)
