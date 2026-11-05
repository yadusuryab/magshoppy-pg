// components/analytics/GoogleTagManager.tsx
'use client';

import { useEffect } from 'react';

export default function GoogleTagManager() {
  useEffect(() => {
    // Load GTM script
    const script = document.createElement('script');
    script.innerHTML = `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','GTM-MJVHD99L');
    `;
    document.head.appendChild(script);
  }, []);

  return (
    <>
      {/* GTM noscript fallback */}
      <noscript>
        <iframe
          src="https://www.googletagmanager.com/ns.html?id=GTM-MJVHD99L"
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
    </>
  );
}