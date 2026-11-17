# VOYAGE｜Scene 07｜僅重畫飛機與兩張小卡（2026-11-17）

> **最新狀態：第一關首爾設計驗收，Scene07 已提交獨立預覽，使用者尚未核准。** 不能從本頁推定四國已完成、不能移植到原 V7。

## 使用者本輪明確限制
- 「可以但是飛機的樣子可以改嗎？……這兩個跟你自己生成的模板差很多。」
- 「會動的那台飛機的飛機形體也不好看。」
- 「整改吧，就改我說的那些就好；確認無誤後，還要做其他國家。」
- 使用者**已認可 Scene06 版面結構**；這輪只能整改 (1) 會動的飛機造型、(2) 首頁左卡「下一個行程」底部小插畫、(3) 右卡「旅行小提醒」底部小插畫；不重設其它頁或天氣功能。

## 本次已實際修改
1. **移動中的飛機 SVG 重畫**：使用單一 viewBox 164×92、奶油白圓潤機身、短機尾、珊瑚紅機翼、圓角駕駛艙與小圓窗、深藍粗描邊，機頭在右側。沿用原 Scene06 動畫軌跡與時長，不改飛行邏輯。
2. **左卡底部機場情境**：整幅全寬 SVG 含塔台、航廈、雲、草地及同一造型的小飛機（不是貼圖、不是 Emoji、不是 PNG 裁切）。
3. **右卡底部韓屋情境**：全寬 SVG 含屋簷、牆面與門、植栽與草地，深藍描邊、平塗色彩與左卡一致。
4. 卡片高度略增（142→156 px）以容納完整插畫；首頁其他元素、日期、六大分頁、交通/翻譯/費用資料、四天氣及列車全部沿用 Scene06。
5. **主程式** `design-previews/VOYAGE-SCENE-07-INTERACTIVE.html`；main **只新增**此獨立預覽，沒有修改 `Scene06` 或原 V7。
6. **新預覽網址**：https://6zny8sjvy7-spec.github.io/voyage-travel-app/design-previews/VOYAGE-SCENE-07-INTERACTIVE.html

## 版本、QA 與恢復
- 設計分支 commit：`51c3df25fec0e899ec185904a7069fa2ad72660f`
- main 獨立預覽 commit：`eb9b2f386500c95f43c7f5b82e954b5a72d8c6d2`
- 檔案 blob `11bc101826892ea09b904365c79a423861991a98`
- GitHub Pages run `44042830975`，交付前需確認 final status completed/success。
- Chromium 390×844、360×780、1440×900：**65/65 checks passed, 0 page JS errors**；檢查飛機 SVG 機頭方向、飛機向右運動、兩卡圖層全寬且未越出卡片、三尺寸無水平溢出、晴雨雪夜可切、行程日/週與交通站名展開仍能操作。
- **尚未完成 iPhone Safari 實機驗收**；美術品質仍由使用者決定。
- Library 可在下一聊天室直接找回：
  - `/VOYAGE/DesignReview/VOYAGE-SCENE-07-REVIEW.html`，ID `libfile_7d3d682fed4c8191bf26611ddcf68f4b`
  - `/VOYAGE/DesignReview/VOYAGE-SCENE-07-mobile390.png`，ID `libfile_8c34bbfb2f448191b1be15ffaa2ecce6`
  - `/VOYAGE/DesignReview/VOYAGE-SCENE-07-desktop1440.png`，ID `libfile_41c6518506a88191879d1b9d32b8e080`
  - `/VOYAGE/DesignReview/VOYAGE-SCENE-07-QA.json`，ID `libfile_20e251b287708191a5b7bd75e4ce5c2c`
- 原 Scene06 預覽 blob `642ffb843fc92483085d17a1f1e0c034ee6b8ec9`、V7 `v2-review-20261112/index.html` blob `0027652b222854d9bc78d4f21940b2196e1cce20`、根 `index.html` blob `acefa83e8eddfb950e22f0d6766fc626ad5da9d7`，**均保持不變**。預覽沿用 Scene06 孤立 localStorage key，不碰真資料。

## 下一步（不要跳步）
1. 使用者在真實 iPhone Safari 開啟 Scene07，**只驗收飛機外型、左卡機場畫面、右卡韓屋畫面**；必要時再局部修改，其他部分禁止倒退。
2. **只有當使用者明確確認三項無誤後**，才開始製作**日本、泰國、越南**各自象徵性平塗繪本場景與天氣／日期圖像，逐國逐項驗收。
3. 全站視覺核准後，再接續原 V7 真實交通／翻譯／費用／更多功能完整整合，不得偷偷替換使用者資料或重建 App。
