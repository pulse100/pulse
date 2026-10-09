import { getStore } from "@netlify/blobs";
import { handlePage } from "../../lib/api.mjs";

export default (req) =>
  handlePage(req, {
    pages: getStore({ name: "pages", consistency: "strong" }),
    images: getStore({ name: "images", consistency: "strong" }),
  });

export const config = { path: "/api/page" };
