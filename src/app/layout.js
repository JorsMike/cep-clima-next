import './globals.css'

export const metadata = {
  title: 'Consulta CEP e Mapa Next.js',
  description: 'Projeto Final Migração React para Next.js',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="bg-default">{children}</body>
    </html>
  )
}