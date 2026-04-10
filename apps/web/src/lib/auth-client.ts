import { createAuthClient } from "@pagelist/auth/client";
import { env } from "@pagelist/env/web";

export const authClient = createAuthClient(env.NEXT_PUBLIC_SERVER_URL);
