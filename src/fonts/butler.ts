import localFont from 'next/font/local';

// Carrega somente os pesos realmente utilizados no design.json para headings
// (light 300, regular 400, medium 500) para reduzir preloads.
export const butler = localFont({
  src: [
    {
      path: '../../public/Butler_Webfont/Butler-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/Butler_Webfont/Butler-Light.woff',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/Butler_Webfont/Butler.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/Butler_Webfont/Butler.woff',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/Butler_Webfont/Butler-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/Butler_Webfont/Butler-Medium.woff',
      weight: '500',
      style: 'normal',
    },
  ],
  variable: '--font-butler',
  display: 'swap',
  preload: true,
});


