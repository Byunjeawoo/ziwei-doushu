import { ko, koNode } from '@/lib/i18n/ko';
import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: "자미두수 명반 · 한국어판",
  description: "자미두수 명반을 만들고 주성, 십이궁, 대한과 유년, 고전 해설을 한국어로 살펴보세요.",
  keywords: "자미두수, 니하이샤, 자미두수전집, 자미두수전서, 골수부, 명반, 명리, 십사주성, 십이궁",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "자미두수 명반 · 한국어판",
    description: "자미두수 명반을 만들고 주성, 십이궁, 대한과 유년, 고전 해설을 한국어로 살펴보세요.",
    url: SITE_URL,
    siteName: '자미 연구',
    locale: 'ko_KR',
    type: 'website',
  },
  // 웹마스터 플랫폼 인증(인증코드를 받은 후 해당 항목을 입력하고 재배포)
  verification: {
    // Google Search Console: https://search.google.com/search-console에 사이트를 추가한 후 획득
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || undefined,
    // Bing 웹마스터 도구: https://www.bing.com/webmasters에 사이트를 추가한 후 획득
    other: {
      'msvalidate.01': process.env.NEXT_PUBLIC_BING_VERIFICATION || '808FFC6023A2C359B375DD860FEDA856',
      // 바이두 웹마스터 (라이센스 발급 후)
      'baidu-site-verification': process.env.NEXT_PUBLIC_BAIDU_VERIFICATION || '',
      // 360 웹마스터 (라이센스 발급 후)
      '360-site-verification': process.env.NEXT_PUBLIC_360_VERIFICATION || '',
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('ziwei-theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t);else document.documentElement.setAttribute('data-theme','dark');}catch(e){}})();` }} />
      </head>
      <body className="min-h-screen">
        <ThemeProvider>
          {koNode(children)}
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
