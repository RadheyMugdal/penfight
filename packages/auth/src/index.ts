import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import type { Database } from "@penfight/db";
import * as schema from "@penfight/db/schema/auth";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

export type AuthConfig = {
	BETTER_AUTH_URL: string;
	BETTER_AUTH_SECRET: string;
	GOOGLE_CLIENT_ID?: string;
	GOOGLE_CLIENT_SECRET?: string;
};

export function createAuth(env: AuthConfig, database: Database) {
	return betterAuth({
		baseURL: env.BETTER_AUTH_URL,
		database: drizzleAdapter(database, {
			provider: "pg",
			schema,
		}),
		emailAndPassword: { enabled: true },
		plugins: [nextCookies()],
		secret: env.BETTER_AUTH_SECRET,
		socialProviders: {
			...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
				? {
						google: {
							clientId: env.GOOGLE_CLIENT_ID,
							clientSecret: env.GOOGLE_CLIENT_SECRET,
						},
					}
				: {}),
		},
		trustedOrigins: [env.BETTER_AUTH_URL],
	});
}

export type Session = ReturnType<typeof createAuth>["$Infer"]["Session"];
