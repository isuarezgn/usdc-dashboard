import "./globals.css";
import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { WalletProvider } from '@/contexts/WalletContext';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'USDC Dashboard - Ethereum Testnet',
  description: 'Monitor and manage your USDC transactions on Ethereum testnet',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<ErrorBoundary>
					<WalletProvider>
						{children}
						<Toaster />
					</WalletProvider>
				</ErrorBoundary>
			</body>
		</html>
	);
}