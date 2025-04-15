import { env } from "cloudflare:workers";

export default {
  "/docs": env.DOCS
} as Record<string, string>
