# VOYAGE｜2026-11-28 行程名單／泰國交通／朋友協作上線驗收

## 正式唯一入口
https://6zny8sjvy7-spec.github.io/voyage-travel-app/ 對應 GitHub 根目錄 `index.html`。
`/voyage-travel-app/v2-review-20261112/` 是不同儲存鍵的測試頁，**不能當正式站**。

## 本輪程式變更
1. `v2-review-20261112/voyage-ideas-v1.js`：不再開啟「表單＋收藏」混在一起的 Modal；點行程名單先看既有收藏清單。只有按「＋ 新增地點／貼上網址」才彈出內建共同表單。各筆獨立提供原始 HTTPS 外連、編輯、刪除、**📅 加入每日行程**。加入時選擇旅行日期、時間、停留分鐘，寫到同一個 `voyage-v02` 已選旅行 `days` 中，原收藏不自動移除。
2. `v2-review-20261112/voyage-thai-transit-v1.js`：收起重複泰國 BTS/MRT 專用起終站搜尋，統一上方原有 **A→B** 主輸入框及交通方式選擇器。若 BTS/MRT 已核對的連續同線站段可查得站序，直接列出方向、站數、全部途經站與官方來源；跨線/未收錄區間交由原本 Transitous 免費開放資料搜尋，無可靠資料時不偽造結果；公車仍依 BMTA BUS 或 Google Maps 外查。保留原「查詢此站下一班」於選用展開區。
3. `supabase/voyage-schema.sql`：補上原程式引用但實際 repo 根目錄不存在的**部署 SQL**，含使用者權限、owner/editor/viewer、單次使用且 7 天有效的邀請碼、樂觀版本鎖與非公開旅行 RLS。**SQL 尚未在真實 Supabase 專案執行，因此不得宣稱朋友協作已啟用或安全上線。**

## 朋友協作——目前未通過正式驗收
現有程式需用戶自有 **Supabase** 專案 URL 與公開 publishable/anon key 連線；不能放 service_role 私密金鑰到網頁。
完整投入前：
- 先在用戶自行控制的 Supabase 專案執行 `supabase/voyage-schema.sql`；
- Auth 啟用 Email OTP，並把 GitHub Pages 真正正式根目錄加入 Allowed Redirect URLs；
- 完成兩個**不同的瀏覽器／Email 身份**實測：登入、上傳旅行、產生邀請、加入、viewer 無法修改、editor 可修改、版本衝突不覆蓋別人的修改、原本本機旅行保留、登出／切換旅行後資料權限正確；
- 確認需要按「上傳／更新」與「重新讀取清單」同步，**不是即時多人同時編輯**，不能以為會自動同步；
- 以上測試未完成前只能對朋友分享**網站本身**讓其個別建立本機行程，不得承諾共編。

## 發布安全
- 改動只限兩個 JS、新增資料庫 SQL 與 QA 檔案，不涉及泰國飛機圖、韓國橋梁、日本場景、11 個原快捷入口或其他工具；
- **不刪除或重新命名 `voyage-v02` 正式資料鍵**；
- 行程名單使用原已存在 `ideaPlaces` 陣列以保留舊收藏，原網址照存；既有旅行 `days` 採追加不覆蓋；
- GitHub Actions QA 用真正 root 同結構，Chromium + WebKit × 桌機／手機，測「清單 → 新增 → 選天加入 → A→B → 重新整理 → 資料不消失」；本機 WebKit 不等於使用者 iPhone Safari 真機驗收。

## 下一視窗接續
先讀 GitHub Issue #2 與這份檔案、最新 main 提交。確認是否已發布正式 root；如果沒有，不要聲稱已上線。所有修正都保留前一輪成果，別創立新版測試網址，朋友同步在雲端後端未啟用之前**永遠標記待驗證**。
