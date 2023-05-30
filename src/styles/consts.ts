export const consts = {
  layout: {
    desktopMinWidth: "768px",
    desktopPageMaxWidth: "768px",
  } as const,
  colors: {
    darkLead: "#171923",
    mainLead: "#008080",
    lightLead: "#80FFFF",
    white: "#FFFFFF",
    black: "#000000",
    lightGray: "#E8E8E8",
    darkGray: "#686868",
  },
} as const;

const baseGridValue = 4;

export const baseGrid = (multiply: number): string =>
  `${baseGridValue * multiply}px`;

export const standardBorderRadiusBig = "12px";
export const standardBorderRadiusSmall = "8px";
