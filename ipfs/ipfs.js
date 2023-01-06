import ipfs from '/lib/node/ipfs';

/**
 * @param {!Request} req
 * @param {!Context} ctx
 * @param {!Persistence} pst
 * @return {Promise<!Response>}
 */
const add = (req, ctx, pst) => req.formData()
  .then((form) => form.get("blob").arrayBuffer())
  .then((file) => ipfs.hash(new Uint8Array(file))
    .then((hash) => {
      /** @const {string} */
      const cid = ipfs.CID(hash);
      ctx.waitUntil(pst.db.put(cid, file));
      return new Response(`{"Hash":"${cid}"}`, {
        headers: {
          'content-type': 'application/json',
          'access-control-allow-origin': "*",
          'cache-control': 'must-revalidate,no-cache,no-store',
          'X-size': file.byteLength
        }
      });
    }));

/**
 * @param {!Request} req
 * @param {!Context} ctx
 * @param {!Persistence} pst
 * @return {Promise<!Response>}
 */
const get = (req, ctx, pst) => {
  /** @type {boolean} */
  let inCache = false;
  /** @const {Promise<Response>} */
  const fromCache = pst.cache
    .match(req.url)
    .then((response) => {
      if (!response) return Promise.reject();
      inCache = true;
      return response;
    });
  /** @const {string} */
  const cid = req.url.slice(req.url.lastIndexOf("/") + 1);
  /** @const {Promise<Response>} */
  const fromKV = pst.db.get(cid, 'arrayBuffer')
    .then((body) => {
      if (!body) return Promise.reject();
      /** @const {Response} */
      const res = new Response(body, {
        headers: {
          'cache-control': 'max-age=29030400,public,immutable',
          'content-type': 'application/json;charset=utf-8',
          'access-control-allow-origin': "*",
          'content-length': body.byteLength,
          'expires': 'Sun, 01 Jan 2034 00:00:00 GMT',
        }
      });
      ctx.waitUntil(Promise.resolve().then(() => {
        if (!inCache) pst.cache.put(req.url, res.clone())
      }));
      return res;
    });
  return Promise.any([fromCache, fromKV]);
}

export default {
  get,
  add,
};
