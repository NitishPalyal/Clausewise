export function getClerkAppearance(isDark: boolean) {
  return {
    variables: {
      colorForeground: isDark ? "#e6eceb" : "#14181f",
      colorMutedForeground: isDark ? "#aeb8bf" : "#5e6a6f",
      colorBackground: isDark ? "#171c20" : "#ffffff",
      colorInput: isDark ? "#20272d" : "#f0f2f0",
      colorInputForeground: isDark ? "#e6eceb" : "#14181f",
      colorBorder: isDark ? "#aeb8bf" : "#d1d9d9",
      colorNeutral: isDark ? "#e6eceb" : "#14181f",
      colorPrimary: isDark ? "#8ba8ba" : "#3e5c76",
      colorPrimaryForeground: isDark ? "#171c20" : "#ffffff",
      colorDanger: isDark ? "#e18075" : "#a23b32",
    },
  };
}

export const clerkAppearance = getClerkAppearance(false);
