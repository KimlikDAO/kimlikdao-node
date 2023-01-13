/**
 * @fileoverview
 *
 * @author KimlikDAO
 */
import ipfs from "../ipfs";

const Worker = {
  /**
   * @param {!Request} req
   * @param {!Environment} env
   * @param {!Context} ctx
   * @return {!Promise<!Response>|!Response}
   */
  fetch(req, env, ctx) {
    /** @const {!Persistence} */
    const pst = /** @type {!Persistence} */({
      db: env.KV,
      cache: caches.default
    });
    return req.url.endsWith("/api/v0/add")
      ? ipfs.add(req, ctx, pst)
      : ipfs.get(req, ctx, pst);
  }
};

globalThis["Worker"] = Worker;
export default Worker;
