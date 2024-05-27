import { DurableObject } from "cloudflare:workers";

// sdk/mina/HumanIDv1.InitEventUID
// const InitEventUID =
//   0x363b52a04cf908f3357575efb35b0bf635ebb4fc2e921c140e99426fb1ef89dcn;

// sdk/mina/HumanIDv1.AddEventUID
// const AddEventUID =
//   0x13c6e18cd3ba5dab50481970932ded0f7513e22ada9b77949a83dd54fc7c4e6dn;

/**
 * @implements {cloudflare.DurableObject}
 */
class MinaState extends DurableObject {
  /**
   * @param {!cloudflare.DurableObjectState} state
   * @param {!cloudflare.Environment} env
   */
  constructor(state, env) {
    super(state, env);
    /** @const {!cloudflare.DurableObjectStorage} */
    this.storage = state.storage;
    /** @type {number} */
    this.height = 0;

    state.blockConcurrencyWhile(() => state.storage.get("height")
      .then((/** number */ height) => this.height = height || 0));
  }

  /**
   * @return {number}
   */
  getHeight() {
    return this.height;
  }

  /**
   * @param {number} height
   * @return {!Promise<void>}
   */
  setHeight(height) {
    this.height = height;
    return this.storage.put("height", height);
  }

  /**
   * @returns {!Promise<void>}
   */
  async start() {
    if (await this.storage.getAlarm() != null) return;
    this.alert();
  }

  /**
   * @returns {!Promise<void>}
   */
  async alert() {
    this.storage.setAlarm(Date.now() + 1000);
  }
}

export { MinaState };
