# VOYAGE Scene 11｜已核准橋樑列車動態網頁（2026-11-18）

> **本輪已實作，待使用者 Safari 視覺驗收。** 使用者先前說最新圖裡「列車放在桿子（欄杆）裡面可以」，並明確要求「依這張圖例來做網頁動版」，不是再交規格。使用者於 11/18 16:50 指出前一回覆「你剛剛都沒做」。因此實際建立新獨立 Scene11。

## 本次已實作並可恢復
- **新可操作網址**：https://6zny8sjvy7-spec.github.io/voyage-travel-app/design-previews/VOYAGE-SCENE-11-INTERACTIVE.html
- **GitHub 來源**：`design-previews/VOYAGE-SCENE-11-INTERACTIVE.html`，設計分支 commit `66248724b8aaf1ef91a720e5fb4f40c08dc4f5ea`。
- **main 僅新增獨立預覽 HTML**：commit `3290378b750a53db29dd55c1bac71f25dfcf167f`，GitHub blob `654bb6da7b3800d3ce8f11cb4d1b8a55a49ba69b`；未動原 Scene10、V7 或 root index。
- **用戶最終核准圖片**：`/mnt/data/明洞漢江列車之旅.png`，1448×1086，是「火車在欄杆內側」版本；不得誤用舊版 `首爾旅程_列車穩停漢江橋上.png`。
- **畫面保留**：原圖中的首爾塔、河流、樹、欄杆、晴天天空、場景構圖、原本中文字與黃色倒數面板，不重畫這些其它部分。
- **能夠移動的飛機/列車**：列車直接從核准圖片抽取原畫造型、CSS 23 秒從左到右固定水平移動，橋面座標固定，**固定 SVG 護欄 z-index 6 位於 train z-index 5 前面**，不會被列車帶走；飛機採同畫風使用者原先已認可的粉翼側視圖，18 秒向右上飛行。
- **圖層重建**：由最後核准原圖作為主體，**僅對飛機/列車遮蔽位置**使用另一張同風格無車無飛機的空景圖經 SIFT 影像對齊合成，並抽出原列車/飛機做獨立 PNG 動畫。**這些局部背景不是原始照片逐像素相同，仍待使用者美術驗收；其它部位維持原圖**。原生倒數數字做局部補背景並以 DOM 動態更新，預設示例 2027-01-10 出發。
- 雲輕微飄、河面波光、晴/雨/雪/夜四鍵可切換（雨雪為 canvas 獨立粒子，夜是深藍氣氛層；**尚未連接真正氣象 API**）。
- 保留 Scene10 六個分頁、雙語站名範例、單日/週、兩張卡片互動等原有 demo 結構。
- 使用隔離 localStorage key `voyage-approved-bridge11-preview-only`，**沒有讀寫 V7 旅行資料**。
- **QA**：Chromium 模擬手機 `390×844`、`360×780`、筆電 `1440×900`：**51/51 passed, 0 failures, 0 JS errors**；測圖檔成功、列車左右移動量>2px、飛機右移、欄杆 z-index 更前、沒有 body 水平溢出、天氣 4 模式切換、交通分頁可進。**未在 iPhone Safari 實體檢查**。
- Library 原型 `libfile_1a43b856c760819184c7938bcf724bbc`、390px 圖 `libfile_507257faa3c08191a5e25adf51ad3025`、1440px 圖 `libfile_884a633151508191992e77bc7cbdd9e1`、QA JSON `libfile_8ec4bec605948191bb9c0bdd5c7104d2`。
- Pages run `44274356356`，**務必確認 completed/success** 才可說預覽已完成部署。
- GitHub 保護檢查：main 原 Scene10 blob `d0e81751cc7c7133e986438cbbdbc420b1ecfc06`；V7 `v2-review-20261112/index.html` blob `0027652b222854d9bc78d4f21940b2196e1cce20`；根 `index.html` blob `acefa83e8eddfb950e22f0d6766fc626ad5da9d7`，本輪皆不變。

## 接下來
1. 使用者以 iPhone Safari 打開 Scene11，專注驗收**列車是否貼著橋面在欄杆內側移動、飛機動態、天氣與畫面是否仍像最後核准圖片**。
2. 如列車局部背景修補有瑕疵，**只修列車後方橋面和欄杆位置**，不要再改其它已核准介面。
3. 首爾視覺/動畫完整核准後，再做日本、泰國、越南分國家的原創平塗場景與天氣動畫。
4. 最後全站視覺核准才回原 V7 功能整合。**不能把獨立設計頁當正式產品**。
