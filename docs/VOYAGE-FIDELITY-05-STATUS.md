# VOYAGE｜Fidelity 05 首爾核准原圖忠實還原｜2026-11-17

> **狀態：第一關畫面設計進行中。本文件中的「原圖忠實」只表示這輪主場景直接使用使用者已批准的平塗插畫，不代表完整動畫或全站功能已通過。**
>
> 唯一固定跨聊天室接續入口：https://github.com/6zny8sjvy7-spec/voyage-travel-app/issues/2

## 本次交付
- 獨立可直接操作網站：https://6zny8sjvy7-spec.github.io/voyage-travel-app/design-previews/VOYAGE-FIDELITY-05.html
- 設計分支 GitHub commit：`189898434adac06a290bb7891c9aa89838c00e2b`
- main 僅**新增獨立預覽頁** commit：`666c157dfbd9b45a9e841b4f430d02e7d7093d8f`，原 V7 產品程式與真正使用者資料未改
- 預覽 source：`design-previews/VOYAGE-FIDELITY-05.html`，單一 HTML 自含 WebP 場景及 SVG/JavaScript
- 遠端備份 Library：`/VOYAGE/DesignReview/VOYAGE-FIDELITY-05-interactive.html`，ID `libfile_bc5d47f53e448191ad752cbca02d5811`
- 手機 390px 截圖 Library：`/VOYAGE/DesignReview/VOYAGE-FIDELITY-05-mobile-screenshot.png`，ID `libfile_73c4788630d08191b49f161a052eb172`
- 筆電 1440px 截圖 Library：`/VOYAGE/DesignReview/VOYAGE-FIDELITY-05-desktop-screenshot.png`，ID `libfile_0cd3308f51a88191be0a02ea07851769`
- 完整 QA JSON Library：`/VOYAGE/DesignReview/VOYAGE-FIDELITY-05-QA.json`，ID `libfile_5f5927247dfc819188f5b24e69f40a57`
- **核准美術原圖**：`雨中首爾旅行首頁_ui.png`，永久 Library `libfile_0136e14631cc819197ca3db158195ff8`。這次絕不使用之前被否決的替代首爾動漫/水彩圖。

## 這輪真正完成
1. 從**同一張核准原圖**的 Hero 主體（原圖位置 16,302→924,904）抽出背景，作為網頁場景。WebP quality 95；和原 PNG 的平均 RGB 絕對差異 2.02/255，約 99.4% 的像素平均每通道差異小於 12。此指標只表示圖片壓縮誤差，**非網站設計自動評分**。
2. 真 HTML：原創簡潔六大分頁、首頁動線卡與快捷入口、出發/回程日期輸入、當地日期計算倒數，視覺位置和核准圖同源；手機、筆電均適配。
3. 首爾**雨天 Canvas 動態**：小雨線和少量水面漣漪（原畫內本來也有靜態雨景，疊加只做細微補充）。晴光/雪/夜可切換，但**僅為當前畫作上色／疊層試玩，不是已製作好的獨立晴雪夜繪本場景**。
4. 行程：單日／週總覽切換、日期點選、日期上方首爾塔 SVG 小圖示跳動、左右滑動週覽；時間軸為示意。
5. 交通：四國切換的雙語靜態站名、方向、站數、展開全部車站可按；**不是完整真實 A→B 服務**。
6. 更多、翻譯、費用只設計視覺框架，原 V7 工具及匯率不能刪。
7. 原型狀態只寫入隔離鍵 `voyage-fidelity05-visual-review-only`，不接觸 `voyage-v2-review-20261112`、`voyage-v02`。

## 驗證結果／限制
- 使用 Chromium 390×844、360×780、1440×900 共 **51/51 瀏覽器功能與版面檢查通過**，0 JavaScript 錯誤：頁面導航、日期、天氣按鈕、週日切換、雙語站名與展開、切國不冒用首爾圖、橫向不溢出。
- GitHub Pages 本次部署 run `44030067183`；後續須**實際查 final conclusion** 才能說部署完成。
- **未通過且不得聲稱完成**：畫中列車與飛機目前仍為核准原圖中的靜態畫作；尚未分離成不留痕跡的可動畫圖層。先前試著清除畫中飛機與列車造成明顯雜色和變形，所以這輪寧可保留核准畫面，也不交付倒飛／重影／修補斑塊。
- 真實氣象聯動、四國完整場景/公車/鐵路、OCR、正式個人資料同步、實體 iPhone Safari 互動，均**尚未完成**。其他國家切換時首頁明示「場景尚未製作」，絕不拿首爾圖冒充。
- 使用者尚未看過並核准 Fidelity 05，**第一關仍進行中**。

## 下一步（強制恢復點）
1. 使用者用 iPhone Safari 開啟 Fidelity05，檢查是否比 Flat04 實際還原核准原畫；收集畫面、閱讀尺寸與動態回饋。
2. **列車／飛機分層：必須從核准原畫直接抽出或同筆觸精準重繪，背景處理不能有殘影，先單獨做動畫 QA 再接首頁。** 之前的倒飛/錯誤比例/無原圖背景不可再發生。
3. 以同一畫風完成獨立晴天、雪天、夜景（而非僅疊彩色濾鏡）、導入真實城市天氣與當地時間；逐場驗收。
4. 四國美術風格統一；完成首頁和全站視覺確認後才進下一個真實 V7 功能整合分支。
5. 每一個可恢復單位 GitHub commit + 更新本文件/Issue #2，避免聊天室斷點遺失；未經允許不改 root `index.html` 或 `v2-review-20261112/*`。

## 防退版檢查
- main 原 V7 測試版 `v2-review-20261112/index.html` blob SHA: `0027652b222854d9bc78d4f21940b2196e1cce20`
- main 正式首頁 `index.html` blob SHA: `acefa83e8eddfb950e22f0d6766fc626ad5da9d7`
- 兩者和 Fidelity05 發布前一致，未修改。
