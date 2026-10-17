import type { Metadata } from "next";
import Script from "next/script";
import Providers from "@/components/providers";
import "../index.css";

export const metadata: Metadata = {
	title: "Pen Fight · the unofficial sport of the last bench",
	description:
		"You spent half of school flicking a pen across the desk while the teacher wrote on the board. Same game, same pens, real stakes, now in your browser: winner keeps the pen, and at the end of the bench, the Trimax.",
	icons: {
		icon: [
			{ url: "/favicon-32.png", sizes: "32x32" },
			{ url: "/favicon-16.png", sizes: "16x16" },
		],
		apple: "/apple-touch-icon.png",
	},
	manifest: "/site.webmanifest",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<meta name="pf-bundle" content="index-DyrlfgZ-.js" />
				<meta name="theme-color" content="#c4691a" />
				<meta name="color-scheme" content="dark" />
				<link
					as="font"
					crossOrigin="anonymous"
					href="/assets/fonts/patrick-hand.woff2"
					rel="preload"
					type="font/woff2"
				/>
				<link
					as="font"
					crossOrigin="anonymous"
					href="/assets/fonts/anton.woff2"
					rel="preload"
					type="font/woff2"
				/>
				<link
					as="image"
					fetchPriority="high"
					href="/assets/art/school-classroom-door.jpg"
					rel="preload"
				/>
				<link href="/assets/index-CueJ_IL1.css" rel="stylesheet" />
			</head>
			<body>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
