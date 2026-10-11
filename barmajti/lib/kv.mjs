// Cloudflare KV behind the same small store interface the handlers use (get / setJSON / set / getWithMetadata / delete).
export function kvStore(kv, prefix) {
  const k = (key) => prefix + key;
  return {
    get: (key, opts) => kv.get(k(key), opts && opts.type === "json" ? { type: "json" } : undefined),
    setJSON: (key, value) => kv.put(k(key), JSON.stringify(value)),
    set: (key, bytes, opts) => kv.put(k(key), bytes, { metadata: (opts && opts.metadata) || {} }),
    async getWithMetadata(key) {
      const { value, metadata } = await kv.getWithMetadata(k(key), { type: "arrayBuffer" });
      return value === null ? null : { data: value, metadata };
    },
    delete: (key) => kv.delete(k(key)),
  };
}

export const stores = (env) => ({ pages: kvStore(env.BARMAJTI, "p:"), images: kvStore(env.BARMAJTI, "i:") });
