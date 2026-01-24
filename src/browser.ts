import { Graphics } from "./platform/graphics";
import { URL } from "./network/url";
import { Layout } from "./layout/layout";
import { HTMLParser } from "./parser/html";
import type { LayoutNode } from "./dom/nodes";
import { defaultTextConfig, theme, layoutConfig } from "./config";

export class Browser {
  graphics: Graphics;
  scrollY: number = 0;
  currentContent: LayoutNode[] = [];
  currentUrl: string = "";
  layoutEngine: Layout | null = null;

  constructor() {
    this.graphics = new Graphics();
    window.addEventListener("keydown", (e) => this.handleKey(e));
    window.addEventListener("wheel", (e) => this.handleScroll(e));
    window.addEventListener("resize", () => this.handleResize());

    // Initialize with empty content
    this.currentContent = [];
    this.layoutEngine = new Layout(this.currentContent, this.graphics);
    this.layoutEngine.layout();
  }

  /**
   * Loads a URL.
   * This is the entry point for navigating to a page.
   */
  async load(urlStr: string) {
    console.log(`Loading ${urlStr}...`);
    this.currentUrl = urlStr;

    try {
      const url = new URL(urlStr);
      const body = await url.request(); // Fetch content (HTML string)
      
      // Parse HTML to get the DOM tree and styles
      const { root, styles } = HTMLParser.parse(body, defaultTextConfig);

      console.log("Parsed Styles:", styles);
      this.currentContent = root;

      // Update layout with new content
      this.layoutEngine = new Layout(this.currentContent, this.graphics);
      this.layoutEngine.layout();
      this.render();
    } catch (e) {
      // Handle error by rendering the error message
      const { root } = HTMLParser.parse(`Error: ${e}`, defaultTextConfig);
      this.currentContent = root;
      this.layoutEngine = new Layout(this.currentContent, this.graphics);
      this.layoutEngine.layout();
      this.render();
    }
  }

  handleScroll(e: WheelEvent) {
    // Simple scrolling logic
    this.scrollY += e.deltaY;
    
    // Prevent scrolling past the top
    if (this.scrollY < 0) this.scrollY = 0;

    // console.log(`ScrollY: ${this.scrollY}`); // Optional debug log

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
    // ArrowDown for scrolling
    if (e.key === "ArrowDown") {
      this.scrollY += layoutConfig.scroll.arrowKeyStep;
      this.render();
    }
  }

  render() {
    this.graphics.clear();

    const toolbarHeight = layoutConfig.toolbar.height;

    // Content starts below the toolbar
    const contentStartY = toolbarHeight + layoutConfig.content.paddingTop;

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
            theme.textColor,
            item.fontWeight,
          );
        }
      }
    }

    this.drawToolbar(toolbarHeight);
  }

  private drawToolbar(height: number) {
    const addressBarHeight = layoutConfig.toolbar.addressBarHeight;
    const buttonRadius = layoutConfig.toolbar.buttonRadius;

    // --- Toolbar Background ---
    this.graphics.createRectangle(
      0,
      0,
      this.graphics.width,
      height,
      theme.toolbar.background,
    );

    // --- Navigation Buttons (Circles) ---
    const buttonY = height / 2;
    // Back
    this.graphics.createCircle(layoutConfig.toolbar.buttonSpacing, buttonY, buttonRadius, theme.toolbar.buttons.close);
    // Forward
    this.graphics.createCircle(layoutConfig.toolbar.buttonSpacing * 2, buttonY, buttonRadius, theme.toolbar.buttons.minimize);
    // Refresh
    this.graphics.createCircle(layoutConfig.toolbar.buttonSpacing * 3, buttonY, buttonRadius, theme.toolbar.buttons.maximize);
    // --- Address Bar ---
    const addressBarX = layoutConfig.toolbar.addressBarX;
    const addressBarWidth = Math.max(
      200,
      this.graphics.width - addressBarX - layoutConfig.toolbar.addressBarPadding,
    );
    const addressBarY = (height - addressBarHeight) / 2;

    this.graphics.createRoundRect(
      addressBarX,
      addressBarY,
      addressBarWidth,
      addressBarHeight,
      layoutConfig.toolbar.addressBarCornerRadius,
      theme.toolbar.addressBarBackground,
    );

    // Address Bar Text
    const textY = addressBarY + layoutConfig.toolbar.addressBarTextYOffset;
    this.graphics.createText(
      addressBarX + layoutConfig.toolbar.addressBarPadding,
      textY,
      this.currentUrl || "about:blank",
      layoutConfig.toolbar.addressBarFontSize,
      theme.toolbar.addressBarText,
    );
  }
}