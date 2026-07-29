/** AiGency design tokens for programmatic use (charts, canvas, etc.) */
export const tokens = {
  brand: {
    primary: "#007BFF",
    primaryStrong: "#0061A5",
    primarySoft: "#0D99FF",
    secondary: "#0056b3",
  },
  surface: {
    appBg: "#F8F9FA",
    cardBg: "#FFFFFF",
    inputSurface: "rgba(255, 255, 255, 0.5)",
  },
  text: {
    primary: "#1B2559",
    secondary: "#A3AED0",
    inputText: "#2e2a25",
    inputLabel: "#1b2559",
    inputLabelFocus: "#95938f",
  },
  border: {
    default: "#E9ECEF",
    input: "#d7dde5",
    inputFocus: "#1a73e8",
    gridDivider: "#eef0f4",
  },
  semantic: {
    success: "#05CD99",
    warning: "#F59E0B",
    info: "#8B5CF6",
    danger: "#EF4444",
  },
  chart: {
    primary: "#007BFF",
    secondary: "#05CD99",
    accent: "#6366F1",
  },
  radius: {
    card: 16,
    button: 12,
    input: 12,
    chip: 9999,
    modal: 16,
  },
  layout: {
    sidebarWidth: 240,
    headerHeight: 72,
    collapsedSidebarWidth: 80,
  },
  sidebar: {
    bg: "#131b2e",
    surface: "#1a2438",
    border: "rgba(255, 255, 255, 0.08)",
    text: "rgba(255, 255, 255, 0.62)",
    textMuted: "rgba(255, 255, 255, 0.4)",
    textActive: "#ffffff",
  },
} as const;
