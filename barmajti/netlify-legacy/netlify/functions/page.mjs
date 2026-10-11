import { getStore } from "@netlify/blobs";
import { handlePage } from "../../../lib/api.mjs";
// read-only: pages saved before the move to Cloudflare stay readable one by one
export default (req) =>
  req.method === "GET"
    ? handlePage(req, { pages: getStore({ name: "pages", consistency: "strong" }), images: getStore({ name: "images", consistency: "strong" }) })
    : new Response(JSON.stringify({ error: "moved" }), { status: 410, headers: { "content-type": "application/json" } });
export const config = { path: "/api/page" };
