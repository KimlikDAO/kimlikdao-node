import { generate, prepareGenerateKey } from "../lib/did/verifiableID";

/** @type {Promise<!webCrypto.CryptoKey>} */
let GenerateKeyPromise;

/**
 * @implements {cloudflare.ModuleWorker}
 */
const ExposureReportWorker = {
  /**
   * @override
   *
   * @param {!Request} req
   * @param {!ExposureReportEnv} env
   * @return {!Promise<!Response>}
   */
  fetch(req, env) {
    if (!GenerateKeyPromise)
      GenerateKeyPromise = prepareGenerateKey(env.KIMLIKDAO_EXPOSUREREPORT_SECRET);

    /** @const {number} */
    const idx = req.url.slice(8).indexOf("/");
    /** @const {string} */
    const personKey = req.url.slice(idx + 9);

    return GenerateKeyPromise
      .then((/** @type {!webCrypto.CryptoKey} */ generateKey) =>
        generate(personKey, generateKey))
      .then(Response.json);
  }
};

globalThis["ExposureReportWorker"] = ExposureReportWorker;
export default ExposureReportWorker;
