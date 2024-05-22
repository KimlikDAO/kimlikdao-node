import { DurableObject } from "cloudflare:workers";

class MinaState extends DurableObject {
  constructor(state, env) {
    super(state, env);
    /** @const {!cloudflare.DurableobjectStorage} */
    this.storage = state.storage;
    /** @type {number} */
    this.height = 0;

    state.blockConcurrencyWhile(() => state.storage.get("height")
      .then((/** nummber */ height) => this.height = height));
  }

  getHeight() {
    return this.height;
  }

  setHeight(height) {
    this.height = height;
    return this.storage.put("height", height);
  }
}

export { MinaState };
