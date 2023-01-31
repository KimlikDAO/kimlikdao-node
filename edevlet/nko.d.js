/**
 * @author KimlikDAO
 * @externs
 */

/**
 * @interface
 * @extends {cloudflare.Environment}
 */
function NkoEnv() { }

/**
 * The secret used in the NKO challenge generation. This secret is cycled every
 * week by KimlikDAO protocol gossip between the signers registered at
 * `TCKTSigners`.
 *
 * Should be a base64 encoded 32 byte string.
 *
 * @const {string}
 */
NkoEnv.prototype.KIMLIKDAO_NKO_CHALLENGE_SECRET;

/** @const {string} */
NkoEnv.prototype.KIMLIKDAO_POW_THRESHOLD;

/**
 * The private key chosen by the node operator. The EVM address corresponding
 * to this private key holds the TCKO-st (staked TCKOs) and is registered at
 * the `TCKTSigners` contract at `signers.kimlikdao.eth` on Avalanche-C.
 *
 * It has to be a hex string of 64 chacarte (no "0x" prefix).
 *
 * @const {string}
 */
NkoEnv.prototype.NODE_PRIVATE_KEY;

/** @const {string} */
NkoEnv.prototype.KIMLIKDAO_EXPOSUREREPORT_SECRET;

/** @const {string} */
NkoEnv.prototype.KIMLIKDAO_HUMANID_SECRET;

/** @const {!cloudflare.ModuleWorkerStub} */
NkoEnv.prototype.HumanIDWorker;

/** @const {!cloudflare.ModuleWorkerStub} */
NkoEnv.prototype.ExposureReportWorker;
