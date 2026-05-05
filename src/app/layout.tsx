import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter, Lexend } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

/** Neo-grotesk sans — đọc tốt trên UI dài, có subset tiếng Việt. */
const fontSans = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

/** Sans riêng cho tiêu đề — phân tầng rõ, vẫn “product”, không kiểu display quá đậm. */
const fontHeading = Lexend({
  subsets: ["latin", "vietnamese"],
  variable: "--font-lexend",
  display: "swap",
});

/** Mono gọn, dễ đọc cho ID/mã/thời gian trong bảng. */
const fontMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sport Booking",
  description: "Book sports venues and courts with a modern experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${fontSans.variable} ${fontHeading.variable} ${fontMono.variable} light h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
