"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useEffect, useState } from "react";

export default function DeskPage() {
	const params = useParams();
	const searchParams = useSearchParams();
	const router = useRouter();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		const rawCode = params.code;
		const code = Array.isArray(rawCode) ? rawCode[0] : rawCode;
		const by = searchParams.get("by");

		// If this is not an explicit spectator view (by doesn't start with 'w'),
		// seamlessly direct friend into the duel match
		if (code && !by?.startsWith("w")) {
			const q = new URLSearchParams(searchParams.toString());
			if (q.has("group")) {
				q.set("r", "g");
			} else {
				q.set("duel", code);
				q.set("r", "d");
			}
			router.replace(`/?${q.toString()}`);
			return;
		}

		setMounted(true);
	}, [params, searchParams, router]);

	return (
		<>
			<div id="app" />
			<div className="vignette" />
			{mounted ? (
				<Script
					src="/assets/index-pfd4.js"
					strategy="afterInteractive"
					type="module"
				/>
			) : null}
		</>
	);
}
