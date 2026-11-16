# VOYAGE｜工作斷點（自動跨聊天室復原入口）

**唯一入口：** https://github.com/6zny8sjvy7-spec/voyage-travel-app/issues/2

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
