# VOYAGE Scene 08｜依使用者四張圖片指定修改（2026-11-17）

**目前階段：第一關首爾首頁局部視覺驗收。使用者尚未核准 Scene08，不得直接移植至正式 V7。**

## 唯一最新可操作測試連結
https://6zny8sjvy7-spec.github.io/voyage-travel-app/design-previews/VOYAGE-SCENE-08-INTERACTIVE.html

## 圖片對照與修改範圍
2026-11-17 用戶傳 4 張圖片，使用順序與功能：
1. `image(20261117-080849).png`：**新 moving plane 的造型目標**，細長奶油白機身、機頭向右上、薄粉紅機翼、灰深藍圓潤描邊、數個小窗、細飛行尾線。
2. `image(20261117-080942).png`：**遭否決的 Scene07 粗短飛機**，不得繼續使用。
3. `image(20261117-080955).png`：**遭否決的 Scene07 左右小卡**，不可只放孤零零的 SVG 裝飾。
4. `image(20261117-081033).png`：**先前 ChatGPT 自己生成、使用者要恢復的模板**，左卡「01/10(日)｜桃園→首爾｜09:20 起飛約 2 小時 40 分」＋完整機場航廈／塔台／飛機；右卡三項護照/K-ETA/T-money 勾選清單＋草地韓屋。
這 4 張附檔是本輪真正的圖像規格，不得再參考另一種機型或擅自重做已核准頁面。

## Scene08 已完成（只改三處）
- 主場景會動飛機直接重繪成纖細側視、翼面粉紅、機頭朝右上，同原飛行軌跡、時長。去除 Scene07 短胖飛機造型。
- 左卡：重新排為模板式日期＋航班資訊白底區塊；底部全幅原創 SVG 航廈、塔台、雲、草地、水平機身飛機。不是裁圖貼上。
- 右卡：維持奶油黃背景與韓屋底部風景，恢復**真正可勾選**的三項：確認護照效期（需6個月以上）、完成 K-ETA 申請、準備 T-money 交通卡。勾選儲存於隔離鍵 `voyage-scene08-reminders-preview-only`，不讀寫任何 V7 使用者資料。
- **沒有修改**：原 Scene07 HTML、Scene06、列車、天氣、日/週、交通、翻譯、費用、其它主版面和正式產品路徑。
- Scene08 HTML 檔 `design-previews/VOYAGE-SCENE-08-INTERACTIVE.html`，設計分支 commit `244a198713bce8d9549fee17153c3d768c50d392`；main **只新增**隔離預覽檔 commit `c02e036d5e4428bdb958fd02d6e7ac011615c650`、blob `9e777caf00b5cf2b33ae498b4b6614c240c41f4f`。

## 真實檢查
- Chromium 390×844, 360×780, 1440×900：**48/48 檢查通過，0 JavaScript pageerror**；檢查卡片完整、3 checkbox 可操作、點卡導頁、四天氣鍵、導覽與水平溢出。
- 同畫風 HTML/SVG 與實際畫面已人工確認。由於圖4 的原始模板是模糊截圖，對照其**版面層次與內容**重繪，並非宣稱像素相同；**實際 Safari 美術驗收尚未完成**。
- Library 備份 HTML ID `libfile_d551a50187ec8191b31ccdabdffe4709`；手機兩卡 QA 圖 `libfile_4c677acf61f48191891ddfdfee752ab5`；桌面 QA `libfile_3ae616f9d8a08191be7e39511110c47b`；JSON QA `libfile_cb0bb47fb3ac819183d4ca8fc8399c85`。
- GitHub Pages run `44046056031`；**務必檢查 completed/success 才可宣稱發布可用**。
- main 原 Scene07 blob `11bc101826892ea09b904365c79a423861991a98`；原 V7 `v2-review-20261112/index.html` blob `0027652b222854d9bc78d4f21940b2196e1cce20`；根 `index.html` blob `acefa83e8eddfb950e22f0d6766fc626ad5da9d7`，均未變動。

## 下一步（嚴禁跳過）
1. 使用者在 iPhone Safari 打開 Scene08 **只驗收飛行中的飛機、左側卡片、右側卡片**；如有問題只修指定區塊。
2. **當三處獲使用者明確確認 OK** 才開始日本、泰國、越南城市插畫與晴/雨/雪/夜情境，維持同一平塗圖風、當地代表性標誌、繁中+當地語言；逐國測試。
3. 全站視覺定稿後才開始真正 V7 功能整合（交通全站、翻譯OCR、費用匯率與更多工具），保留原旅程資料及網址，不擅自合入未核准設計。
