/**
 * @author KimlikDAO
 * @externs
 */

/**
 * @interface
 * @extends {cloudflare.Environment}
 */
function OAuth2WorkerEnv() { }

/** @const {string} */
OAuth2WorkerEnv.prototype.NODE_EDEVLET_CLIENT_ID;

/** @const {string} */
OAuth2WorkerEnv.prototype.NODE_EDEVLET_CLIENT_SECRET;

/**
 * The private key chosen by the node operator. The EVM address corresponding
 * to this private key holds the TCKO-st (staked TCKOs) and is registered at
 * the `TCKTSigners` contract at `signers.kimlikdao.eth` on Avalanche-C.
 *
 * It has to be a hex string of 64 chacarte (no "0x" prefix).
 *
 * @const {string}
 */
OAuth2WorkerEnv.prototype.NODE_PRIVATE_KEY;

/** @const {!cloudflare.ModuleWorkerStub} */
OAuth2WorkerEnv.prototype.HumanIDWorker;

/** @const {!cloudflare.ModuleWorkerStub} */
OAuth2WorkerEnv.prototype.ExposureReportWorker;
