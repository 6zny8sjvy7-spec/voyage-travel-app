# VOYAGE V7｜首爾 Scene12 正式 V7 首頁整合｜2026-11-24

> 狀態：**已發布至原 V7 網址**，非單獨 Scene 測試網址；**尚未實體 iPhone Safari 驗收**。原 GitHub Pages 根目錄 `index.html` 是不同的舊版 App，**未修改**，避免舊資料 `voyage-v02` 被誤覆蓋。使用者曾詢問「一次改然後用正式網站」；本輪更新的是既有 V7 功能完整站 `/v2-review-20261112/`。

## 已發布網址及文件
- 已更新的原 V7 網頁：https://6zny8sjvy7-spec.github.io/voyage-travel-app/v2-review-20261112/
- 只供獨立美術檢查的 Hero：https://6zny8sjvy7-spec.github.io/voyage-travel-app/design-previews/VOYAGE-HERO-12.html
- 只新增兩個檔案：
  - `design-previews/VOYAGE-HERO-12.html`（核准首爾城市插畫 + 飛機/列車動畫 + 四天氣與動態倒數）
  - `v2-review-20261112/voyage-home-art12.js`（只在 V7 首頁遇到首爾旅行時載入上述元件）
- 對既有 `v2-review-20261112/index.html` **只增加一行**：`<script src="./voyage-home-art12.js"></script>`，沒有移除其它 HTML/JS，也沒有變更 localStorage 舊旅行資料格式。
- 主要 main 提交：
  - 新 Hero `f2fdbf3ffd2e2301b0230b6d5ad0d0acc80d7af2`
  - V7 整合器 `ed6a753972f915f8f4418f9045b6f1e136406bfe`
  - V7 index 接入 `a2d63a3a01748b765eaa4ebeedf287ba1b9f0316`
- GitHub Pages Actions `45348996789` 已確認 **completed/success**。
- 根目錄原正式舊站 `index.html` blob `acefa83e8eddfb950e22f0d6766fc626ad5da9d7` **未變更**。這是兩套歷史版本不同儲存鍵，不得直接把 V7 全頁蓋到根目錄。

## 使用者 2026-11-24 明確提出的缺陷
1. 飛機在原背景還留著一台，動飛機又疊加。
2. 黃色出發倒數原圖畫死「53」，網頁更新「47」導致重影。
3. 火車後方建築物被舊版背景對齊演算法拉歪。
4. 自查額外發現：`.hero-image img{aspect-ratio:908/602}` 誤套到列車 sprite，使原 641×95 列車在 390px 頁面被強行顯示為 160×106（正確應為 160×24）。**先前 51 項測試未檢查實際動車的長寬比。**

## 本輪實際修正
- 用**使用者最後核准**的 `明洞漢江列車之旅.png`（1448×1086）當主底圖，僅修改靜態飛機和火車遮蔽區與原始倒數數字；原核准圖其他地方以程式直接保留原始像素。這些小區域使用同風格乾淨城市底圖局部對齊重建，保留大部分建築像素，**仍可能在補圖交界看到細微差異，不能宣稱逐像素無損或 100% 完美**。
- 飛機原本的靜態主體移除後，保留一個獨立 PNG sprite 向右上移動。
- 「53」背景原始數字已擦除；實際顯示**單一 DOM 倒數**，目的地 Asia/Seoul 時區計算，目前 2026/11/24 → 2027/01/10 顯示 47 天。
- 火車圖片樣式採原生 641/95 比例 + `height:auto!important`，2026/11/24 模擬手機 390px 測得尺寸 **160×24px**，保留車身在前護欄後方沿軌水平移動。修正前錯誤為 **160×106px**。
- Scene12 自含 HTML 與真實 V7 只有視覺整合，不寫入任何原存儲鍵、不刪除原行程/交通/翻譯/匯率工具。
- 目的地不是首爾時，整合器不插入首爾專屬圖，沿用原來各國顯示方式；目前**日本/泰國/越南新城市場景尚未製作**。

## 驗收事實和限制
- Chromium 360×780、390×844、1440×900 對独立 Scene12 及 iframe mock 的無資料壓力測試：正確貼圖尺寸與背景、倒數 47、火車水平正向/飛機移動、固定護欄 Z-index 更前、四天氣按鈕、無水平溢出、控制項正常。原本 V7 的功能未被重寫。
- V7 HTML 只有一行的新增載入，整合器驗證 iFrame 插入/切換到東京後移除/返回首爾重新插入。
- **沒有真實 iPhone Safari WebKit QA、也無法在本地自動化環境直接 HTTP 訪問 GitHub Pages**（Chromium URL 訪問受限制）。不得拿 mock 或靜態 DOM 測試表示真實 V7 功能端到端已驗證。部署成功是 Actions 層面的結果。
- HTML QA Library 原型 `libfile_3cb5d0a48b0481919d36c35f0b4265dd`、整合 JS `libfile_a8a432f50bd481919bf54b77680e49ac`、手機截圖 `libfile_26870c6838dc8191a403d429f29012dc`。
- **下一步**：使用者用 iPhone Safari 打開原 V7 網頁，切到「首爾」旅行，驗收可否看到 Scene12、新倒數和火車比例，以及天氣切換。若背景局部修補仍有可見瑕疵，優先只修這些、不要再變動房子。通過後按之前承諾延伸日本/泰國/越南的獨立城市插畫，再處理完整四國交通／翻譯 OCR／匯率功能。
- **禁止**直接把 V7 測試資料鍵 `voyage-v2-review-20261112` 覆寫為根目錄舊版 `voyage-v02`；不能毫無遷移地把 root App 換成 V7。
