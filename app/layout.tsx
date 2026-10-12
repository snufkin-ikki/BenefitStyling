import type { Metadata } from "next";
import "./globals.css";
export const metadata:Metadata={title:"Benefit Styling｜企業・団体の事前登録",description:"オシャレ特化の福利厚生 Benefit Styling。サービス公開に向け、企業・団体・学校・病院の事前登録を受付中です。",icons:{icon:"/favicon.png"}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ja"><body>{children}</body></html>}
