import { ReactNode } from "react";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import MUIThemeRegistry from "@/components/MUIThemeRegistry";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import "react-phone-input-2/lib/style.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <head>
        {/* ✅ Manual favicon inclusion */}
        <link rel="icon" href="/devhub-favicon-yellow.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="/devhub-favicon-yellow.ico" type="image/x-icon" />
        <title>DevHubs Admin</title>
        <meta name="description" content="Modern Admin Dashboard" />
      </head>
      <body className={[inter.className, "min-h-screen", "antialiased"].join(" ")}>
        <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange enableSystem={false}>
          <MUIThemeRegistry>
            {children}
            <Toaster />
          </MUIThemeRegistry>
        </ThemeProvider>
      </body>
    </html>
  );
}
