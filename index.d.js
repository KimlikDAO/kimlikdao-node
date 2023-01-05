/**
 * @externs
 */

/**
 * @interface
 * @extends {cloudflare.Environment}
 */
function Parameters() { }

/**
 * The private key chosen by the node operator. The EVM address corresponding
 * to this private key holds the TCKO-st (staked TCKOs) and is registered at
 * the `TCKTSigners` contract at `signers.kimlikdao.eth` on Avalanche-C.
 *
 * Has to start with "0x".
 *
 * @const {string}
 */
Parameters.prototype.NODE_PRIVATE_KEY;

/**
 * The address derived from the `NODE_PRIVATE_KEY` stored here for convenience.
 * 
 * @const {string}
 */
Parameters.prototype.NODE_EVM_ADDRESS;

/**
 * Signer nodes looking to provide an `/edevlet` endpoint need a e-devlet
 * client id and client secret, obtained through a Türksat AŞ application.
 *
 * @const {string}
 */
Parameters.prototype.NODE_EDEVLET_CLIENT_ID;

/**
 * Signer nodes looking to provide an `/edevlet` endpoint need an e-devlet
 * client id and client secret, obtained through a Türksat AŞ application.
 *
 * @const {string}
 */
Parameters.prototype.NODE_EDEVLET_CLIENT_SECRET;

/**
 * The secret used in the PDF challenge generation. This secret is cycled every
 * week by KimlikDAO protocol gossip between the signers registered at
 * `TCKTSigners`.
 *
 * @type {string}
 */
Parameters.prototype.KIMLIKDAO_PDF_CHALLENGE_SECRET;

/**
 * The secret used in the HumanID generation. This secret is propagated via
 * KimlikDAO protocol gossip to `TCKTSigners`.
 *
 * @type {string}
 */
Parameters.prototype.KIMLIKDAO_HUMAN_ID_SECRET;

/**
 * This secret is never rotated and has an infinite lifetime.
 * If this secret is leaked a motivated actor may be able to brue-force the VDF
 * to obtain `localIdNumber`s from each exposureReport submitted on chain.
 *
 * Note this leaks a very small amount of information
 * (that one used a KimlikDAO DID in the past) and is deemed low risk.
 *
 * @type {string}
 */
Parameters.prototype.KIMLIKDAO_EXPOSURE_ID_SECRET;

/**
 * @interface
 * @extends {cloudflare.Context}
 */
function Context() { }
