import { MerkleTree } from "./MerkleTree";
import { MinaState } from "./MinaState";

/** @define {string} */
const KIMLIKDAO_NODE_URL = "https://mina.kimlikdao.org";

/**
 * @implements {cloudflare.ModuleWorker}
 */
const MinaWorker = {
  /**
   * @override
   * @param {!Request} req
   * @param {!MinaEnv} env
   * @return {!Promise<!Response>|!Response}
   */
  fetch(req, env) {
    /** @const {string} */
    const pathname = req.url.slice(KIMLIKDAO_NODE_URL.length);

    if (pathname.startsWith("/witness")) {
      const address = pathname.slice("/witness/".length, "/witness/".length + 55);
      const index = pathname.slice("/witness/".length + 56);

      /** @const {!MerkleTree} */
      const merkleTree = /** @type {!MerkleTree} */ (
        env.MerkleTree.get(env.MerkleTree.idFromName(address)));

      return merkleTree.getWitness(index).then((witness) =>
        new Response(JSON.stringify(witness.map((w) => /** @type {mina.Witness} */({
          sibling: w.sibling.toString(16),
          isLeft: w.isLeft
        }))), {
          headers: {
            'content-type': 'application/json',
            'access-control-allow-origin': '*'
          }
        })
      );
    } else if (pathname == "/start") {
      const id = env.MinaState.idFromName("");
      console.log(id);
      /** @type {!MinaState} */(env.MinaState.get(id)).start();
      return new Response();
    }
    return Promise.reject();
  },
};

export default MinaWorker;
export { MerkleTree, MinaState };
