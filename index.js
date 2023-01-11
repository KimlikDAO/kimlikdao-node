import nko from "/edevlet/nko";
import oauth2 from "/edevlet/oauth2";
import ipfs from "/ipfs/ipfs";
import yo from "/meetgreet/yo";

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
 * @param {!Parameters} param
 * @param {!Persistence} pst
 * @return {!Promise<!Response>|!Response}
 */
const handleRequest = (req, ctx, param, pst) => {
  switch (pathname(req.url)) {
    case "/yo":
      return yo.get(req, param);
    case "/edevlet/nko/commit":
      return nko.get(req, param);
    case "/edevlet/nko":
      return nko.put(req, param);
    case "/edevlet/oauth2":
      return oauth2.get(req, param);

    // IPFS endpoints have access to the persistence layer.
    // Note the IPFS data is fully encrypted on the user side by user private
    // keys.
    // Still, we cease persisting data belonging to a revoked did. This ensures
    // that the user can always delete their persisted data on demand (even
    // though we can never see it since it's encrpted by the user private
    // keys).
    case "/ipfs":
      return ipfs.get(req, ctx, pst);
    case "/api/v0/add":
      return ipfs.add(req, ctx, pst);
  }
  return new Response("NAPIM?");
}

export { handleRequest };
