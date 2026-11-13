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
