import type { Metadata } from "next"
import { Kaisei_Decol, Nunito } from "next/font/google"
import "./globals.css"
import { AppSidebar } from "@/components/app-sidebar"

const nunito = Nunito({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
})

const kaiseiDecol = Kaisei_Decol({
  variable: "--font-heading-display",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
})

export const metadata: Metadata = {
  title: "ひとなりDB - 人材紹介管理システム",
  description: "求職者管理・選考管理・CSV出力・ダッシュボード集計を一元管理",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className={`${nunito.variable} ${kaiseiDecol.variable} h-full antialiased`}>
      <body className="fantasy-app h-full bg-background text-foreground">
        <div className="relative flex min-h-screen overflow-hidden">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="fantasy-orb fantasy-orb-a" />
            <div className="fantasy-orb fantasy-orb-b" />
            <div className="fantasy-orb fantasy-orb-c" />
            <div className="fantasy-wave fantasy-wave-top" />
            <div className="fantasy-wave fantasy-wave-bottom" />
          </div>
          <AppSidebar />
          <main className="relative z-10 min-w-0 flex-1 overflow-auto">
            <div className="min-h-screen px-2 py-2 md:px-3 md:py-3">{children}</div>
          </main>
        </div>
      </body>
    </html>
  )
}
