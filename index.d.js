/**
 * @externs
 */

/**
 * @interface
 * @extends {cloudflare.Environment}
 */
function Environment() { }

/**
 * The private key chosen by the node operator. The EVM address corresponding
 * to this private key holds the TCKO-st (staked TCKOs) and is registered at
 * the `TCKTSigners` contract at `signers.kimlikdao.eth` on Avalanche-C.
 *
 * @const {string}
 */
Environment.prototype.NODE_PRIVATE_KEY;

/**
 * The address derived from the `NODE_PRIVATE_KEY` stored here for convenience.
 * 
 * @const {string}
 */
Environment.prototype.NODE_EVM_ADDRESS;

/**
 * The secret used in the PDF challenge generation. This secret is cycled every
 * week by KimlikDAO protocol gossip between the signers registered at
 * `TCKTSigners`.
 *
 * @type {string}
 */
Environment.prototype.KIMLIKDAO_PDF_CHALLENGE_SECRET;

/**
 * The secret used in the HumanID generation. This secret is propagated via
 * KimlikDAO protocol gossip to `TCKTSigners`.
 *
 * @type {string}
 */
Environment.prototype.KIMLIKDAO_HUMAN_ID_SECRET;

/**
 * @type {!Cache}
 */
Environment.prototype.cache;

/** @const {cloudflare.KeyValue} */
Environment.prototype.KV;

/**
 * @interface
 * @extends {cloudflare.Context}
 */
function Context() { }
