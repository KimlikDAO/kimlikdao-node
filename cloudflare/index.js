/**
 * @fileoverview
 *
 * @author KimlikDAO
 */
import { handleRequest } from "/index";

export default {
  fetch(req, env, ctx) {
    /** @const {!Persistence} */
    const persistence = {
      db: env.KV,
      cache: caches.default
    }
    delete env.KV;
    return handleRequest(req, env, ctx, persistence);
  }
};
