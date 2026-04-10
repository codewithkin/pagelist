import { createClient } from "@pagelist/auth/client";
import { env } from "@pagelist/env/web";

export const authClient = createClient(env.NEXT_PUBLIC_SERVER_URL);
