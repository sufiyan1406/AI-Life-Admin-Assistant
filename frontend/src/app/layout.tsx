import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Life Admin Assistant',
  description: 'Convert unstructured personal information into structured tasks and reminders.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full bg-slate-950 font-sans">
      <body className={`${inter.className} h-full flex overflow-hidden text-slate-200 antialiased selection:bg-indigo-500/30 selection:text-indigo-200`}>
        <Sidebar />
        <main className="flex-1 overflow-y-auto h-full scroll-smooth">
          {children}
        </main>
      </body>
    </html>
  );
}
