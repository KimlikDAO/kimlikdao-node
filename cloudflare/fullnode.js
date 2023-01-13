/**
 * @fileoverview
 *
 * @author KimlikDAO
 */
import { handleRequest } from "/index";

const Worker = {
  /**
   * @param {!Request} req
   * @param {!Environment} env
   * @param {!Context} ctx
   * @return {!Promise<!Response>|!Response}
   */
  fetch(req, env, ctx) {
    /** @const {!Persistence} */
    const persistence = /** @type {!Persistence} */({
      db: env.KV,
      cache: caches.default
    });
    return handleRequest(req, ctx, /** @type {!Parameters} */(env), persistence);
  }
};

globalThis["Worker"] = Worker;
export default Worker;
