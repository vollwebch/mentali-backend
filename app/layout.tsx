import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mentali - Tu Psicólogo Virtual',
  description: 'App de Red Social para Pensamientos con IA integrada',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
