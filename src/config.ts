import type { TextConfig } from "./parser/html";

export const defaultTextConfig: TextConfig = {
  fontSize: 16,
  fontWeight: "normal",
};

export const layoutConfig = {
  toolbar: {
    height: 60,
    buttonRadius: 8,
    buttonSpacing: 30, // Base spacing for buttons (30, 60, 90)
    addressBarHeight: 30,
    addressBarX: 110,
    addressBarPadding: 15,
    addressBarTextYOffset: 8,
    addressBarCornerRadius: 15,
    addressBarFontSize: 16,
  },
  content: {
    paddingTop: 20,
  },
  scroll: {
    arrowKeyStep: 30,
  }
};

export const theme = {
  textColor: "black",
  toolbar: {
    background: "#f1f3f4",
    addressBarBackground: "#ffffff",
    addressBarText: "#333",
    buttons: {
      close: "#ea4335",
      minimize: "#fbbc05",
      maximize: "#34a853",
    },
  },
};
