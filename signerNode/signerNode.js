/**
 * @fileoverview
 *
 * @author KimlikDAO
 */
import { getCommitment, NkoWorker } from "/edevlet/nko";
import { OAuth2Worker } from "/edevlet/oauth2Worker";
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
const SignerNodeWorker = {
  /**
   * @override
   *
   * @param {!Request} req
   * @param {!cloudflare.Environment} env
   * @param {!cloudflare.Context} ctx
   * @return {!Promise<!Response>|!Response}
   */
  fetch(req, env, ctx) {
    /** @const {!SignerEnv} */
    const signerEnv = /** @type {!SignerEnv} */(env);

    switch (pathname(req.url)) {
      case "/yo":
        return yo(req, /** @type {!YoEnv} */(env));
      case "/edevlet/nko/commit":
        return getCommitment(req, /** @type {!NkoEnv} */(env));
      case "/edevlet/nko": {
        /** @const {!cloudflare.DurableObjectId} */
        const nkoWorkerId = signerEnv.NkoWorker.newUniqueId();
        /** @const {!cloudflare.DurableObjectStub} */
        const nkoWorkerStub = signerEnv.NkoWorker.get(nkoWorkerId, {
          locationHint: "eeur"
        });
        return nkoWorkerStub.fetch(req);
      }
      case "/edevlet/oauth2": {
        /** @const {!cloudflare.DurableObjectId} */
        const oauth2WorkerId = signerEnv.OAuth2Worker.newUniqueId();
        /** @const {!cloudflare.DurableObjectStub} */
        const oauth2WorkerStub = signerEnv.OAuth2Worker.get(oauth2WorkerId, {
          locationHint: "eeur"
        });
        return oauth2WorkerStub.fetch(req);
      }

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
    return new Response("NAPIM?");
  }
};

globalThis["exports"] = {
  "NkoWorker": NkoWorker,
  "OAuth2Worker": OAuth2Worker
}
globalThis["SignerNodeWorker"] = SignerNodeWorker;
export {
  NkoWorker,
  OAuth2Worker,
  SignerNodeWorker as default
};
