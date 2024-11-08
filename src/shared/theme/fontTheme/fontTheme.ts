import { Inter } from 'next/font/google';

export const fontInter = Inter({
  weight: ['400', '500', '600', '700'],
  style: ['normal'],
  subsets: ['latin'],
  display: 'swap',
});

export const fontFamily = fontInter.style.fontFamily;
