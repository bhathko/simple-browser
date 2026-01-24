import { Graphics } from "./platform/graphics";
import { URL } from "./network/url";
import { Layout } from "./layout/layout";
import { HTMLParser } from "./parser/html";
import type { LayoutNode } from "./dom/nodes";

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
      const { root, styles } = HTMLParser.parse(body, {
        fontSize: 16,
        fontWeight: "normal",
      });

      console.log("Parsed Styles:", styles);
      this.currentContent = root;

      // Update layout with new content
      this.layoutEngine = new Layout(this.currentContent, this.graphics);
      this.layoutEngine.layout();
      this.render();
    } catch (e) {
      // Handle error by rendering the error message
      const { root } = HTMLParser.parse(`Error: ${e}`, {
        fontSize: 16,
        fontWeight: "normal",
      });
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
      this.scrollY += 30;
      this.render();
    }
  }

  render() {
    this.graphics.clear();

    const toolbarHeight = 60;

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
            item.fontWeight,
          );
        }
      }
    }

    this.drawToolbar(toolbarHeight);
  }

  private drawToolbar(height: number) {
    const addressBarHeight = 30;
    const buttonRadius = 8;
    const closeButtonColor = "#ea4335";
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
    this.graphics.createCircle(30, buttonY, buttonRadius, closeButtonColor);
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