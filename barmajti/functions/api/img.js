import { handleImage } from "../../lib/api.mjs";
import { stores } from "../../lib/kv.mjs";

// photo URLs carry ?v=<timestamp>, so a cached copy never goes stale; this keeps KV reads low
export async function onRequest({ request, env, waitUntil }) {
  if (request.method !== "GET") return handleImage(request, stores(env));
  const cache = caches.default;
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await handleImage(request, stores(env));
  if (res.ok) waitUntil(cache.put(request, res.clone()));
  return res;
}
