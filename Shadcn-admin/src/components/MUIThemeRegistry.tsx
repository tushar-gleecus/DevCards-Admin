"use client";
import { ReactNode, useMemo } from "react";
import { ThemeProvider as MuiThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { useTheme } from "next-themes";

export default function MUIThemeRegistry({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();
  const theme = useMemo(() =>
    createTheme({
      palette: {
        mode: resolvedTheme === "dark" ? "dark" : "light",
      },
    }),
    [resolvedTheme]
  );
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}
