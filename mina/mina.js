import hex from "@kimlikdao/lib/util/hex";
import { MerkleTree } from "./MerkleTree";
import { MinaState } from "./MinaState";

const LEARN2EARN = "B62qnnFm3SEtrMgStoj4SRVxKSTERh8Ho3Y9jCCa8TvgBF1mqa97Sij";

/** @define {string} */
const KIMLIKDAO_NODE_URL = "https://mina.kimlikdao.org";

/** @const {string} */
const MINA_NODE_URL = "https://api.minascan.io/archive/devnet/v1/graphql";

/** @const {string} */
const EventsQuery = `{
  events(input: { address: "B62qnnFm3SEtrMgStoj4SRVxKSTERh8Ho3Y9jCCa8TvgBF1mqa97Sij" }) {
    blockInfo {
      height
    }
    eventData {
      transactionInfo {
        status
      }
      data
    }
  }
}`;

/**
 * @implements {cloudflare.ModuleWorker}
 */
const MinaWorker = {
  /**
   * @override
   * @param {!Request} req
   * @param {!MinaEnv} env
   * @return {!Promise<!Response>}
   */
  fetch(req, env) {
    /** @const {string} */
    const pathname = req.url.slice(KIMLIKDAO_NODE_URL.length);

    if (pathname.startsWith("/witness")) {
      const address = pathname.slice("/witness/".length, "/witness/".length + 55);
      const index = hex.toBin(pathname.slice("/witness/".length + 56)).padStart(32, "0");

      /** @const {!MerkleTree} */
      const merkleTree = /** @type {!MerkleTree} */ (
        env.MerkleTree.get(env.MerkleTree.idFromName(address)));

      return merkleTree.getWitness(index).then((w) => new Response(JSON.stringify(w), {
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }}));
    }
  },

  /**
   * TODO(KimlikDAO-bot): Implement a robust Mina synchronizer.
   *
   * A very simple and error prone Mina sychronization method.
   * Will not survive forks.
   */
  async scheduled(event, env) {
    /** @const {!MerkleTree} */
    const merkleTree = env.MerkleTree.get(env.MerkleTree.idFromName(LEARN2EARN));
    /** @const {!MinaState} */
    const minaState = env.MinaState.get(env.MinaState.idFromName(""));
    /** @const */
    const lastHeight = minaState.getHeight();

    let events = await fetch(MINA_NODE_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query: EventsQuery }),
    })
      .then((res) => res.json())
      .then((data) => data["data"]["events"].filter((e) =>
        e.eventData[0].transactionInfo.status == "applied" &&
        e.blockInfo.height > lastHeight
      ));
    events.sort((x, y) => x.blockInfo.height - y.blockInfo.height);

    for (const e of events) {
      const [type, val] = e.eventData[0].data;
      switch (type) {
        case "1":
          await merkleTree.setHeight(+val);
          break;
        case "0": await merkleTree.setLeaf(
          hex.toBin(BigInt(val).toString(16) & 0xffffffffn)).padStart(32, "0");
          break;
      }
    }

    await minaState.setHeight(events[events.length - 1].blockInfo.height);
  },
};

export default MinaWorker;
export { MerkleTree, MinaState };
