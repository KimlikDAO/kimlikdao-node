import { poseidon } from "@kimlikdao/lib/crypto/poseidon";
import { DurableObject } from "cloudflare:workers";

/** @typedef {string} */
const BinaryKey = {};

/**
 * In InvKey, the last bit is inverted. This achieves some optimizations
 * with how batch data loads are handled with DurableObjects.
 *
 * @typedef {string}
 */
const InvKey = {};

/**
 * @param {BinaryKey} key
 * @return {InvKey}
 */
const toInvKey = (key) => key
 ? key.slice(0, -1) + +(key.charCodeAt(key.length - 1) == 48)
 : "r";

/**
 * @implements {cloudflare.DurableObject}
 */
class MerkleTree extends DurableObject {
  /**
   * @override
   *
   * @param {!cloudflare.DurableObjectState} state
   * @param {!cloudflare.Environment} env
   */
  constructor(state, env) {
    super(state, env);
    /** @const {!cloudflare.DurableObjectStorage} */
    this.storage = state.storage;
    /** @type {number} */
    this.height = 0;
    /** @type {!Array<!bigint>} */
    this.zeros = [];

    state.blockConcurrencyWhile(() => state.storage.get("height")
      .then((/** number */ height) => this._setHeight(height || 0)));
  }

  /**
   * @private
   *
   * @param {number} height
   */
  _setHeight(height) {
    if (this.height) throw `Initialized ${this.height}`;
    /** @const {!Array<!bigint>} */
    const zeros = Array(height + 1);
    /** @const {!Array<!bigint>} */
    zeros[height] = 0n;
    for (let i = height; i > 0; --i)
      zeros[i - 1] = poseidon([zeros[i], zeros[i]]);
    this.height = height;
    this.zeros = zeros;
  }

  /**
   * @param {number} height
   * @return {!Promise<void>}
   */
  setHeight(height) {
    this._setHeight(height);
    return this.storage.put("height", height);
  }

  /**
   * @param {BinaryKey} key
   * @return {!Promise<!bigint>}
   */
  getNode(key) {
    return this.storage.get(toInvKey(key)).then((/** !bigint */ val) => val || this.zeros[key.length]);
  }

  /**
   * @param {BinaryKey} key
   * @param {!bigint} val
   * @return {!Promise<!bigint>} the root after insertion
   */
  setLeaf(key, val) {
    return this.getWitness(key).then((witness) => {
      /** @const {!Object<InvKey, !bigint>} */
      const entries = {};
      for (const w of witness) {
        key = key.slice(0, -1);
        entries[key + (+w.isLeft)] = val;
        val = poseidon(w.isLeft ? [val, w.sibling] : [w.sibling, val]);
      }
      entries["r"] = val;
      return this.storage.put(entries).then(() => val);
    });
  }

  /**
   * @param {BinaryKey} key
   * @return {!Promise<!Array<mina.Witness>>}
   */
  getWitness(key) {
    const h = key.length;
    /** @const {!Array<string>} */
    const keys = Array(h);
    for (let i = 0; i < h; ++i)
      keys[i] = key.slice(0, i + 1);
    return this.storage.get(keys).then((/** !Map<string, !bigint> */ map) => {
      /** @const {!Array<mina.Witness>} */
      const witness = Array(h);
      /** @type {number} */
      let i = 0;
      for (const k of keys)
        witness[h - ++i] = {
          isLeft: k.charCodeAt(i - 1) == 48,
          sibling: map.get(k) || this.zeros[i]
        }
      return witness;
    });
  }
}

export { MerkleTree };
