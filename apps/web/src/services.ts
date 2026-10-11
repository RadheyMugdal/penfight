import { createAuth } from "@penfight/auth";
import { createDb } from "@penfight/db";

import { ENV } from "./env.server";

export const db = createDb(ENV);
export const auth = createAuth(ENV, db);
