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
    }
    return Promise.reject();
  },

  /**
   * TODO(KimlikDAO-bot): Implement a robust Mina synchronizer.
   *
   * A very simple and error prone Mina sychronization method.
   * Will not survive forks.
   *
   * @param {!MinaEnv} env
   */
  async scheduled(event, env) {
    /** @const {!MerkleTree} */
    const merkleTree = /** @type {!MerkleTree} */(env.MerkleTree.get(env.MerkleTree.idFromName(LEARN2EARN)));
    /** @const {!MinaState} */
    const minaState = /** @type {!MinaState} */(env.MinaState.get(env.MinaState.idFromName("")));
    /** @const {number} */
    const lastHeight = await minaState.getHeight();
    console.log("Last height", lastHeight);

    /**
     * @typedef {{
     *   height: number
     * }}
     */
    const BlockInfo = {};

    /**
     * @typedef {{
    *   status: string
    * }}
    */
    const TransactionInfo = {};

    /**
     * @typedef {{
     *   transactionInfo: TransactionInfo,
     *   data: !Array<string>
     * }}
     */
    const EventData = {};

    /**
     * @typedef {{
     *   blockInfo: BlockInfo,
     *   eventData: !Array<EventData>
     * }}
     */
    const EventInfo = {};

    /** @type {!Array<EventInfo>} */
    let events = /** @type {!Array<EventInfo>} */(await fetch(MINA_NODE_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query: EventsQuery }),
    })
      .then((res) => res.json())
      .then((data) => /** !Array<EventInfo> */(data["data"]["events"]).filter((/** EventInfo */ e) =>
        e.eventData[0].transactionInfo.status == "applied" &&
        e.blockInfo.height > lastHeight
      )));
    events.sort((x, y) => x.blockInfo.height - y.blockInfo.height);

    for (const e of events) {
      const [type, val] = e.eventData[0].data;
      switch (type) {
        case "1":
          await merkleTree.setHeight(+val);
          console.log(`height set ${+val}`);
          break;
        case "0":
          await merkleTree.setLeaf(BigInt(val).toString(16), 1n);
          console.log(`leaf set ${val}`);
          break;
      }
    }

    if (events.length) {
      const height = +(events.pop().blockInfo.height);
      console.log(`mina state height set ${height}`);
      await minaState.setHeight(height);
    }
  },
};

export default MinaWorker;
export { MerkleTree, MinaState };
