"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

export default function DeskPage() {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	return (
		<>
			<div id="app" />
			<div className="vignette" />
			{mounted ? (
				<Script
					src="/assets/index-DyrlfgZ-.js?v=nocaptcha"
					strategy="afterInteractive"
					type="module"
				/>
			) : null}
		</>
	);
}
