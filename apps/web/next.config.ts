import { varlockNextConfigPlugin } from "@varlock/nextjs-integration/plugin";

const withVarlock = varlockNextConfigPlugin();

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// The game bundle in public/assets is edited in place. Without this,
	// browsers keep an old copy for hours and can run two different builds of
	// the game side by side, which breaks online matches.
	async headers() {
		return [
			{
				headers: [
					{ key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
				],
				source: "/assets/:file*.js",
			},
		];
	},
	reactCompiler: true,
	typedRoutes: true,
};

export default withVarlock(nextConfig);
