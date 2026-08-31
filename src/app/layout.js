import { Inter } from 'next/font/google'
import './globals.css'
import DeviceProvider from '@/components/DeviceProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Minor Cleaning Service CRM',
  description: 'Find leads, track your pipeline, and grow your cleaning business',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <script
          dangerouslySetInnerHTML={{
            __html: `typeof window !== 'undefined' && (function(){var w=window.innerWidth;var d=w<768?'mobile':w<1024?'tablet':'desktop';if(document.body)document.body.dataset.device=d;})()`
          }}
        />
        <DeviceProvider>{children}</DeviceProvider>
      </body>
    </html>
  )
}
