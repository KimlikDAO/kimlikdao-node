/**
 * @externs
 */

/**
 * @interface
 */
function Parameters() { }

/**
 * @interface
 * @extends {cloudflare.Environment}
 */
function Environment() {}

/** @type {!cloudflare.KeyValue} */
Environment.prototype.KV;

/**
 * The private key chosen by the node operator. The EVM address corresponding
 * to this private key holds the TCKO-st (staked TCKOs) and is registered at
 * the `TCKTSigners` contract at `signers.kimlikdao.eth` on Avalanche-C.
 *
 * It has to be a hex string of 64 chacarte (no "0x" prefix).
 *
 * @const {string}
 */
Parameters.prototype.NODE_PRIVATE_KEY;

/**
 * The address derived from the `NODE_PRIVATE_KEY` stored here for convenience.
 *
 * A length 42 hex string starting with "0x".
 *
 * @const {string}
 */
Parameters.prototype.NODE_EVM_ADDRESS;

/**
 * Signer nodes looking to provide an `/edevlet/oauth2` endpoint need an
 * e-devlet client id and client secret, obtained through a Türksat A.Ş.
 * application.
 *
 * @const {string}
 */
Parameters.prototype.NODE_EDEVLET_CLIENT_ID;

/**
 * Signer nodes looking to provide an `/edevlet/oauth2` endpoint need an
 * e-devlet client id and client secret, obtained through a Türksat A.Ş.
 * application.
 *
 * @const {string}
 */
Parameters.prototype.NODE_EDEVLET_CLIENT_SECRET;

/**
 * The secret used in the PDF challenge generation. This secret is cycled every
 * week by KimlikDAO protocol gossip between the signers registered at
 * `TCKTSigners`.
 *
 * Should be a base64 encoded 32 byte string.
 *
 * @type {string}
 */
Parameters.prototype.KIMLIKDAO_PDF_CHALLENGE_SECRET;

/**
 * The secret used in the HumanID generation. This secret is propagated via
 * KimlikDAO protocol handshake to `TCKTSigners`.
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

/** @type {string} */
Parameters.prototype.KIMLIKDAO_POW_THRESHOLD;

/**
 * @interface
 * @extends {cloudflare.Context}
 */
function Context() { }

/**
 * The persistence layer of the KimlikDAO protocol full node.
 *
 * We only require eventual consistency and guarantee that each key corresponds
 * to only one value ever. (keys are content hashes)
 *
 * @interface
 */
function Persistence() { }

/**
 * @type {!Cache}
 */
Persistence.prototype.cache;

/** @const {!cloudflare.KeyValue} */
Persistence.prototype.db;
