/**
 * @fileoverview
 *
 * @author KimlikDAO
 */
import { handleRequest } from "/index";

export default {
  /**
   * @param {!Request} req
   * @param {!Environment} env
   * @param {!Context} ctx
   */
  fetch(req, env, ctx) {
    /** @const {!Persistence} */
    const persistence = /** @type {!Persistence} */({
      db: env.KV,
      cache: caches.default
    });
    delete env.KV;
    return handleRequest(req, ctx, /** @type {!Parameters} */(env), persistence);
  }
};
