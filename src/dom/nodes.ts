export type LayoutNode = {
  fontSize: number;
  fontWeight: "normal" | "bold" | "italic";
  children: LayoutNode[];
  textContent: string;
  tagName?: string;
};
