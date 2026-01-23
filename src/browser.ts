import { Graphics } from "./platform/graphics";
import { URL } from "./network/url";
import { Layout } from "./layout/layout";
import { HTMLParser } from "./parser/html";

export class Browser {
  graphics: Graphics;
  scrollY: number = 0;
  currentContent: string = "hello world";
  currentUrl: string = "";
  layoutEngine: Layout | null = null;

  constructor() {
    this.graphics = new Graphics();
    window.addEventListener("keydown", (e) => this.handleKey(e));
    window.addEventListener("wheel", (e) => this.handleScroll(e));
    window.addEventListener("resize", () => this.handleResize());

    // Initial layout for the default "hello world"
    this.layoutEngine = new Layout(this.currentContent, this.graphics);
    this.layoutEngine.layout();
  }

  // 載入 URL (這是第一章的重點，先留個空殼)
  async load(urlStr: string) {
    console.log(`Loading ${urlStr}...`);
    this.currentUrl = urlStr;

    try {
      const url = new URL(urlStr);
      const body = await url.request(); // 取得內容 (HTML 字串)
      this.currentContent = HTMLParser.parse(body); // 解析 HTML 取得純文字內容

      // Update layout with new content
      this.layoutEngine = new Layout(this.currentContent, this.graphics);
      this.layoutEngine.layout();

      // 暫時先把 HTML 原始碼直接印在螢幕上 (這是第一章的目標)
      // 下一章我們才會寫 Parser 去把這些 tag 拿掉
      this.render();
    } catch (e) {
      this.currentContent = `Error: ${e}`;
      this.layoutEngine = new Layout(this.currentContent, this.graphics);
      this.layoutEngine.layout();
      this.render();
    }
  }

  handleScroll(e: WheelEvent) {
    // 簡單的滾動邏輯
    this.scrollY += e.deltaY;
    // 防止滾過頭 (簡單限制)
    if (this.scrollY < 0) this.scrollY = 0;

    console.log(`ScrollY: ${this.scrollY}`);

    this.render();
  }

  handleResize() {
    this.graphics.resize();
    // Re-layout on resize because width changed
    if (this.layoutEngine) {
      this.layoutEngine.layout();
    }
    this.render();
  }

  handleKey(e: KeyboardEvent) {
    // 之後做向下捲動的功能
    if (e.key === "ArrowDown") {
      this.scrollY += 30;
      this.render();
    }
  }

  render() {
    this.graphics.clear();

    const toolbarHeight = 60;

    // Draw Layout Display List
    // Content starts below the toolbar
    const contentStartY = toolbarHeight + 20;

    if (this.layoutEngine) {
      for (const item of this.layoutEngine.displayList) {
        const screenY = item.y + contentStartY - this.scrollY;

        // Simple culling: don't draw if it's way off screen
        // (Optional optimization, but good practice)
        if (screenY > toolbarHeight && screenY < this.graphics.height) {
          this.graphics.createText(
            item.x,
            screenY,
            item.text,
            item.fontSize,
            "black",
          );
        }
      }
    }

    this.drawToolbar(toolbarHeight);
  }

  private drawToolbar(height: number) {
    const addressBarHeight = 30;
    const buttonRadius = 8;
    const colseButtonColor = "#ea4335";
    const collapseButtonColor = "#fbbc05";
    const maximizeButtonColor = "#34a853";
    const toolbarColor = "#f1f3f4";
    const addressBarColor = "#ffffff";

    // --- Toolbar Background ---
    this.graphics.createRectangle(
      0,
      0,
      this.graphics.width,
      height,
      toolbarColor,
    );

    // --- Navigation Buttons (Circles) ---
    const buttonY = height / 2;
    // Back
    this.graphics.createCircle(30, buttonY, buttonRadius, colseButtonColor);
    // Forward
    this.graphics.createCircle(60, buttonY, buttonRadius, collapseButtonColor);
    // Refresh
    this.graphics.createCircle(90, buttonY, buttonRadius, maximizeButtonColor);
    // --- Address Bar ---
    const addressBarX = 110;
    const addressBarWidth = Math.max(
      200,
      this.graphics.width - addressBarX - 15,
    );
    const addressBarY = (height - addressBarHeight) / 2;

    this.graphics.createRoundRect(
      addressBarX,
      addressBarY,
      addressBarWidth,
      addressBarHeight,
      15,
      addressBarColor,
    );

    // Address Bar Text
    const textY = addressBarY + 8;
    this.graphics.createText(
      addressBarX + 15,
      textY,
      this.currentUrl || "about:blank",
      16,
      "#333",
    );
  }
}
