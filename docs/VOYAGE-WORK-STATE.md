# VOYAGE｜工作斷點（自動跨聊天室復原入口）

## ✅ 2026-11-24｜首爾首頁 Scene12 修補並**接入原 V7 網頁**（**最新斷點**）
- 使用者在 11/24 發現 Scene11 **飛機殘影、倒數 53/47 疊字、房子被背景合成拉歪**，希望「一次改然後用正式網站」。本次另自查 CSS 讓火車在 390px 由原應 160×24 被錯拉為 160×106，已修復長寬比。
- **本次實際更新的原 V7 網址**：https://6zny8sjvy7-spec.github.io/voyage-travel-app/v2-review-20261112/；GitHub Pages run **45348996789 completed/success**。
- **本次不再將原 Scene11 展示整頁蓋進正式 V7**。main 中只新增 `design-previews/VOYAGE-HERO-12.html`（乾淨首爾畫面與動態）及 `v2-review-20261112/voyage-home-art12.js`（首爾旅行限定 iframe 整合器），並在原 `v2-review-20261112/index.html` **只新增一行載入 JS**，其餘 V7 內頁/功能/資料格式完全未改。
- **主提交**：Hero `f2fdbf3ffd2e2301b0230b6d5ad0d0acc80d7af2`、整合器 `ed6a753972f915f8f4418f9045b6f1e136406bfe`、V7 index `a2d63a3a01748b765eaa4ebeedf287ba1b9f0316`。
- 修復方案：以最後核准的 `明洞漢江列車之旅.png` 為主，只重建火車/飛機遮蔽位置（**局部仍需美術檢查**），擦除舊「53」，由 DOM 按首爾日期算倒數，原車身以 641/95 比例移動且護欄仍在前景。
- **保護正式舊根目錄**：GitHub Pages 根 `index.html` 是較早的另一套 App，其 localStorage `voyage-v02` 與 V7 的 `voyage-v2-review-20261112` **不同**。根站未改，避免沒有搬運資料就整頁換版。若未來要統一根網址，需先明確資料遷移及跨瀏覽器驗證。
- Chromium 360/390/1440px 靜態與動畫尺寸、模擬 iframe 切國/日期/天氣測試完成。**實體 iPhone Safari/真實 V7 全功能 end-to-end 仍未驗收**；Pages 成功不等於美術已完全通過。
- 全部修改、限制、檔案與下一步詳見 [docs/VOYAGE-HOME-V12-20261124.md](https://github.com/6zny8sjvy7-spec/voyage-travel-app/blob/design/voyage-ui-v1-20261116/docs/VOYAGE-HOME-V12-20261124.md)（commit `c2a5bd17d39fc6bd60a6afa4195ca6370a6715ac`）。
- **下一步**：使用者用 Safari 直接進入原 V7 網址切首爾驗收 Scene12，若仍有殘影/房屋局部差異就只修那一區；**不要擅自重做已接受的卡片/功能**。確認後再做日本、泰國、越南，最後再統一 root/V7 產品資料及網址。



## ✅ 2026-11-18 Scene11｜**已製作最新核准圖之橋上列車動態網頁（目前最新）**
- 使用者已核准 `明洞漢江列車之旅.png`（1448×1086；火車在欄杆內側），說「請依這張圖例來做網頁動版」。此前助手僅回規格，使用者於 11/18 16:50 指正「你剛剛都沒做」。
- 現已真正完成新網頁 **https://6zny8sjvy7-spec.github.io/voyage-travel-app/design-previews/VOYAGE-SCENE-11-INTERACTIVE.html**；GitHub Pages run **44274356356 completed/success**。
- 主場景使用**最新核准圖片**，保留構圖/文字/南山塔/橋/水面/天氣按鈕造型；透過影像對齊只修除原列車/飛機遮蔽位置，再抽取原畫列車作獨立 CSS 水平移動，**SVG 橋護欄固定在動車前面**，原本說的「車不能漂浮、要在桿子內」已做成分層；同畫風粉翼飛機獨立向右上飛行。晴雨雪夜切換、雨雪粒子、雲動與水光運作。
- Chromium 390px/360px/1440px **51/51 checks pass、0 JS errors**，包括動車方向/位移、橋護欄圖層排序、沒有 body 橫向溢出、4天氣、6分頁與交通保留。但**使用者 Safari 視覺驗收尚未完成**；不得以這些程式檢查自動核准美術。
- GitHub design HTML commit `66248724b8aaf1ef91a720e5fb4f40c08dc4f5ea`，main **只新增獨立預覽** commit `3290378b750a53db29dd55c1bac71f25dfcf167f`；原 Scene10、V7、root index SHA 未變；不接觸 V7 使用者資料，預覽專用鍵 `voyage-approved-bridge11-preview-only`。
- 恢復的所有細節、原圖來源、QA 檔案 ID、局部背景非逐像素忠實的誠實說明及未來步驟：[docs/VOYAGE-SCENE-11-20261118.md](https://github.com/6zny8sjvy7-spec/voyage-travel-app/blob/design/voyage-ui-v1-20261116/docs/VOYAGE-SCENE-11-20261118.md)，文件 commit `d632c1348cd1c3807a45c92d8b20e8b60bed8f8d`。
- **下一步**：使用者先在 iPhone Safari 驗收列車真的在欄杆內跑、是否有背景修補痕跡、飛機/四天氣。若 OK，再開始日本/泰國/越南各國景與天氣；之後才接原 V7 功能整改。



## 🧭 2026-11-17 Scene10｜核准原圖插畫直接進網頁（**目前最新進度**）
- 使用者明確否決 Scene08/09「原本自己生成的模板好看、網頁卻完全不像」；要求**自行比對原始四張照片，停止擅自創新**。本次從已核准的真正 941×1672 `雨中首爾旅行首頁_ui.png` 直接萃取飛機＋機場＋韓屋插畫，沒有再畫另一套。
- **Scene10 獨立操作預覽**：https://6zny8sjvy7-spec.github.io/voyage-travel-app/design-previews/VOYAGE-SCENE-10-INTERACTIVE.html
- 真正 HTML 文字/日期/checkbox，背景裝飾取原圖並做去背；移動中的飛機 PNG 也是原圖素材，方向朝右，保持先前的移動動畫。兩卡形狀、顏色、資訊層級重新按照高畫質原圖對齊。原 V7 未改。
- 手機為保持字級可讀，兩卡橫向鄰接可滑；桌面在旁欄上下排列。這是**唯一尚未與原生成圖完全相同的排版差異**，未經使用者核准不能視為最終。
- GitHub design branch 新 HTML commit `203bdc61a61990143956390d4287acf43cebffe4`；main **只新增獨立 Scene10 設計頁** commit `03bdfdaa6c4efdd8aa4d10f778881e830e760cde`。GitHub Pages run `44049981158` 已核實 completed/success。
- Chromium 360/390/1440 共 **47/47 檢查通過、0 JS errors**；已另對照原稿與真頁面圖片，不可以用測試數取代美術評分。原 Scene08、V7 test、main/index blob 均不變。
- [Scene10 詳細視覺/驗收/資產規格](https://github.com/6zny8sjvy7-spec/voyage-travel-app/blob/design/voyage-ui-v1-20261116/docs/VOYAGE-SCENE-10-20261117.md)（commit `76be9583b9197cb3d7c2bb3170ee10e11b49a22c`）；原型 Library `libfile_7f7f46df25ac819187efd316092a4d8e`。
- **下一步**：使用者 iPhone Safari 確認 Scene10 原版飛機/左右卡插畫與文字是否達標。首爾美術明確核准後再做日本/泰國/越南，整體視覺 OK 才進 V7 真實功能整合；**第一關仍未宣告完成**。



## ✅ 2026-11-17 Scene08｜依新傳的4張圖片精準修飛機＋2卡（**最新工作斷點**）
- 用戶直接要求：會動的飛機**使用圖1細長白機身＋粉紅機翼**，不要 Scene07 圖2短胖機型；兩張卡**直接參照原本自己生成的圖4 模板**，而不是圖3 只有小插圖。**只改這些，其餘一律保留；核准後才開始其它三國**。
- 新版獨立可操作 URL：https://6zny8sjvy7-spec.github.io/voyage-travel-app/design-previews/VOYAGE-SCENE-08-INTERACTIVE.html
- Scene08 完成：細長平塗側視飛機，飛行朝右上；左卡白底日期航班雙欄 + 完整機場航廈塔台/地面飛機；右卡三項真正可勾選護照效期、K-ETA、T-money + 底部韓屋草地。絕無裁圖小貼片。其它 Scene07 原本的天氣、行程、交通、列車、六分頁均不動。
- **隔離本地資料**：Scene08 三項勾選鍵 `voyage-scene08-reminders-preview-only`，不讀寫 V7 旅行紀錄。原來 Scene07 的獨立 demo state 仍繼承，正式 V7 storage 不碰。
- HTML 位於 `design-previews/VOYAGE-SCENE-08-INTERACTIVE.html`。設計分支 commit `244a198713bce8d9549fee17153c3d768c50d392`；main 只新增預覽檔 commit `c02e036d5e4428bdb958fd02d6e7ac011615c650`，blob `9e777caf00b5cf2b33ae498b4b6614c240c41f4f`。
- **Pages run `44046056031` 已確認 completed/success**。Chrome/Chromium 模擬 390px/360px/1440px，**48/48 項測試通過、0 JS errors**；但原始圖4低解析度且**使用者真實 iPhone Safari 美術核准尚未完成**，不可稱完成第一關。
- 原 Scene07 預覽、原 V7 測試頁和正式根頁的 GitHub blob 均原封不動。
- **最完整跨聊天恢復路徑與附檔ID**：[docs/VOYAGE-SCENE-08-20261117.md](https://github.com/6zny8sjvy7-spec/voyage-travel-app/blob/design/voyage-ui-v1-20261116/docs/VOYAGE-SCENE-08-20261117.md)（commit `9b6b79819a225449c3df0b70049a1bbb6fffd08b`）。
- **下一步**：請使用者只驗收 3 個指定改動；若核准，再按已核准的平塗繪本風逐一製作日本、泰國、越南場景和天氣。未核准前不得跳四國或改真正 V7。


## ✅ 2026-11-17 Scene07｜指定三項插畫整改（目前最新進度）
- **使用者本輪只要求** (1) 首頁會動飛機造型改可愛、(2) 左卡改完整機場／飛機小場景、(3) 右卡改完整韓屋／植物小場景。其它原本已認可設計不得修改，**首爾驗收無誤才接日本、泰國、越南**。
- **獨立 Scene07 可操作預覽**：https://6zny8sjvy7-spec.github.io/voyage-travel-app/design-previews/VOYAGE-SCENE-07-INTERACTIVE.html
- 新版沿用 Scene06 除三處 SVG 及對應卡片高度/插畫定位 CSS 外的原功能：更圓潤的奶油白/珊瑚粉/深藍描邊飛機 SVG；左卡底部全幅機場+同款飛機+草地；右卡底部全幅韓屋+植物草地，不再右下角獨立貼圖。
- **GitHub Pages run `44042830975` 已確認 completed/success**，main commit `eb9b2f386500c95f43c7f5b82e954b5a72d8c6d2`；設計分支 HTML commit `51c3df25fec0e899ec185904a7069fa2ad72660f`。原產品 V7、正式首頁、Scene06 預覽 HTML 檔案 blob 都不變。
- QA：Chromium 390/360/1440：**65/65 功能與版面檢查通過、0 JS errors**；確認移動飛機方向仍朝右、左/右卡插圖全幅不越界、天氣與日期／交通互動未被刪除。**真實 iPhone Safari 與使用者美術核准尚未通過**，不得當正式版。
- 永久細節與跨聊天來源：[docs/VOYAGE-SCENE-07-20261117.md](https://github.com/6zny8sjvy7-spec/voyage-travel-app/blob/design/voyage-ui-v1-20261116/docs/VOYAGE-SCENE-07-20261117.md)；原型 Library ID `libfile_7d3d682fed4c8191bf26611ddcf68f4b`，手機截圖 ID `libfile_8c34bbfb2f448191b1be15ffaa2ecce6`。
- **下一步**：使用者先點開 Scene07 驗收**只這三項**；獲同意後繼續其它三國依國家象徵建築/天氣的插畫動畫；尚不能直接改原 V7。



## ✅ 2026-11-17 Scene06｜四種天氣與真正移動中的飛機、列車（**最新進度**）
- 使用者看 Fidelity05 截圖指出：原畫的飛機列車根本動不了、晴雪夜仍能看見畫死在原背景裡的雨、兩張小卡的插畫像截圖貼上；同時**肯定卡片與版面可以保留**。
- 本次已建立**全新乾淨場景底圖**（同樣採原核准的深藍粗輪廓平塗繪本風，不再有雨、飛機、列車烙印在底圖），加上獨立原創 SVG 飛機與橋上列車，CSS 實際左右移動。四種天氣的呈現已分開：晴有陽光、雨 Canvas 斜雨/漣漪、雪獨立雪花/積雪、夜有月亮星光，**晴/夜畫面沒有雨滴**；卡片裝飾改完整 SVG。
- **重要誠實註記**：乾淨底圖是基於批准畫風重新製作，與批准的原 PNG **不會逐像素完全相同**，使用者還沒有核准新畫面；此輪無法聲稱 100% 美術還原。真氣象 API、四國主圖、正式交通/翻譯/費用串接都未完成。
- **唯一新版預覽 URL**：https://6zny8sjvy7-spec.github.io/voyage-travel-app/design-previews/VOYAGE-SCENE-06-INTERACTIVE.html
- 設計分支 HTML commit `3c9cf7b4341c01e2f8b331872ca3c31d4748f768`；main **只新增獨立預覽路徑** commit `e9aaf8763288f31981c1b17059a3d1bbb65d83f6`。GitHub Pages run `44033450533` 已確認 **completed/success**（main commit `e9aaf8763288f31981c1b17059a3d1bbb65d83f6`）。
- 自動/視覺測試：Chromium 390px、360px、1440px 共 **60/60 checks pass、0 JS 錯誤**。canvas 逐天氣像素及車/飛機 4 個時點位置檢查都完成，細節 QA 和四天氣截圖保存於 Library；**WebKit 無安裝，不能稱已驗收 iPhone Safari**。
- 保護措施：原 V7 測試 `v2-review-20261112/index.html` blob `0027652b222854d9bc78d4f21940b2196e1cce20`、根 `index.html` blob `acefa83e8eddfb950e22f0d6766fc626ad5da9d7` 未變；原 localStorage 未讀寫。新原型使用 `voyage-scene06-visual-review-only`。
- 全套可恢復檔案、QA、GitHub 提交與正確下一步已保存：[docs/VOYAGE-SCENE-06-20261117.md](https://github.com/6zny8sjvy7-spec/voyage-travel-app/blob/design/voyage-ui-v1-20261116/docs/VOYAGE-SCENE-06-20261117.md)（commit `eebeda05cb5848f6956750dfd8bae635fc8d83c4`）。
- **下一步**：使用者 iPhone Safari 開啟 Scene06 驗收畫風、四天氣、飛機與列車方向及卡片。獲核准後才能擴四國原創動畫及接續其它全站設計整改，最後才 V7 真實產品整合。**第一關尚未通過。**



## 🧭 2026-11-17 Fidelity05｜**使用者核准原圖忠實還原第一段**（最新）
- **唯一新的操作驗收網址**：https://6zny8sjvy7-spec.github.io/voyage-travel-app/design-previews/VOYAGE-FIDELITY-05.html
- 這輪不是再生成別的圖；首頁主場景從使用者已核准的 **`雨中首爾旅行首頁_ui.png` 原圖直接裁切**，WebP 和原始像素差異約 2.02/255。前幾版水彩/動漫/Emoji 底圖**仍被否決，不可回用**。
- 本輪真正有操作：六分頁、日期與首爾當地倒數、首頁卡片、雨景 Canvas 細微動態、晴雪夜試玩鍵、日期上的首爾塔 SVG 跳動、單日/週總覽、四國交通靜態雙語站序與收合。**僅屬設計演示，未接正式個人/即時資料**。
- Chromium 390/360/1440 寬度 51/51 檢查通過、0 JS 錯誤；**實體 Safari 尚未驗收**。
- **必須誠實標記未完成：列車和飛機目前仍是核准畫作裡的靜態元素，沒有完成無瑕疵的分層運動；其餘天氣模式不是獨立完成的精緻插畫，也未接真正天氣。** 切其他三國首頁顯示「場景尚未製作」。
- 設計分支 commit `189898434adac06a290bb7891c9aa89838c00e2b`；main 僅新增獨立 HTML 預覽 commit `666c157dfbd9b45a9e841b4f430d02e7d7093d8f`，原 V7 檔案 SHA 保持一致。Pages `44030067183` 已實際確認 **completed/success**（對應 main commit `666c157dfbd9b45a9e841b4f430d02e7d7093d8f`）。獨立圖片/互動預覽尚需使用者 iPhone Safari 實測；本機 Chromium 不允許訪問 file/http URL，所以跨刷新 localStorage 持久化**未完成測試**。
- **所有工件與下一個可恢復步驟**：[docs/VOYAGE-FIDELITY-05-STATUS.md](https://github.com/6zny8sjvy7-spec/voyage-travel-app/blob/design/voyage-ui-v1-20261116/docs/VOYAGE-FIDELITY-05-STATUS.md)；規格文件 commit `eb866fb429f29869c86dd2d69a15f1824f802cb5`。Library 原型 HTML ID `libfile_bc5d47f53e448191ad752cbca02d5811`。
- **下一步**：使用者在 iPhone Safari 先驗收原圖忠實度，再做不殘影的同筆觸飛機/列車分層動畫與獨立天氣場景；第一關未正式核准，不得進 V7 整合開發。



## ❌ 2026-11-17 Flat04 使用者驗收明確不通過：美術偏離核准模板、飛機方向有問題（最新）
- 使用者指出：「你做出來的東西跟你的模板差超多，飛機還是倒著飛的」。**這是使用者的最終驗收意見，Flat04 整體首頁必須標記為未通過；此前 69 項 DOM/操作測試不代表畫風符合批准參考**。
- 人工核對核准原圖 `雨中首爾旅行首頁_ui.png` 與 Flat04 手機截圖：
  - 核准：偏日系平塗繪本、**深藍粗描邊**、圓潤可愛的雨中城市、平面列車/飛機在同一幅場景、夜燈與水面反光。
  - Flat04：後來另外生成的城市底圖較接近**細節繁複的動漫風明亮街景**，不是核准的平塗美術；背景雨線疊加不能代替原圖完整的雨天氛圍；列車/飛機的素材與場景也不一致。**不是改一點顏色就能解決**。
  - 特別是畫面構圖、筆觸與交通物件比例、主視覺 UI 資訊的融合偏離原圖，不得稱已匹配模板。
- **已做的局部技術修正**（僅保存設計分支、未發布主站）：重畫明確朝右上飛行的 SVG 機頭，修正 `planeTravel` 從左往右且向上爬升；GitHub design branch commit **`18321f3a7aa5d4ed56bd18d99782caed813900e8`**，修改 `design-previews/VOYAGE-FLAT-04-INTERACTIVE.html`。簡化瀏覽器 390×340 動畫單元測試：0/2.8/5.6/8.4/11.2/13.8 秒，位置 x 由約 126 持續增加至 429，y 由約 89 降至 5；此測試**只證明方向幾何及動畫移動，不表示原產品品質或 Safari 真機驗收通過**。
- **已發布的 Flat04 公開頁仍是舊被否決版本**，不能向使用者再聲稱已修好整體畫風；**禁止把它搬進 V7**。原 `v2-review-20261112/index.html` 與 `index.html` 仍未修改。
- 下一步必須從用戶已核准的那一張**原始圖像本身**進行場景分層設計（同一套深色描邊/平塗筆觸、橋樑、列車、飛機、首爾塔、雨天街景），先做到視覺忠實度，再接自然動畫及可點擊的 UI；避免用新的寫實/細節動漫風背景替代。
- **當前里程碑：第一關仍未完成。** 內頁原已肯定的小框、雙語站名、站數展開、單日週總覽保持；未授權不得進下一整合開發分支。


## ✅ 2026-11-17 首爾 Flat 04 互動首頁 — **最新進度，從此接續**
- 使用者**核准 2026-11-17 `雨中首爾旅行首頁_ui.png` 的平塗繪本美術方向**，要求立即做成真正可操作的首爾網頁，嚴禁再把漂亮靜態圖冒充會動的網站。
- 已完成獨立預覽網頁 **https://6zny8sjvy7-spec.github.io/voyage-travel-app/design-previews/VOYAGE-FLAT-04-INTERACTIVE.html**，GitHub Pages run **`44012232296` completed/success**；正式旅行 App V7 不變。
- 真正主程式：`design-previews/VOYAGE-FLAT-04-INTERACTIVE.html`，design 分支 commit `3215b387f7309583ca1954f641ec6555a6809a74`；main 只新增獨立設計預覽檔，commit `f724dc653da262d0e94bfa9eb77daf1fe27af4be`； blob `a82bd3c2ad0f6de46658b37d669a801f6f2f7701`。
- 首爾無字城市背景＋獨立可移動 SVG 列車與飛機，不是 Emoji。手動晴/雨/雪/夜鍵，Canvas 自然雨雪光點層；首頁出發日期設定與目的地當地時區倒數、卡片與勾選、6 主分頁、單日/週總覽、日期上方依國家代表性建築 SVG 跳動、四國交通雙語站序展開**可操作**。
- 使用者核准的**原始圖**已在 Library `/VOYAGE/DesignReview/APPROVED-20261117-Seoul-flat-reference.png` ID `libfile_0136e14631cc819197ca3db158195ff8`；新分層用背景圖也已存 Library ID `libfile_9d16ec7f25d88191aefa657b51064093`。新背景參考美術並非逐像素重製，**未經使用者核准不可稱符合原圖**。
- QA：Chromium 390×844、360×780、1440×900，69 checks passed / 0 failed / 0 JS error；未做實體 iPhone Safari 或真實天氣/交通/翻譯端到端。完整報告 Library ID `libfile_dc4db396ca0481918a109d0dedf2b63f`。本機 browser 限制以 `page.set_content` 驗證，**不能把存儲持久化視為已在 Safari 實測**。
- 安全：`v2-review-20261112/index.html` blob `0027652b222854d9bc78d4f21940b2196e1cce20`、根頁 `index.html` blob `acefa83e8eddfb950e22f0d6766fc626ad5da9d7` **未修改**；真資料鍵 `voyage-v2-review-20261112`、`voyage-v02` 未使用。預覽專用 key `voyage-approved-flat04-demo-only-v1`。
- 詳細規格及可回復 ID：[docs/VOYAGE-FLAT-04-20261117.md](https://github.com/6zny8sjvy7-spec/voyage-travel-app/blob/design/voyage-ui-v1-20261116/docs/VOYAGE-FLAT-04-20261117.md)。
- **下一步，第一關尚未完成**：使用者 iPhone Safari 點開 Flat04 預覽，先確認平塗場景、雨雪/夜景、列車飛機、實際卡片，回報不足再修；美術 OK 再逐國擴東京/曼谷/胡志明，逐頁定稿後才建立真 V7 整合分支。**不可拿此版替換正式產品**。



## 2026-11-17 第一關｜V3 首爾主視覺「可操作版」交付（最新）
- 使用者指出前次 `VOYAGE-SEOUL-HERO-03.html` 「什麼都不能按」。**根因：該檔是單一靜態插畫 HTML，不是手機操作原型**，之前未充分清楚交代。
- **本次完成**：把已產出的原創首爾 WebP 城市插畫直接嵌入 V2 的六分頁互動框架，新增 `design-previews/VOYAGE-VISUAL-03-INTERACTIVE.html`，搭配 `design-previews/voyage-v3-interactions.js`，其互動包括：
  1. 底部六分頁真正切頁，圖示改為 SVG 線稿；首頁行程、出發提醒與工具入口可點。
  2. 首頁「晴、雨、雪、夜」可切換**視覺情境示意**（**非真實氣象、非分層原生城市動畫**）。
  3. 行程單日與週總覽切換、日期可選、日期上方由 SVG 小飛機移動（非 Emoji）。
  4. 交通依四國切換雙語站名、方向/站數示例、展開全部沿途站名。
  5. 四國選擇仍可測交通資料示例，但**只有首爾 Hero V3 真正原創插畫**；切其他三國顯示「插畫尚待設計」不顯示錯國家的首爾畫，也不偷用被否決的 V2 幾何 Hero。
- **新獨立網頁網址**：https://6zny8sjvy7-spec.github.io/voyage-travel-app/design-previews/VOYAGE-VISUAL-03-INTERACTIVE.html
- GitHub **設計分支** HTML commit `50c4977031146de4583220d175e627db7de2332d`、JS commit `2fc1f89fc283ed77875f4a46d432b39e14c52d78`；**main 僅新增設計預覽檔** JS commit `b4db8e6d4a3a93786f95328bcd4715e775fe9ab6`、HTML commit `9598b00bff1a17404ce0782264257b4421e6e7f4`。
- 靜態驗證：JS `new Function` 解析無誤、29 個引用 DOM id 無缺漏、六分頁 DOM 存在、首爾原創 WebP 資料已嵌入、頁面與 JS 的相對路徑一致。**尚未完成真實 iPhone Safari 點擊驗收。**
- GitHub Pages run `43997736149`，已確認 GitHub Actions `43997736149` **completed/success**，對應 commit `9598b00bff1a17404ce0782264257b4421e6e7f4`；仍須使用者 iPhone Safari 真實點擊驗收。
- 原 V7 測試頁 blob `0027652b222854d9bc78d4f21940b2196e1cce20`、正式根頁 blob `acefa83e8eddfb950e22f0d6766fc626ad5da9d7`，與上一輪相同，未改動現有產品碼/資料。
- **仍未完成**：四國高品質動畫主視覺、真實天氣 API、實際四國全線交通/即時班次、翻譯 OCR / 語音實機、費用與資料真正整合；其頁面目前仍為可操作的版型示意。
- **下一步**：讓使用者用 iPhone Safari 看新可操作 V3 首頁與其他頁面，核准或回饋首頁美術/操作；設計未獲確認前不得修改正式 V7 App 或開始下一階段完整功能整改。



## 2026-11-16 首爾 Hero V3 真實公開樣稿（**最新部署**）
- **已將單一原創首爾 Hero V3 手機設計審查稿做成可直接開啟的獨立 GitHub Pages 預覽**：https://6zny8sjvy7-spec.github.io/voyage-travel-app/design-previews/VOYAGE-SEOUL-HERO-03.html
- 源文件已 commit 至設計分支 `design-previews/VOYAGE-SEOUL-HERO-03.html` commit `49a295054de2617d144942efa19c01c4c071eb1c`，獨立預覽文件已複製進 main 的**新增單一路徑** commit `6ee0821c945ba10298e8a1a5b888872e5a4622d0`；此檔為**自含 WebP 插畫的靜態 HTML**，不用外部圖片服務。
- GitHub Pages `pages build and deployment` run `43902442124`，已確認 GitHub Actions run `43902442124` **completed/success**；但尚未由使用者 iPhone Safari 實機驗收。
- 已用 Chromium 模擬 390px 手機，產生樣稿截圖且 img 解碼成功；真實 iPhone Safari 尚待使用者核准。
- 產品本體 `v2-review-20261112/index.html` blob `0027652b222854d9bc78d4f21940b2196e1cce20`、正式根頁 `index.html` blob `acefa83e8eddfb950e22f0d6766fc626ad5da9d7` **沒有改動**。
- **這是美術方向，沒有動畫分層或實際天氣接入**。目前第一關尚未通過。
- 下一步：使用者驗收這一張首爾 Hero 與手機排版；畫面方向獲接受後再實作真正自然動畫、天氣差異、四國延伸，最後才進下一整合分支。

## 2026-11-16 首頁 V3 真實美術樣稿與行動版截圖（**最新**）
- **目前階段：第一關全站視覺確認，首爾首頁 Hero 美術方向正在審核。禁止開始第 2 關功能整合。**
- 已從 GitHub Issue #2 查 V2 不通過記錄，從最新分支接續。已產出**原創首爾插畫**與 390px 手機首頁分區樣稿；不是粗糙 SVG/Emoji。
- 4 份可跨聊天室讀取的真實 Library 工件與明確檔案 ID 已寫入 `docs/VOYAGE-HERO-V3-ART-DIRECTION.md`，此規格檔 commit `476624f6c4915c772441411fc79937a1e524c519`。
- HTML 樣稿只有日間首爾靜態插畫+卡片、倒數示意，**沒有實際晴雨雪夜天氣接口、飛機/列車分層動畫，也沒有接旅程/交通/翻譯**。以設計方向驗收，不要宣稱產品功能完成。
- 已實際以 Chromium 390px 產生完整首頁截圖，確認靜態圖片能載入。**iPhone Safari 仍需使用者檢驗**。
- 保留 V2 **交通卡／站數展開等已認可內頁**；未修改 `v2-review-20261112/` 或 `main/index.html`，未部署真實 VOYAGE。
- **下一步**：向使用者展示 Hero V3 行動版樣稿並收美術意見；如通過才做真正分層天氣動畫、四國一致美術場景。每完成單元繼續更新本檔和 Issue #2。



**唯一入口：** https://github.com/6zny8sjvy7-spec/voyage-travel-app/issues/2

## 2026-11-16 V2 發布增量更正
- 真實網頁的 `main` 視覺原型：`design-previews/VOYAGE-VISUAL-02.html` + `design-previews/voyage-v2-interactions.js`。
- 預覽頁主頁部署成功 run `43887049103`（commit `5a80698320893e4f2d0b53440718f27d2eea295a`）。
- 後續查核日本/韓國/泰國方向時發現示例將「目的站」寫成「車輛終點方向」，已修正：韓國 4 號線示例呈現舍堂／烏耳島方向；泰國 BTS Siam→Asok 示意車次方向呈現 Kheha 凱哈。設計分支 commit `911da6410b901eb5cd77818611db60fbaf5d5f40`、main `dc6956def43a3a6e84e6d87449545c6734c1f287`，第二次 Pages run `43887403174` 須檢查最終 conclusion。
- **尚未完成瀏覽器與實體 iPhone Safari 可視化 QA，不得自稱已經驗收。**
- 下一步：使用者開啟 V2 新預覽，回傳頁面視覺與互動問題；依照使用者核准內容修下一版。原 V7 App 未接入任何原型功能。

## 2026-11-16 第二版原型（本次最新成果）
- 使用者 21:36 iPhone Safari 回報 V1「簡潔分卡可保留、但整體不夠可愛」、「四國 Hero 沒有分別的可愛動畫」、「日期上方原飛機消失」、「切曼谷仍是日本站名」、「站數不能點開」。V1 **未通過視覺驗收**。
- V2 獨立設計原型：https://6zny8sjvy7-spec.github.io/voyage-travel-app/design-previews/VOYAGE-VISUAL-02.html
- 設計分支新增 `design-previews/VOYAGE-VISUAL-02.html` 與 `design-previews/voyage-v2-interactions.js`；前者 HTML blob `30d5d09e553edda7fecb344fa2bfc8ef12e8f846`，後者 JS blob `e1c60d385210e4b4daaacbe1ed635c3d5e3d079d`。
- V2 保留小分框、6 分頁。新增**各國不同 inline SVG 插畫情境**（韓國首爾塔、日本東京塔/櫻花、泰國 BTS/寺廟、越南市場/機車）、雲/車移動/夜間星光/雨雪演示。這是**手動操作的設計情境**, 未接真實天氣 API。
- 行程：日期上方獨立✈️飛機標記移動跳動、日期點按回饋、日行程卡片資料示意、週卡橫滑切日；真實 V7 原版動畫**未被取代**。
- 交通：切國家自動更換繁中＋當地語言的 A/B 站、方向、站數、含上下車的完整站名清單，**展開/收合確實有 JS 互動**。僅示意/部分靜態站序，不可當真實 A→B 服務。
- 已做靜態檢查：JS 語法解析通過，28 個 JS 查詢 id 均對應原型 DOM，CSS 有手機斷點與減動態處理。**尚未完成 iPhone Safari 實機驗收**。
- 為讓使用者直接開啟，在 main **只新增** `design-previews/voyage-v2-interactions.js`（commit `7b343a1096c16d7644f2030897973b0fce221c33`）與 `design-previews/VOYAGE-VISUAL-02.html`（commit `5a80698320893e4f2d0b53440718f27d2eea295a`）。原產品 `v2-review-20261112/*` 及根 `index.html` 未改、旅行資料未操作；Pages run `43887049103` 須驗證成功後才回報已可訪問。
- **下一步**：檢查 Pages 成功、直接閱讀新版預覽，使用者 iPhone 與筆電實際體驗 V2，依意見繼續設計；使用者核准整套視覺前不能把原型移植到真正 APP。

## 2026-11-16 第一階段實際提交（歷史）
- GitHub 唯一入口 Issue #2 已建立、重新讀取可取得全文。
- **第一階段版面設計 V1**：`docs/VOYAGE-UI-V1-DESIGN.md`（已提交並重新讀取）；**獨立響應式 HTML 視覺原型**：`design-previews/VOYAGE-VISUAL-01.html`，commit `8a0838b7cf8f9c696f18cae412a226e9a208ebb7`（已提交並重新讀取）。
- 原型包含首頁城市情境示意、日/週切換、六分頁與交通/翻譯/費用/更多的版面草圖；**所有示範資料都不連接真實服務，不是可使用功能**。
- 這輪**未修改**任何 `v2-review-20261112/*` 或正式 `main/index.html`，未觸發新的產品部署。
- **下一步**：向使用者展示原型並收集具體視覺核准／修改意見；未核准不移植 UI 到真正網站。
- 獨立原型 GitHub 路徑：https://github.com/6zny8sjvy7-spec/voyage-travel-app/blob/design/voyage-ui-v1-20261116/design-previews/VOYAGE-VISUAL-01.html
- 規格連結：https://github.com/6zny8sjvy7-spec/voyage-travel-app/blob/design/voyage-ui-v1-20261116/docs/VOYAGE-UI-V1-DESIGN.md

## 2026-11-16 原始狀態
- 階段：**第 1 階段全站版面設計與防退版規格**（尚未核准正式版面）。
- 設計分支：`design/voyage-ui-v1-20261116`，基底 `main` SHA `84e78cdbfac369603da83ddd3f53c295f3f95610`。
- 舊工程分支 `work/voyage-v2-forward` 查驗時 HEAD `d6511f4ac686ad45d2d2644341009169b5db604e`。
- 已完成：保存 GitHub Issue #2 並重新讀取成功；建立設計分支；寫全站 UI 設計規格 V1。
- 進行中：製作桌面/手機視覺原型，核准前不修改公開網站。
- 尚未開始：下一個整合開發分支、真實功能改寫、部署、正式網站更新。
- 目前測試：**尚未執行新 UI 整合測試**；過去 V7 79/1 skipped、公開 QA 12 passed 只算歷史基準。
- 禁止事項：不動 `main/index.html`、不動正式 V2 網址、不可清空 `voyage-v2-review-20261112` 與 `voyage-v02`、不可使用舊 V1、不可把設計稿說成可用功能。

## 每次接續必做
1. 重新讀 Issue #2 和本斷點文件，查 GitHub 最新 branch HEAD；不要固定使用此處舊 SHA。
2. 確認 `docs/VOYAGE-UI-V1-DESIGN.md` 的最新規格、目前設計是否已由使用者核准。
3. 逐檔核對已提交 commit、最後成功 CI 與部署；未提交的內容不能假裝可恢復。
4. 從「進行中／下一步」接續。完成一個可獨立驗證的單元就立刻 Git commit、更新此檔和 Issue #2。
5. 發現不一致、資料缺失、分支衝突或對應版本不明，停止覆蓋，先釐清；不以試錯重新整包開發。

## 下一工作
- 將設計原型提交到本分支，保存可開啟的 HTML/截圖或設計檔。
- 驗證 GitHub 能從 **新獨立讀取** 返回本文件與原型。
- 在使用者確認全站版面前，不更新 V2 測試頁或進行完整整合功能整改。
