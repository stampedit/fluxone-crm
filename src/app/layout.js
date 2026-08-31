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
        <DeviceProvider>{children}</DeviceProvider>
      </body>
    </html>
  )
}
