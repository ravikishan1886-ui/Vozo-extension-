import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Vozo Batch Assistant — Native Android 15 & Jetpack Compose',
  description: 'Native Android 15 batch video translation assistant for Vozo.ai using Firefox, Jetpack Compose, SAF, Accessibility Service, and floating HUD.',
  openGraph: {
    title: 'Vozo Batch Assistant — Native Android 15 & Jetpack Compose',
    description: 'Native Android 15 batch video translation assistant for Vozo.ai using Firefox, Jetpack Compose, SAF, Accessibility Service, and floating HUD.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vozo Batch Assistant — Native Android 15 & Jetpack Compose',
    description: 'Native Android 15 batch video translation assistant for Vozo.ai using Firefox, Jetpack Compose, SAF, Accessibility Service, and floating HUD.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
