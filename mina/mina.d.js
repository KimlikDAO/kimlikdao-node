/** @externs */

/**
 * @constructor
 * @implements {cloudflare.DurableObject}
 *
 * @param {!cloudflare.DurableObjectState} state
 * @param {!cloudflare.Environment} env
 */
const DurableObject = function (state, env) { }

/**
 * @interface
 * @extends {cloudflare.Environment}
 */
const MinaEnv = function () { }

/** @const {!cloudflare.DurableObjectBinding} */
MinaEnv.prototype.MerkleTree;
