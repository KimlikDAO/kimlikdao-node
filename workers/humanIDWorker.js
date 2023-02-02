import { generate, prepareGenerateKey } from "../lib/did/verifiableID";

/** @define {string} */
const BEARER_TOKEN = "BEARER_TOKEN_PLACEHOLDER";

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
   * @return {!Promise<!Response>|!Response}
   */
  fetch(req, env) {
    if (req.headers.get("authorization").slice(7) != BEARER_TOKEN)
      return Response.error();

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
