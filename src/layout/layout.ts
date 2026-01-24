import { Graphics } from "../platform/graphics";
import type { LayoutNode } from "../dom/nodes";

interface DisplayItem {
  x: number;
  y: number;
  text: string;
  fontSize: number;
  fontWeight: "normal" | "bold" | "italic";
}

interface StyledWord {
  text: string;
  fontSize: number;
  fontWeight: "normal" | "bold" | "italic";
  width: number;
}

export class Layout {
  displayList: DisplayItem[] = [];

  constructor(private content: LayoutNode[], private graphics: Graphics) {}

  layout() {
    this.displayList = [];
    const words: StyledWord[] = [];
    this.collectWords(this.content, words);

    const margin = 10;
    const maxWidth = this.graphics.width - margin * 2;
    let cursorX = margin;
    let cursorY = margin;

    let currentLine: StyledWord[] = [];
    let maxFontSizeInLine = 0;

    const flushLine = () => {
      if (currentLine.length === 0) return;

      const lineHeight = maxFontSizeInLine * 1.25;
      let x = margin;

      for (const word of currentLine) {
        // Baseline alignment: align the bottom of the text to the bottom of the max font size box
        // y = lineTop + (maxAscent - thisAscent)
        // approximating ascent as fontSize (since we draw top-down)
        const y = cursorY + (maxFontSizeInLine - word.fontSize);

        this.displayList.push({
          x: x,
          y: y,
          text: word.text,
          fontSize: word.fontSize,
          fontWeight: word.fontWeight,
        });

        const spaceWidth = this.graphics.measureText(
          " ",
          word.fontSize,
          word.fontWeight,
        );
        x += word.width + spaceWidth;
      }

      cursorY += lineHeight;
      currentLine = [];
      maxFontSizeInLine = 0;
      cursorX = margin;
    };

    for (const word of words) {
      const spaceWidth = this.graphics.measureText(
        " ",
        word.fontSize,
        word.fontWeight,
      );

      // If the word fits, add it to the line.
      // Note: We check if adding it *would* overflow.
      if (
        currentLine.length > 0 &&
        cursorX + word.width > margin + maxWidth
      ) {
        flushLine();
      }

      currentLine.push(word);
      cursorX += word.width + spaceWidth;
      if (word.fontSize > maxFontSizeInLine) {
        maxFontSizeInLine = word.fontSize;
      }
    }

    flushLine();
  }

  private collectWords(nodes: LayoutNode[], words: StyledWord[]) {
    for (const node of nodes) {
      if (node.textContent) {
        const parts = node.textContent.split(" ");
        for (const part of parts) {
          if (part === "") continue;
          const w = this.graphics.measureText(
            part,
            node.fontSize,
            node.fontWeight,
          );
          words.push({
            text: part,
            fontSize: node.fontSize,
            fontWeight: node.fontWeight,
            width: w,
          });
        }
      }
      this.collectWords(node.children, words);
    }
  }
}