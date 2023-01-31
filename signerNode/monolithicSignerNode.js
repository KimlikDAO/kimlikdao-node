/**
 * @fileoverview
 *
 * @author KimlikDAO
 */
import { commit } from "/edevlet/nko";
import NkoWorker from "/edevlet/nkoWorker";
import OAuth2Worker from "/edevlet/oauth2Worker";
import ipfs from "/ipfs/ipfs";
import { yo } from "/meetgreet/yo";

/**
 * @param {string} url
 * @return {string} the pathname extracted from the url.
 */
const pathname = (url) => {
  const j = url.indexOf("?");
  url = j == -1 ? url.slice(8) : url.slice(8, j);
  url = url.slice(url.indexOf("/"));
  return url.startsWith("/ipfs") ? "/ipfs" : url;
}

/**
 * @implements {cloudflare.ModuleWorker}
 */
const MonolithicSignerNode = {
  /**
   * @override
   *
   * @param {!Request} req
   * @param {!cloudflare.Environment} env
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
        return NkoWorker.fetch(req, /** @type {!NkoEnv} */(env));
      case "/edevlet/oauth2":
        return OAuth2Worker.fetch(req, /** @type {!OAuth2WorkerEnv} */(env));

      // IPFS endpoints have access to the persistence layer.
      // Note the IPFS data is fully encrypted on the user side by user private
      // keys.
      // Still, we cease persisting data belonging to a revoked did. This ensures
      // that the user can always delete their persisted data on demand (even
      // though we can never see it since it's encrpted by the user private
      // keys).
      case "/ipfs":
        return ipfs.get(req, /** @type {!IpfsEnv} */(env), ctx);
      case "/api/v0/add":
        return ipfs.add(req, /** @type {!IpfsEnv} */(env), ctx);
    }
    return new Response("NAPİM?", {
      headers: { "content-type": "text/plain;charset=utf-8" }
    });
  }
};

globalThis["MonolithicSignerNode"] = MonolithicSignerNode;
export default { MonolithicSignerNode };
