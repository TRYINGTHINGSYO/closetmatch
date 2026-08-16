import { ScrollViewStyleReset } from 'expo-router/html';
import type { ReactNode } from 'react';

export default function Root({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#5E7A70" />
        <meta name="application-name" content="ClosetMatch" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta
          name="description"
          content="AI-powered personal closet, outfit recommendations, wardrobe history, laundry tracking, planning, and private Mirror Check."
        />
        <link rel="manifest" href="/manifest.webmanifest" />
        <title>ClosetMatch — Your clothes. Your style.</title>
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const responsiveBackground = `
html, body, #root {
  min-height: 100%;
}
body {
  margin: 0;
  background-color: #F3F5F4;
  overscroll-behavior-y: none;
}
#root {
  width: 100%;
}
@media (min-width: 1180px) {
  #root {
    max-width: 1180px;
    margin: 0 auto;
    box-shadow: 0 0 50px rgba(20, 32, 29, 0.08);
  }
}
@media (prefers-color-scheme: dark) {
  body {
    background-color: #111816;
  }
  @media (min-width: 1180px) {
    #root {
      box-shadow: 0 0 50px rgba(0, 0, 0, 0.3);
    }
  }
}
`;
