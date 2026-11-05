import type React from "react"
import type { Metadata, Viewport } from "next"
import "./globals.css"

export const metadata: Metadata = {
  icons: { icon: "/icon.svg" },
  title: "CryptoFolio - Web3 Portfolio & Trade Journal",
  description:
    "A local-first crypto portfolio tracker and trade journal. Track accounts, value holdings, and review realized performance.",
}

export const viewport: Viewport = {
  themeColor: "#f3f5fa",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
