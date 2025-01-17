
export const metadata = {
  title: 'TurbOmics',
  description: 'A web-based platform for the analysis of untargeted metabolomics with multi-omics integrative approach',
}

import { Roboto } from 'next/font/google'

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  styles: ["italic", "normal"],
  subsets: ['latin']
})

import './global.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
          integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM"
          crossOrigin="anonymous"
        />

      </head>
      <body className={roboto.className}>
          {children}
        <script src="https://cdn.jsdelivr.net/npm/danfojs@1.1.2/lib/bundle.min.js" async />
      </body>
    </html>
  )
}
