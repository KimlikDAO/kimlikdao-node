import { DurableObject } from "cloudflare:workers";

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
}

export { MinaState };
