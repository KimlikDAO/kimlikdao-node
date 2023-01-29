/**
 * @fileoverview
 *
 * @author KimlikDAO
 */
import ipfs from "/ipfs/ipfs";

/**
 * @implements {cloudflare.ModuleWorker}
 */
const LightNodeWorker = {
  /**
   * @override
   *
   * @param {!Request} req
   * @param {!cloudflare.Context} ctx
   * @param {!IpfsEnv} env
   * @return {!Promise<!Response>}
   */
  fetch(req, env, ctx) {
    return req.url.endsWith("/api/v0/add")
      ? ipfs.add(req, env, ctx)
      : ipfs.get(req, env, ctx);
  }
};

globalThis["LightNodeWorker"] = LightNodeWorker;
export default LightNodeWorker;
