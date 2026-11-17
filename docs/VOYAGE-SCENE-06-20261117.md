# VOYAGE｜Scene 06 天氣與交通動畫分層整改 — 2026-11-17

> **狀態：第一關視覺設計仍待使用者 Safari 驗收。** 本輪完成了動態原型的技術與 Chromium 畫面 QA；不代表整套 VOYAGE 完成，更不代表真實氣象/交通已接上。

## 使用者實際指出的錯誤
- 2026-11-17 提供 iPhone/網頁截圖：Fidelity05 的畫中列車/飛機動不了，晴／雪／夜仍有原圖自帶雨絲、切天氣像只改顏色。
- 兩張首頁提醒小卡右下角的插畫像從原圖裁切貼上，風格割裂。
- 使用者**明確接受卡片與整體版面架構**，只要求修動畫、美術呈現，不要再重做已核准的其他內頁。

## 本次實際完成的網頁
- **唯一新操作驗收網址**：https://6zny8sjvy7-spec.github.io/voyage-travel-app/design-previews/VOYAGE-SCENE-06-INTERACTIVE.html
- HTML 來源 GitHub `design-previews/VOYAGE-SCENE-06-INTERACTIVE.html`。
- 設計分支 commit `3c9cf7b4341c01e2f8b331872ca3c31d4748f768`，main 只**新增**此獨立預覽頁 commit `e9aaf8763288f31981c1b17059a3d1bbb65d83f6`；HTML blob `642ffb843fc92483085d17a1f1e0c034ee6b8ec9`。
- 專屬預覽 localStorage key `voyage-scene06-visual-review-only`，**不接觸既有 V7 使用者資料**。
- 用使用者批准的日系粗描邊平塗風建立**新的乾淨城市底圖**：南山塔/漢江/橋梁/河岸同構圖，**背景本身沒有雨、飛機、列車**。注意這是參照美術規格另外生成的 clean plate，非逐像素相同的原圖；畫風相似度仍應由使用者核准，不能聲稱 100% 還原。
- 飛機改成獨立 cream/red/navy 原創 SVG sprite，**機頭朝右，移動從畫面右半部朝右上，不再飛過左側標題**；列車為原創 6 窗多節車體 SVG，沿大橋由左往右實際滑行，兩者非 Emoji、也非原圖靜態部分。
- 天氣**真正有不同畫面元素**：
  - 晴：乾淨無雨底圖，太陽與柔和光環。
  - 雨：天色偏藍灰，Canvas 多速斜雨滴及漢江水面漣漪；沒有雨烙印於底圖。
  - 雪：獨立白色雪花粒子、淺霜與下方積雪層，無雨滴。
  - 夜：深藍天空、月亮、星光閃爍，不下雨。
  - 手動切換僅**動畫設計試玩**，尚未接四國實時天氣/日照時段，不可誤報。
- 首頁小卡維持粉色／奶油色雙卡架構，右下插畫改為整體 SVG 線稿飛機/雲及韓屋，不再使用原圖裁切貼片。
- 首頁文案改為依當前晴雨雪夜更換；六大分頁、單日週覽、日期跳動圖案、繁中/當地語言及展開車站等原版可操作示意保留。

## 客觀 QA
- Chromium 實際渲染手機 `390×844`、`360×780`，筆電 `1440×900`。
- **60/60 瀏覽器檢查通過、0 JavaScript pageerror、0 測試失敗。**
- 天氣粒子像素實測：手機390雨 1721 非透明 alpha 像素、雪 1527，晴/夜均為 **0**（這只是粒子分層驗證，不是美術品質分數）；在手機360與筆電1440結果同樣晴/夜無粒子、雨/雪各獨立。
- 連續 4 個時間點，測到 SVG 飛機與列車的 CSS 左側位置各自遞增（例：手機390 plane 328→370、train 254→360）；這可證實有移動且方向朝右，**不等同使用者 iPhone Safari 動態驗收**。
- 每個尺寸已截取四種天氣，目視確認沒有 V5 的「任何天氣都仍在下雨」問題；提醒卡 SVG 完整可見、天氣狀態欄不再截斷、文字不被飛機經過。
- 自動測試/畫面 Library：
  - 原型 `/VOYAGE/DesignReview/VOYAGE-SCENE-06-INTERACTIVE.html` ID `libfile_bb9081c74aa48191a5cd3105ca9b4cfc`
  - clean plate WebP ID `libfile_f103cc109468819185ab732f3595c85a`
  - QA JSON ID `libfile_f647c1e5c4b0819185c642c32498eee7`
  - mobile screenshots rain `libfile_865a2c64dd488191a8a4a663ad51128e`, sun `libfile_9eb71cdb6ae4819188f49d752092f5e4`, snow `libfile_09412d8b62c88191bb8d5f1516acc3fd`, night `libfile_099072f5729081919f85fb452a11936a`; desktop `libfile_8041998905588191abec9f980cbcbacf`.
- **未能使用本地 WebKit/iPhone Safari 實機**（Playwright WebKit 執行檔未安裝）。需要使用者開啟新網址驗收 iPhone 實際畫面。
- GitHub Pages run `44033450533` 對應 main commit `e9aaf8763288f31981c1b17059a3d1bbb65d83f6`；**須查 final status 才能說部署成功**。

## 禁止事項／下個工作
- **不覆蓋原 V7 測試與正式站**。main 原 V7 `v2-review-20261112/index.html` blob `0027652b222854d9bc78d4f21940b2196e1cce20`，正式 `index.html` blob `acefa83e8eddfb950e22f0d6766fc626ad5da9d7`，本次均未修改。
- 沒有四國完整城市動態畫作；切其他三國仍以「場景尚未製作」提示，其他國交通資料只是示意。
- 沒有即時天氣 API、翻譯 OCR、真交通、匯率與原本 V7 資料整合。這些都是後面功能整改，不能提早宣稱完成。
- **下一步：使用者用 iPhone Safari 驗收 Scene 06 晴雨雪夜、飛機/列車方向與小卡插畫；依回饋進一步改善與批准美術。** 經核准後逐國延伸日本／泰國／越南，最後才進真實 V7 整合分支。每一步要先更新工作斷點。
