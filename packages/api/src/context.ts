import type { Session } from "@penfight/auth";
import type { Database } from "@penfight/db";

export type Context = {
  session: Session | null;
  db: Database;
};
