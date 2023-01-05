import oauth2 from "/devlet/oauth2";
import pdf from "/edevlet/pdf";
import ipfs from "/ipfs/ipfs";
import yo from "/meetgreet/yo";

/**
 * The persistence layer of the KimlikDAO protocol full node.
 *
 * We only require eventual consistency and guarantee that each key corresponds
 * to only one value ever. (keys are content hashes)
 *
 * @interface
 */
function Persistence() { }

/**
 * @type {!Cache}
 */
Persistence.prototype.cache;

/** @const {cloudflare.KeyValue} */
Persistence.prototype.db;

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
 * REST api entry point for full-node.
 *
 * @param {!Request} req
 * @param {!Context} ctx
 * @param {!Environment} env
 * @param {!Persistence} db
 * @return {Promise<!Response>|!Response}
 */
const handleRequest = (req, ctx, env, db) => {
  switch (pathname(req.url)) {
    case "/yo":
      return yo.get(req, ctx, env);
    case "/edevlet/pdf/commit":
      return pdf.get(req, env);
    case "/edevlet/pdf":
      return pdf.put(req, env);
    case "/edevlet/oauth2":
      return oauth2.get(req, ctx, env);

    // IPFS endpoints have access to the persistence layer.
    // Note the IPFS data is fully encrypted on the user side by user private
    // keys.
    // Still, we cease persisting data belonging to a revoked did. This ensures
    // that the user can always delete their persisted data on demand (even
    // though we can never see it since it's encrpted by the user private
    // keys).
    case "/ipfs":
      return ipfs.get(req, ctx, db);
    case "/api/v0/add":
      return ipfs.add(req, ctx, db);
  }
  return new Response("NAPIM?");
}

export { handleRequest };
