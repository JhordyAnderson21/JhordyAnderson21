import "./globals.css";
import type { Metadata } from "next";
export const metadata:Metadata={title:"CV Studio | Generador de CV profesional",description:"Crea, revisa y descarga un CV profesional con diseño y composición automática."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="es"><body>{children}</body></html>}
