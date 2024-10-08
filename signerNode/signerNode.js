/**
 * @fileoverview
 *
 * @author KimlikDAO
 */
import { commit } from "/edevlet/nko";
import ipfs from "/ipfs/ipfs";
import { yo } from "/meetgreet/yo";

/** @define {string} */
const NODE_URL = "node.kimlikdao.org";

/**
 * @param {string} url
 * @return {string} the pathname extracted from the url.
 */
const pathname = (url) => {
  const j = url.indexOf("?");
  url = j == -1 ? url.slice(8 + NODE_URL.length) : url.slice(8 + NODE_URL.length, j);
  return url.startsWith("/ipfs") ? "/ipfs" : url;
}

/**
 * @implements {cloudflare.ModuleWorker}
 */
const SignerNodeWorker = {
  /**
   * @override
   *
   * @param {!Request} req
   * @param {!SignerEnv} env
   * @param {!cloudflare.Context} ctx
   * @return {!Promise<!Response>|!Response}
   */
  fetch(req, env, ctx) {
    switch (pathname(req.url)) {
      case "/yo":
        return yo(req, /** @type {!YoEnv} */(env));
      case "/edevlet/nko/commit":
        return commit(req, /** @type {!NkoEnv} */(env));
      case "/edevlet/nko":
        return env.NkoWorker.fetch(req);
      case "/edevlet/oauth2":
        return env.OAuth2Worker.fetch(req);

      // IPFS endpoints have access to the persistence layer.
      // Note the IPFS data is fully encrypted on the user side by user private
      // keys.
      // Still, we cease persisting data belonging to a revoked DID. This ensures
      // that the user can always delete their persisted data on demand (even
      // though we can never see it since it's encrpted by the user private
      // keys).
      case "/ipfs":
        return ipfs.get(req, /** @type {!IpfsEnv} */(env), ctx);
      case "/api/v0/add":
        return ipfs.add(req, /** @type {!IpfsEnv} */(env), ctx);
    }
    return new Response("NAPIM?");
  }
};

globalThis["SignerNodeWorker"] = SignerNodeWorker;
export default { SignerNodeWorker };
