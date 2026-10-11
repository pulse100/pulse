import { getStore } from "@netlify/blobs";
import { handleImage } from "../../lib/api.mjs";

export default (req) => handleImage(req, { images: getStore({ name: "images", consistency: "strong" }) });

export const config = { path: "/api/img" };
