// Server side of برمجتي: short links (/name) backed by Netlify Blobs.
// Handlers take the stores as arguments so they can be tested without Netlify.

const SLUG_RE = /^[a-z0-9](?:[a-z0-9_.-]{1,28}[a-z0-9])$/;
const RESERVED = new Set([
  "api", "edit", "admin", "index", "index.html", "logo", "logo.png", "vendor", "www",
  "barmajti", "barmgte", "help", "about", "login", "new", "static", "assets", "netlify",
]);
const PLATFORMS = new Set([
  "instagram", "tiktok", "whatsapp", "telegram", "snapchat", "youtube", "facebook", "x", "threads",
  "linkedin", "github", "discord", "email", "phone", "location", "website", "store", "custom",
]);
const COLOR_IDS = new Set(["w", "b", "m"]);
const COLOR_PARTS = { bg: "w", btn: "m", ic: "w", tx: "b" };
const FONTS = new Set(["mada", "cairo", "tajawal", "almarai", "changa", "messiri", "reem"]);
const SHAPES = new Set(["r", "p", "s"]);

const MAX_BODY = 900 * 1024; // whole request, photo included
const MAX_IMAGE = 600 * 1024; // decoded photo bytes
const IMAGE_TYPES = new Set(["image/webp", "image/jpeg", "image/png"]);

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((x) => x.toString(16).padStart(2, "0")).join("");
}

function newKey() {
  const bytes = crypto.getRandomValues(new Uint8Array(18));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function normalizeSlug(s) {
  const slug = String(s || "").trim().toLowerCase();
  if (!SLUG_RE.test(slug) || /[_.-]{2}/.test(slug)) return { error: "invalid" };
  if (RESERVED.has(slug)) return { error: "reserved" };
  return { slug };
}

const imageUrl = (slug) => `/api/img?u=${slug}&v=${Date.now()}`;
const isOwnImageUrl = (url, slug) => new RegExp(`^/api/img\\?u=${slug.replace(/\./g, "\\.")}&v=\\d+$`).test(url);

// same rules as the page's sanitize(): anything stored is untrusted on the way back out
function cleanData(d, slug) {
  d = d && typeof d === "object" ? d : {};
  const c = d.c && typeof d.c === "object" ? d.c : {};
  const avatar = String(d.avatar || "");
  return {
    name: String(d.name || "").slice(0, 60),
    bio: String(d.bio || "").slice(0, 300),
    avatar: isOwnImageUrl(avatar, slug) || /^https:\/\/[^'"()\s]{1,500}$/.test(avatar) ? avatar : "",
    f: FONTS.has(d.f) ? d.f : "mada",
    sh: SHAPES.has(d.sh) ? d.sh : "r",
    c: Object.fromEntries(Object.entries(COLOR_PARTS).map(([k, def]) => [k, COLOR_IDS.has(c[k]) ? c[k] : def])),
    links: (Array.isArray(d.links) ? d.links : []).slice(0, 50).map((l) => ({
      p: PLATFORMS.has(l && l.p) ? l.p : "custom",
      t: String((l && l.t) || "").slice(0, 60),
      v: String((l && l.v) || "").slice(0, 500),
    })),
  };
}

function decodeImage(dataUrl) {
  const m = /^data:(image\/(?:webp|jpeg|png));base64,([A-Za-z0-9+/=]+)$/.exec(String(dataUrl || ""));
  if (!m) return null;
  const bin = atob(m[2]);
  if (bin.length > MAX_IMAGE) return { tooBig: true };
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return { type: m[1], bytes };
}

async function readBody(req) {
  const len = Number(req.headers.get("content-length") || 0);
  if (len > MAX_BODY) return { error: "too_big" };
  const text = await req.text();
  if (text.length > MAX_BODY) return { error: "too_big" };
  try {
    return { body: JSON.parse(text) };
  } catch {
    return { error: "bad_json" };
  }
}

async function owns(rec, key) {
  return !!(rec && key && typeof key === "string" && (await sha256(key)) === rec.keyHash);
}

export async function handlePage(req, { pages, images }) {
  const url = new URL(req.url);

  if (req.method === "GET") {
    const { slug, error } = normalizeSlug(url.searchParams.get("u"));
    if (error) return json({ error }, 400);
    const rec = await pages.get(slug, { type: "json" });
    if (!rec) return json({ error: "not_found" }, 404);
    // ?k= lets the owner check an edit key before loading the editor
    const k = url.searchParams.get("k");
    return json({ slug, data: rec.data, ...(k ? { owner: await owns(rec, k) } : {}) });
  }

  if (req.method === "POST") {
    const { body, error: bodyErr } = await readBody(req);
    if (bodyErr) return json({ error: bodyErr }, bodyErr === "too_big" ? 413 : 400);
    const { slug, error } = normalizeSlug(body.slug);
    if (error) return json({ error }, 400);

    const rec = await pages.get(slug, { type: "json" });
    if (rec && !(await owns(rec, body.key))) return json({ error: "taken" }, 409);

    const data = cleanData(body.data, slug);
    if (!data.name.trim()) return json({ error: "no_name" }, 400);

    if (body.avatarData) {
      const img = decodeImage(body.avatarData);
      if (!img) return json({ error: "bad_image" }, 400);
      if (img.tooBig) return json({ error: "image_too_big" }, 413);
      await images.set(slug, img.bytes, { metadata: { type: img.type } });
      data.avatar = imageUrl(slug);
    } else if (!isOwnImageUrl(data.avatar, slug)) {
      await images.delete(slug); // photo removed or replaced by an outside URL
    }

    const key = rec ? body.key : newKey();
    const now = new Date().toISOString();
    await pages.setJSON(slug, {
      data,
      keyHash: rec ? rec.keyHash : await sha256(key),
      created: rec ? rec.created : now,
      updated: now,
    });
    return json({ slug, data, ...(rec ? {} : { key }) }, rec ? 200 : 201);
  }

  if (req.method === "DELETE") {
    const { body, error: bodyErr } = await readBody(req);
    if (bodyErr) return json({ error: bodyErr }, 400);
    const { slug, error } = normalizeSlug(body.slug);
    if (error) return json({ error }, 400);
    const rec = await pages.get(slug, { type: "json" });
    if (!rec) return json({ error: "not_found" }, 404);
    if (!(await owns(rec, body.key))) return json({ error: "forbidden" }, 403);
    await pages.delete(slug);
    await images.delete(slug);
    return json({ ok: true });
  }

  return json({ error: "method" }, 405);
}

export async function handleImage(req, { images }) {
  if (req.method !== "GET") return json({ error: "method" }, 405);
  const { slug, error } = normalizeSlug(new URL(req.url).searchParams.get("u"));
  if (error) return new Response("", { status: 400 });
  const found = await images.getWithMetadata(slug, { type: "arrayBuffer" });
  if (!found) return new Response("", { status: 404 });
  const type = IMAGE_TYPES.has(found.metadata && found.metadata.type) ? found.metadata.type : "image/jpeg";
  return new Response(found.data, {
    headers: {
      "content-type": type,
      // the page links to ?v=<timestamp>, so each new photo gets a new URL
      "cache-control": "public, max-age=31536000, immutable",
      // let Netlify's CDN answer repeat requests without running the function
      "netlify-cdn-cache-control": "public, durable, max-age=31536000, immutable",
      "x-content-type-options": "nosniff",
    },
  });
}
