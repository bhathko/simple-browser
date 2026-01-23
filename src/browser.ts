import { Graphics } from "./platform/graphics";
import { URL } from "./network/url";

export class Browser {
  graphics: Graphics;
  scrollY: number = 0;
  currentContent: string = "hello world";
  currentUrl: string = "";

  constructor() {
    this.graphics = new Graphics();
    window.addEventListener("keydown", (e) => this.handleKey(e));
    window.addEventListener("wheel", (e) => this.handleScroll(e));
    window.addEventListener("resize", () => this.handleResize());
  }

  // this is a simple load function that fetches the URL content
  async load(urlStr: string) {
    console.log(`Loading ${urlStr}...`);
    this.currentUrl = urlStr;

    try {
      const url = new URL(urlStr);
      const body = await url.request(); // 取得內容 (HTML 字串)
      this.currentContent = body;

      // Currently, we just render the raw content as text
      // In later chapters, we will implement HTML parsing and rendering
      this.render();
    } catch (e) {
      this.currentContent = `Error: ${e}`;
      this.render();
    }
  }

  handleScroll(e: WheelEvent) {
    // A simple scroll implementation
    this.scrollY += e.deltaY;
    // Prevent scrolling too far
    if (this.scrollY < 0) this.scrollY = 0;

    console.log(`ScrollY: ${this.scrollY}`);

    this.render();
  }

  handleResize() {
    this.graphics.resize();
    this.render();
  }

  handleKey(e: KeyboardEvent) {
    // Todo: implement scroll feature
    if (e.key === "ArrowDown") {
      this.scrollY += 40;
      this.render();
    }
  }

  render() {
    this.graphics.clear();

    const toolbarHeight = 80;

    // simple render content as plain text
    this.graphics.createText(
      10,
      toolbarHeight + 20 - this.scrollY,
      this.currentContent,
      16,
      "black",
    );

    this.drawToolbar(toolbarHeight);
  }

  private drawToolbar(height: number) {
    const addressBarHeight = 30;
    const buttonRadius = 8;
    const closeButtonColor = "#ea4335";
    const collapseButtonColor = "#fbbc05";
    const expandButtonColor = "#34a853";
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
    this.graphics.createCircle(30, buttonY, buttonRadius, closeButtonColor);
    // Forward
    this.graphics.createCircle(60, buttonY, buttonRadius, collapseButtonColor);
    // Refresh
    this.graphics.createCircle(90, buttonY, buttonRadius, expandButtonColor);
    // --- Address Bar ---
    const addressBarX = 110;
    const addressBarWidth = Math.max(
      200,
      this.graphics.width - addressBarX - 20,
    );
    const addressBarY = (height - addressBarHeight) / 2;

    this.graphics.createRoundRect(
      addressBarX,
      addressBarY,
      addressBarWidth,
      addressBarHeight,
      20,
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
