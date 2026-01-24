import type { LayoutNode } from "../dom/nodes";
import { CSSParser, type StyleRule } from "./css";
import { JSParser } from "./js";

export type TextConfig = {
  fontSize: number;
  fontWeight: "normal" | "bold" | "italic";
};

export type ParsedDocument = {
  root: LayoutNode[];
  styles: StyleRule[];
};

export class HTMLParser {
  static parse(source: string, defaultConfig: TextConfig): ParsedDocument {
    const styles: StyleRule[] = [];

    // 1. Extract and Parse CSS
    // Regex matches <style ...> content </style>
    const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
    let match;
    while ((match = styleRegex.exec(source)) !== null) {
      const styleContent = match[1];
      styles.push(...CSSParser.parse(styleContent));
    }

    // 2. Extract and Parse JS (just logging for now via JSParser)
    // Regex matches <script ...> content </script>
    const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
    while ((match = scriptRegex.exec(source)) !== null) {
      const scriptContent = match[1];
      JSParser.parse(scriptContent);
    }

    // 3. Remove style and script tags from source to clean up the DOM parsing
    let cleanSource = source.replace(styleRegex, "").replace(scriptRegex, "");

    // 4. Parse DOM
    const syntheticRoot: LayoutNode = {
      fontSize: defaultConfig.fontSize,
      fontWeight: defaultConfig.fontWeight,
      children: [],
      textContent: "",
      tagName: "synthetic-root",
    };

    const stack: LayoutNode[] = [syntheticRoot];
    
    // If <body> tag exists, we wait for it. Otherwise, assume implicit body
    let inBody = !/<body/i.test(cleanSource);
    
    let currentText = "";
    let tagNameBuffer = "";
    let inTag = false;

    // Helper to flush visible text to the layout tree
    const flushText = () => {
      if (currentText.length > 0 && inBody) {
        const parent = stack[stack.length - 1];
        parent.children.push({
          fontSize: parent.fontSize,
          fontWeight: parent.fontWeight,
          children: [],
          textContent: this.decodeHTMLEntities(currentText),
        });
      }
      currentText = "";
    };

    for (let i = 0; i < cleanSource.length; i++) {
      const char = cleanSource[i];

      if (char === "<") {
        const nextChar = cleanSource[i + 1];
        if (nextChar === " " || /[0-9]/.test(nextChar)) {
          if (inBody) currentText += char;
          continue;
        }

        flushText();
        inTag = true;
        tagNameBuffer = "";
      } else if (char === ">" && inTag) {
        inTag = false;
        const tagContent = tagNameBuffer.trim();
        const isClosing = tagContent.startsWith("/");
        const tagName = isClosing ? tagContent.substring(1).toLowerCase() : tagContent.toLowerCase().split(" ")[0];

        if (tagName === "body") {
          inBody = !isClosing;
        } else if (inBody) {
          if (isClosing) {
             if (stack.length > 1) {
                stack.pop();
             }
          } else {
             const parent = stack[stack.length - 1];
             const newNode: LayoutNode = {
              fontSize: parent.fontSize,
              fontWeight: parent.fontWeight,
              children: [],
              textContent: "",
              tagName: tagName,
            };

            // User Agent Styles

            if (tagName === "b") {
              newNode.fontWeight = "bold";
            } else if (tagName === "i") {
              newNode.fontWeight = "italic";
            } else if (tagName === "small") {
              newNode.fontSize = Math.max(2, newNode.fontSize - 2);
            } else if (tagName === "big") {
              newNode.fontSize += 2;
            }

            parent.children.push(newNode);
            stack.push(newNode);
          }
        }
      } else {
        if (inTag) {
          tagNameBuffer += char;
        } else {
          if (inBody) {
            currentText += char;
          }
        }
      }
    }

    flushText();

    return { root: syntheticRoot.children, styles };
  }

  static decodeHTMLEntities(text: string): string {
    const entities: Record<string, string> = {
      "&amp;": "&",
      "&lt;": "<",
      "&gt;": ">",
      "&quot;": '"',
      "&#39;": "'",
    };
    return text.replace(/&[a-zA-Z0-9#]+;/g, (match) => {
      return entities[match] || match;
    });
  }
}
