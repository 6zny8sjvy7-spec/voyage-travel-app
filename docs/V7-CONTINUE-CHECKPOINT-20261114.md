# VOYAGE V2 / V7｜工程接續斷點（2026-11-14）

**最重要：從此檔和原 V2 測試工程接著修，不要重建，不要開新的測試網址，也不要整包把 V1 蓋掉。**

## 本輪現況
- 使用者指定固定 V2 網址：https://6zny8sjvy7-spec.github.io/voyage-travel-app/v2-review-20261112/
- repo：6zny8sjvy7-spec/voyage-travel-app。正式主頁 `/index.html` 不動，測試頁位於 `v2-review-20261112/index.html`。
- 工作分支：`work/voyage-v2-forward`。最近已部署的 main：`2a7761c94eafa646e2990cbe5c47798f1e5ed64c`（V7 的 16 圖畫面／功能改善；GitHub Pages 部署成功）。
- 本次開始時，前一輪桌面 Chromium + iPhone WebKit **47 個測試通過**：run `43462831824`。這不包含後續新修的交通儲存檢查。
- 所有 16 圖和後續要求對照：`docs/V7-OVERHAUL-AUDIT-20261113.md` 及 `docs/APPROVED-REQUIREMENTS-20261113.md`。
- 原有旅行資料 localStorage 鍵：`voyage-v2-review-20261112`；不得清空或與正式版 `voyage-v02` 混合。

## 此輪已寫入開發分支，待最新版綜合測試驗證
1. `voyage-transit-v2.js`：有完整且可信的每段停靠站與方向才能點「將路線加入行程」，資料缺漏時按鈕 disabled，不能顯示虛構的「1 站」。
2. `routeStops`：相同 stop_id 才合併，不同站牌（包含同名或轉乘路口的不同 stop_id）要保留，以免轉乘站被吃掉。
3. `saveRoute`：實際搭乘日期 `transitPlanDate` 與使用者原定出發時間必須保存到該日期的 `days[chosenDateIndex]`，不可無視日期直接塞在目前的 DAY。日期在旅行期間外時阻止錯誤寫入，先讓使用者調整旅行日期／天數；公車使用公車圖示。
4. `tests/v2-forward.spec.mjs`：新增「不完整站序禁止儲存」、「不同轉乘站牌不可合併」、「實際交通日期／時間保存」回歸。
5. 真實資料查核 `tests/transit-live-coverage.mjs` 改成 `no_route_found` 與 `route_present_but_incomplete_stop_data` 分開，不再以 Action 綠燈代表四國交通可用。

## 真實交通資料重要事實（已執行公開 API，不是 mock）
- 2026-11-13/14 自動查詢 `VOYAGE Real Transit Coverage (4 Countries)` run `43464166646`：
  - 韓國首爾 明洞→弘大：0 條路線，`no_route_found`。
  - 泰國曼谷 Siam→Asok：0 條路線，`no_route_found`。
  - 日本東京 新宿→澀谷：3 條具完整站序的路線；無已驗證即時到站。
  - 越南胡志明市 Bến Thành→Thảo Điền：站名無法確認，`not_verified`。
- 所以「四國所有地鐵／BTS／公車、正確幾站、即時到站」**仍是硬性未完成驗收項**；目前只是一個國家部分路線案例有資料，不能假稱成功。
- Transitous 資料是志工非商業／開源／輕量規則，明訂公開原始碼授權、來源歸屬等。repo 尚未確定開源授權，不可自行擅定 LICENSE。需要確認免費資料權限，官方韓國路線有免費 API 但須申請認證 key，不可把 key 寫在 GitHub Pages。
- 使用者限制：完全免費、不綁信用卡、查詢留在 VOYAGE 畫面、不導外部路線網、沒有資料不偽造。

## 繼續時要做的具體步驟
1. 先查 GitHub Actions 最新 `VOYAGE V2 Forward Regression` run，確認新測試通過，**不可用過去 47 項的通過紀錄冒充新版本通過**；失敗時讀 job logs 修正真問題。
2. 核對 `main` 與 `work/voyage-v2-forward` 具體變更檔案；避免其他同時工程覆蓋新增內容，必要時重新取最新 SHA 再更新。
3. 將通過測試的增量檔案發布到同一個原 V2 測試網址；只有部署成功且公開 URL 回歸通過才告知使用者已上線。
4. 以圖 1～16 維持全功能回歸，包括 iPhone 卡片、週滑動、備忘錄貼上／未安排、旅行日期倒數、單筆航班、行李刪除、費用、好友邀請。
5. 四國交通真實覆蓋與兩帳號共編仍需真實外部資料／合法免費服務，**不得以 mock 或 UI 通過宣稱這些完成**。
6. 使用者最在意不再突然斷掉：持續更新本文件最新提交、CI run、已部署 SHA 和明確未完成阻擋項，回答需直接指出工程狀態。

_本檔是實際 GitHub 工程接續紀錄，不是宣稱所有項目已完工。_

## 2026-11-14 實際發布更新
- 最新**61 項**桌面 Chromium + 模擬 iPhone WebKit 完整回歸通過，GitHub Actions run `43465841072`，SHA `c1cdc347589f678f8154173bed7a34c0f1a031bb`。
- 這次驗證包含四國別名安全匹配（含泰國 Asok BTS 但不誤認 ASOKHAR）、不完整站數不可儲存、轉乘不同站牌不合併、交通以明確選擇的日期存入行事曆。
- 增量正式部署到**原有固定 V2 網址**：`49a33ae37bfca5d493ded5fe612b497d4d5cf0da`。GitHub Pages build / report / deploy 全部 success，run `43466622130`。
- 只更新測試頁 `v2-review-20261112/index.html`、`voyage-transit-v2.js`、`voyage-transit-v5.js`；正式首頁 `/index.html` 的 blob SHA `acefa83e8eddfb950e22f0d6766fc626ad5da9d7` 仍一致，既有兩個 localStorage keys 不變。
- 新增直接對**公開網址**驗收站序、站牌識別和搭車日期的測試，run `43466853907`；此檔更新時該項尚未得到最終 conclusion，須看最新 GitHub Actions，不可冒稱通過。
- 尚未完工：韓國／泰國／越南的真實交通 A→B 來源覆蓋、四國即時進站資料（免費且合法可介接的 API 不保證完整）、真正雙帳號免費雲端共編未設定。不能把模擬瀏覽器 61 項通過當這三件事驗收成功。

## 接續更新（2026-11-14，最新工程實際執行狀態）

- **已部署**原 V2 測試網址：main commit `49a33ae37bfca5d493ded5fe612b497d4d5cf0da`，GitHub Pages run `43466622130` 成功；本次分支前一輪瀏覽器回歸 run `43465841072` **61 passed**，後續另有 run `43466853907` **63 passed**。
- **泰國官方免費資料突破**：GTFS（OTP Namtang）直連 ZIP 成功，feed_version `20261112`，41,301,863 bytes，2,066 路線／17,081 站；官方站點以 `BTS สยาม;BTS Siam` 形式雙語同欄，過往精確搜尋因未拆分誤判找不到。已修正稽核程式。
- 官方 BTS Sukhumvit 路線 `Siam/12 → Chit Lom/28 → Phloen Chit/27 → Nana/26 → Asok/25`，**四站**；GTFS service_id `1` 在 **2026-11-19** 活躍，來源 GTFS 2026-01-01～2026-12-31，非即時班次。官方原始資料稽核 run `43468540365` 成功。這僅是曼谷一個已驗證走廊，並非泰國全部 BTS／公車或四國交通已完成。
- **正在開發分支 QA**：新增 `v2-review-20261112/voyage-thai-otp-v1.js`，從官方有效日期的五站靜態序列，在 VOYAGE 內提供 Siam→Asok 及順序子區間的真正站數／方向；不顯示即時分鐘、不外連、不付費。另新增桌面與 iPhone WebKit 兩項專用測試，**測試通過前不得部署**。元件不支援未驗證反方向、過期班表及其他城市，會交回既有交通查詢／顯示無資料。
- **日夜模式驗收**：`voyage-overhaul-v7.css` 的真正深藍夜間樣式已寫入分支；回歸有一項在背景 transition 尚未結束就取色而失敗，已改為等待 300ms CSS 過渡完成再檢查色彩對比，仍需重新跑整套驗收。
- **未完成阻擋項不可隱藏**：韓／日其他路線和公車覆蓋、越南城市公車及 Metro 免費有效資料、四國各方向/營運商實際班次與即時進站、無付費服務之真人雙帳號同步，都還沒被真實驗證。不能用自動測試或目前這一條曼谷路線冒充四國全面完成。
- **絕不清除** localStorage `voyage-v2-review-20261112`，不覆蓋正式首頁 `/index.html`，不另開網址。下一步：查最新 `VOYAGE V2 Forward Regression` run 是否全過；過了才對照 main/工作分支差異、只發布已測試的預覽檔案，確認 Pages deploy；若失敗讀 job logs 修正本質原因，不要只改假測試。

## 2026-11-14 上午 GitHub 接續（最新已發布 84e78cdb）

### 這次聊天的完整實際成果
- 從 `work/voyage-v2-forward` 最新可用提交接續；原始 `main` 是 `a59d523260ff19ec4dc15809f1abd184bd75e581`，其 GitHub Pages 及 69 個桌面／WebKit 測試已通過。
- 新 JP/VN 雙方向官方站序由 `v2-review-20261112/voyage-rail-reference-v1.js` 提供。JP 東京 Metro 銀座線 G01–G19；VN 胡志明捷運 1 號線 14 站，`M1-xx` 只是模組識別用**內部 ID**，不是官方乘客站碼，UI **不可顯示作官方車站編號**。
- GitHub Actions `43553206403` 先前執行 **77 passed、2 failed、1 skipped**，失敗是日本銀座→淺草明明正確 10 站，UI 沒顯示官方站碼 G19；已修正 UI，嚴格只顯示東京 Metro 可核對之 G01–G19。
- 最新整套跑完 **79 passed、1 skipped、0 failed**：run `43553752238`；經 `work/voyage-v2-forward` commit `7c1187565ce5ee3679e04b81dec0b909e80adf8e`。
- **已部署**固定 V2 測試網址，main commit `84e78cdbfac369603da83ddd3f53c295f3f95610`。這次 main 僅增量新增 `voyage-rail-reference-v1.js`、更新 `voyage-transit-v2.js` 與原本的 `v2-review-20261112/index.html`。GitHub Pages run `43554173814` 的 build/deploy/report-build-status 三 job 全部 success。
- 正式根頁 `main/index.html` SHA **`acefa83e8eddfb950e22f0d6766fc626ad5da9d7` 未動**，localStorage `voyage-v2-review-20261112` 仍保持原名。不會另開網址，不會把 V1 蓋回 V2。
- 已在 `tests/v2-postpublish.spec.mjs` 新增**公開原網址** JP Ginza→Asakusa（G09→G19，10 站）和 VN Bến Thành→Bến xe Suối Tiên（13 站）測試，包含無虛構 ETA；workflow `VOYAGE V7 Public URL Post-Deploy QA` run `43554269382` 已啟動，**若沒有 final success，不能宣稱公開網址測試已過**。

### 視覺與仍未驗收
- 下載並目視 GitHub Actions `43553206403` 產生的 8 張 Chromium／iPhone WebKit day/night/home/itinerary/transport screenshot：iPhone 行程文字不像原圖壓縮截斷、白天夜晚色調可分辨；但**手機行程採完整高度清單式卡片，原始的等比例小時格呈現已改動**，仍須對照使用者核准的時間軸視覺與實機 Safari 觸控／長內容驗收。不得只用 WebKit pass 當使用者已接受。
- **硬阻擋項未完成**：四國所有營運商／公車完整實際路線、即時到站每站可核實資料，以及需要免費雲端專案的真人雙方同步（圖 16）。不能以已驗證的 4 個示範走廊冒充四國全面覆蓋。
- 免費資料服務與授權必須核對，不能添加付費 API、要求綁卡，不能外部導航替代 APP 內 A→B 的路線與停靠站。
- 16 圖完整需求、備忘錄直接貼全文／日期後填、航班依機票原始時間且不拆段、不清除行李與歷史資料，詳見本檔與 `docs/OVERHAUL-V7-AUDIT-20261113.md`。**任何新分支工作必須先讀這個檢查點**。
