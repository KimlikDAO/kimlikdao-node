/**
 * @externs
 */

/**
 * @interface
 * @extends {cloudflare.Environment}
 */
function SignerEnv() {}

/** @const {!cloudflare.DurableObjectBinding} */
SignerEnv.prototype.NkoWorker;

/** @const {!cloudflare.DurableObjectBinding} */
SignerEnv.prototype.OAuth2Worker;
