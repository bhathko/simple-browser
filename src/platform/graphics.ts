export class Graphics {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width!: number;
  height!: number;

  constructor() {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d")!;
    document.body.appendChild(this.canvas);

    this.resize();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  // --- Drawing commands (mimicking Tkinter API from the book) ---

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = "#ffffff"; // default white background
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  createRectangle(
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
  ) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, width, height);
  }

  createText(
    x: number,
    y: number,
    text: string,
    fontSize: number = 20,
    color: string = "black",
    fontWeight: "normal" | "bold" | "italic" = "normal",
  ) {
    this.ctx.fillStyle = color;
    const fontPart = fontWeight === "normal" ? "" : `${fontWeight} `;
    this.ctx.font = `${fontPart}${fontSize}px Arial`;
    this.ctx.textBaseline = "top"; // align text from the left top
    this.ctx.fillText(text, x, y);
  }

  createRoundRect(
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    color: string,
  ) {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.roundRect(x, y, width, height, radius);
    this.ctx.fill();
  }

  createCircle(x: number, y: number, radius: number, color: string) {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  measureText(
    text: string,
    fontSize: number = 20,
    fontWeight: "normal" | "bold" | "italic" = "normal",
  ): number {
    const fontPart = fontWeight === "normal" ? "" : `${fontWeight} `;
    this.ctx.font = `${fontPart}${fontSize}px Arial`; // Ensure font matches before measuring
    return this.ctx.measureText(text).width;
  }
}
