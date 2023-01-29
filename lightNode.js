/**
 * @fileoverview
 *
 * @author KimlikDAO
 */
import ipfs from "/ipfs";

/**
 * @implements {cloudflare.ModuleWorker}
 */
const LightNodeWorker = {
  /**
   * @param {!Request} req
   * @param {!cloudflare.Environment} env
   * @param {!cloudflare.Context} ctx
   * @return {!Promise<!Response>}
   */
  fetch(req, env, ctx) {
    /** @const {!Persistence} */
    const pst = /** @type {!Persistence} */({
      db: /** @type {LightNodeEnv} */(env).KeyValue,
      cache: caches.default
    });
    return req.url.endsWith("/api/v0/add")
      ? ipfs.add(req, ctx, pst)
      : ipfs.get(req, ctx, pst);
  }
};

globalThis["LightNodeWorker"] = LightNodeWorker;
export default LightNodeWorker;
