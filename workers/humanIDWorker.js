import { generate, prepareGenerateKey } from "../lib/did/verifiableID";

/** @type {Promise<!webCrypto.CryptoKey>} */
let GenerateKeyPromise;

/**
 * @implements {cloudflare.ModuleWorker}
 */
const HumanIDWorker = {
  /**
   * @override
   *
   * @param {!Request} req
   * @param {!HumanIDEnv} env
   * @return {!Promise<!Response>}
   */
  fetch(req, env) {
    if (!GenerateKeyPromise)
      GenerateKeyPromise = prepareGenerateKey(env.KIMLIKDAO_HUMANID_SECRET);

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

globalThis["HumanIDWorker"] = HumanIDWorker;
export default HumanIDWorker;
