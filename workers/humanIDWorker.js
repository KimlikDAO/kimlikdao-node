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

    return Promise.all([req.text(), GenerateKeyPromise])
      .then(([
        /** @type {string} */ personKey,
        /** @type {!webCrypto.CryptoKey} */ generateKey
      ]) => generate(personKey, generateKey))
      .then(Response.json);
  }
};

globalThis["HumanIDWorker"] = HumanIDWorker;
export default HumanIDWorker;
