import { handlePage } from "../../lib/api.mjs";
import { stores } from "../../lib/kv.mjs";

export const onRequest = ({ request, env }) => handlePage(request, stores(env));
