import ipfs from "/ipfs/index";
import meetgreet from "/meetgreet/index";

/**
 * @param {!Request} req
 * @param {!Environment} env
 * @param {!Context} ctx
 * @return {Promise<!Response>|!Response}
 */
const handleRequest = (req, env, ctx) => {
  const url = new URL(req.url);
  env.cache = caches.default;

  switch (url.pathname) {
    case "/yo":
      return meetgreet.yo(req, env, ctx, url);
    case "/ipfs":
      return ipfs.get(req, env, ctx, url.pathname.slice(6));
    case "/api/v0/add":
      return ipfs.add(req, env, ctx);
  }
  return new Response("NAPIM?");
}

export { handleRequest };
