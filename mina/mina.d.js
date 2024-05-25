/** @externs */

/**
 * @interface
 * @extends {cloudflare.Environment}
 */
const MinaEnv = function () { }

/** @const {!cloudflare.DurableObjectBinding} */
MinaEnv.prototype.MerkleTree;

/** @const {!cloudflare.DurableObjectBinding} */
MinaEnv.prototype.MinaState;
