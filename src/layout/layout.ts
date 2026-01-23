import { Graphics } from "../platform/graphics";

interface DisplayItem {
  x: number;
  y: number;
  text: string;
  fontSize: number;
}

export class Layout {
  displayList: DisplayItem[] = [];

  constructor(private content: string, private graphics: Graphics) {}

  layout() {
    this.displayList = [];
    const fontSize = 16;
    const lineHeight = fontSize * 1.25; // slightly more breathing room
    const margin = 10;
    const spaceWidth = this.graphics.measureText(" ", fontSize);
    const maxWidth = this.graphics.width - margin * 2;

    let cursorX = margin;
    let cursorY = margin; // Relative to the top of the document

    const words = this.content.split(" ");

    for (const word of words) {
      const w = this.graphics.measureText(word, fontSize);

      // Check if we need to wrap
      // If adding this word exceeds the width, move to next line
      if (cursorX + w > margin + maxWidth) {
        cursorX = margin;
        cursorY += lineHeight;
      }

      this.displayList.push({
        x: cursorX,
        y: cursorY,
        text: word,
        fontSize: fontSize,
      });

      cursorX += w + spaceWidth;
    }
  }
}