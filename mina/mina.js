import hex from "@kimlikdao/lib/util/hex";
import { MerkleTree } from "./MerkleTree";

/** @define {string} */
const NODE_URL = "mina.kimlikdao.org";

/**
 * @implements {cloudflare.ModuleWorker}
 */
const MinaWorker = {
  /**
   * @override
   * @param {!Request} req
   * @param {!MinaEnv} env
   */
  async fetch(req, env) {
    /** @const {string} */
    const pathname = req.url.slice(NODE_URL.length + 8);

    if (pathname.startsWith("/witness")) {
      const address = pathname.slice("/witness/".length, "/witness/".length + 55);
      const index = hex.toBin(pathname.slice("/witness/".length + 56));

      /** @const {!MerkleTree} */
      const merkleTree = /** @type {!MerkleTree} */(
        env.MerkleTree.get(env.MerkleTree.idFromName(address)));

      return merkleTree.getWitness(index).then(Response.json);
    }
  }
};

export default MinaWorker;
export { MerkleTree };
