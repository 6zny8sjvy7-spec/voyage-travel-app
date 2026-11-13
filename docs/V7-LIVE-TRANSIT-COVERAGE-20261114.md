# VOYAGE｜四國真實交通資料驗收紀錄（2026-11-14 臺灣時間）

這是**真實免費資料來源的抽查紀錄**，不是使用者的旅程，也不是四國交通功能完成保證。不得用 Playwright mock 回應或簡單字串比較冒充公開服務的真實營運資料。

## 已執行的真實來源查詢

來源：Transitous / MOTIS v6 routing，官方用法 https://transitous.org/api/；低頻測試透過 GitHub Actions `VOYAGE Real Transit Coverage (4 Countries)`，完整機器證據隨 workflow artifact 保存。

- 韓國首爾：Myeongdong → Hongik Univ.。選定非深夜服務時間後回傳 3 個具完整停靠站順序的候選方案。**僅證明這一組日期與地點有可驗證路線；未驗證其他韓國營運商全貌**。
- 日本東京：Shinjuku → Shibuya。回傳 3 個具完整停靠站順序的方案。**非所有日本公車／鐵路都已驗收**。
- 泰國曼谷：Siam → Asok。跨國來源回傳過 Asok 相似但錯誤的站名（例如 ASOKHAR），嚴格吻合規則拒絕錯站，因此**目前不能提供可信的站數**。
- 越南胡志明市：Bến Thành → Thảo Điền。跨國來源無法取得確切吻合 Bến Thành 的可靠起點，因此**目前不能提供可信的站數**。
- 四組都**沒有證實相應車站的可核對即時到站分鐘**。零資料時不能顯示假的倒數。

行動紀錄：
- https://github.com/6zny8sjvy7-spec/voyage-travel-app/actions/runs/43464267483
- 原始抽查程式 `tests/transit-live-coverage.mjs`；用 `time` 指定服務時段，避免午夜查詢誤判沒有交通服務。

## 真實功能準則

1. 支援的只是在已有核實資料的城市／營運商／時間／站點內查路線；站名同音、字串部分相似、空白方向、虛擬車站都不得當成有效起終點。
2. 在搭乘日起查到多條路線，提供各方案車號／名稱、正確方向、每一站停靠順序、上下車站、分段站數及合計，且可在 APP 同頁比較。
3. 公車／BTS／MRT／地鐵不應只有 A、B 兩個端點就被算成 1 站。僅有真正行車班次的完整 `intermediateStops`、可驗證登下車站時才計算。
4. 旅客填寫的搭車日期與目的地當地時鐘要送至 route API；韓日 +09:00、泰越 +07:00。將已查到的完整路線加入行事曆時，必須存進**同一個搭車日期**，不偷偷移到畫面當天。
5. 只有真的供應即時資訊、對上站點／路線／方向／時間，才顯示預計倒數；否則以「表定」或「缺少可靠即時資料」說明，不虛構。
6. 免費資料不足時不得要求使用者付費或改叫使用者去外部網站看路線；路線結果留在 VOYAGE 內。資料來源授權歸屬是法遵，不是導外查詢。
7. **非完成項**：泰國官方免費開放 GTFS 與越南各都市可授權資料之整合尚未完成；官方即時班次資料資格、覆蓋與無費用方案也尚未完成驗證，不應宣稱四國所有公車與鐵道已支援。

## 可用資料方向（未整合，不是假稱已完成）

- 泰國交通政策規劃辦公室 Namtang 公開資料 https://namtang-api.otp.go.th/opendata ，宣稱 CC-BY，交通 GTFS 需核對最新有效期間與營運商涵蓋（例如 BTS、MRT、公車）。
- 韓國首爾交通公社免費最短路線 OpenAPI https://www.data.go.kr/data/15143842/openapi.do ，需要依公開 API 使用條件申請認證與核對額度。
- 日本 ODPT https://developer.odpt.org/ 亦有免費使用條件與營運商覆蓋限制；前端不能洩漏需保密的 API key。
- 越南目前未確認可合法穩定提供整個城市公車＋地鐵完整站序及即時到站的無費用公開 API。

以上僅記錄已經確定的事實和限制，不能把規劃、來源存在或 API 200 誤當完成功能。

## 泰國官方 OTP 免費 GTFS 實際解析（2026-11-14 新證據）

官方公開來源：https://namtang-api.otp.go.th/opendata （CC-BY），ZIP：https://namtang-api.otp.go.th/download/namtang-gtfs.zip。
- 2026-11-12 版本的 ZIP 成功驗證，41,301,863 bytes、2,066 條 route、17,081 個 stop，服務日期涵蓋 2026 年。
- BTS Sukhumvit `route_id=1`，`Siam/12 → Chit Lom/28 → Phloen Chit/27 → Nana/26 → Asok/25`；四個實際停靠站。來源的兩語欄位是 `BTS สยาม;BTS Siam`、`BTS อโศก;BTS Asok`；不可用子字串方式把 ASOKHAR 誤判成 Asok。
- 2026-11-19，官方 GTFS 的 `service_id=1` 經 calendar/calendar_dates 驗證為服務日；`service_id=2` 當日無服務。不代表當日即時進站、班次一定準點或未臨時異動。
- GitHub Actions source audit： https://github.com/6zny8sjvy7-spec/voyage-travel-app/actions/runs/43468540365 。完整原始 sample GTFS trip_id/stop_id/service_id/站序請見該 run 的 JSON artifact。
- 工程已加入隔離的 `voyage-thai-otp-v1.js` 靜態路線 fallback 和相應 browser QA，但在測試和部署成功前仍是 **working branch**，不能宣稱已在公開網址可用。
- 目前尚無泰國可信公開即時到站；不得顯示「剩 4 分鐘」這類從靜態 GTFS 生成的假倒數。其他國家／其他曼谷路線繼續維持未驗收標記。
