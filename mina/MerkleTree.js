import { poseidon } from "@kimlikdao/lib/crypto/poseidon";
import hex from "@kimlikdao/lib/util/hex";
import {
  BinaryKey,
  HexKey,
  MerkleTree as IMerkleTree,
  Value,
  WitnessElem,
} from "@kimlikdao/lib/util/merkleTree";
import { DurableObject } from "cloudflare:workers";

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
const toInvKey = (key) =>
  key ? key.slice(0, -1) + +(key.charCodeAt(key.length - 1) == 48) : "r";

/**
 * @implements {cloudflare.DurableObject}
 * @implements {IMerkleTree}
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

    state.blockConcurrencyWhile(() =>
      state.storage
        .get("height")
        .then((/** number */ height) => this._setHeight(height || 0))
    );
  }

  /**
   * @private
   *
   * @param {number} height
   */
  _setHeight(height) {
    if (this.height) throw `Initialized ${this.height}, ${height}`;
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
   * @override
   *
   * @param {BinaryKey} key
   * @return {!Promise<Value>}
   */
  getNode(key) {
    return this.storage
      .get(toInvKey(key))
      .then((/** Value */ val) => val || this.zeros[key.length]);
  }

  /**
   * @override
   *
   * @param {HexKey} key
   * @param {Value} val
   * @return {!Promise<Value>} the root after insertion
   */
  setLeaf(key, val) {
    return this._getWitness(key).then(({ witness, key }) => {
      /** @const {!Object<InvKey, Value>} */
      const entries = {};
      for (const w of witness) {
        key = key.slice(0, -1);
        entries[key + +w.isLeft] = val;
        val = poseidon(w.isLeft ? [val, w.sibling] : [w.sibling, val]);
      }
      entries["r"] = val;
      return this.storage.put(entries).then(() => val);
    });
  }

  /**
   * @override
   *
   * @param {HexKey} key
   * @return {!Promise<!Array<WitnessElem>>}
   */
  getWitness(key) {
    return this._getWitness(key).then((val) => val.witness);
  }

  /**
   * @param {HexKey} key
   * @return {!Promise<{
   *   witness: !Array<WitnessElem>,
   *   key: BinaryKey
   * }>}
   */
  _getWitness(key) {
    const h = this.height;
    key = hex.toBinary(key).padStart(h, "0").slice(0, h);
    /** @const {!Array<string>} */
    const keys = Array(h);
    for (let i = 0; i < h; ++i) keys[i] = key.slice(0, i + 1);
    return this.storage.get(keys).then((/** !Map<string, Value> */ map) => {
      /** @const {!Array<WitnessElem>} */
      const witness = Array(h);
      /** @type {number} */
      let i = 0;
      for (const k of keys)
        witness[h - ++i] = {
          isLeft: k.charCodeAt(i - 1) == 48,
          sibling: map.get(k) || this.zeros[i],
        };
      return { witness, key };
    });
  }
}

export { HexKey, MerkleTree, WitnessElem };
