import { generateCommitment } from "./nko";
import { getValidatingTckt, ValidatingTckt } from "./nkoParser";
import { validatePoW, validateTimestamp } from "./validation";
import { sign } from "/lib/did/decryptedSections";
import { err, ErrorCode, errorResponse, reject } from "/lib/node/error";
import { base64, base64ten } from "/lib/util/çevir";

/** @const {!Object<string, string>} */
const HEADERS = {
  'content-type': 'application/json;charset=utf-8',
  'access-control-allow-origin': '*',
  'cache-control': 'private,no-cache',
};

/** @define {string} */
const WORKER_NAME = "kimlikdao-node";

/** @define {string} */
const CF_ACCOUNT_NAME = "kimlikdao";

/** @define {string} */
const BEARER_TOKEN = "BEARER_TOKEN_PLACEHOLDER";

/**
 * Given a NKO (Nüfus kayıt örneği), parses the NKO, validates it against
 * e-devlet and signs it.
 *
 * The input data is processed and sent back to the user withouut ever saving
 * it to disk or any other persistence layer.
 *
 * @implements {cloudflare.ModuleWorker}
 */
const NkoWorker = {
  /**
   * @override
   *
   * @param {!Request} req
   * @param {!NkoEnv} env
   * @return {!Promise<!Response>|!Response}
   */
  fetch(req, env) {
    if (req.method !== "POST")
      return err(405, ErrorCode.INVALID_REQUEST);

    // (1) Parse the url.
    /** @const {number} */
    const idx = req.url.indexOf('?');
    /** @const {!Uint8Array} */
    const commitPow = base64ten(req.url.slice(idx + 1, idx + 97));
    /** @const {number} */
    const remoteTs = parseInt(req.url.slice(idx + 101), 10);

    // (2) Validate the remote timestamp.
    {
      /** @const {Response} */
      const timestampError = validateTimestamp(remoteTs, Date.now());
      if (timestampError) return timestampError;
    }

    // (3) Validate the commitment PoW.
    {
      /** @const {Response} */
      const powError = validatePoW(commitPow, +env.KIMLIKDAO_POW_THRESHOLD);
      if (powError) return powError;
    }

    return req.formData()
      .then((/** @type {!FormData} */ form) => form.values().next().value.arrayBuffer())
      .then((/** @type {!ArrayBuffer} */ file) => getValidatingTckt(
        new Uint8Array(file),
        generateCommitment(commitPow.subarray(0, 32), env.KIMLIKDAO_NKO_CHALLENGE_SECRET),
        Date.now()))
      .then((/** @type {!ValidatingTckt} */ validatingTckt) => {
        /** @const {!did.PersonInfo} */
        const personInfo = /** @type {!did.PersonInfo} */(
          validatingTckt.tckt["personInfo"]);

        /** @const {!Promise<!did.VerifiableID>} */
        const exposureReportPromise = fetch(
          `https://${WORKER_NAME}-exposurereport-worker.${CF_ACCOUNT_NAME}.workers.dev`, {
          method: "POST",
          headers: { "authorization": "Bearer " + BEARER_TOKEN },
          body: personInfo.localIdNumber
        }).then((res) => res.json());
        /** @const {!Promise<!did.VerifiableID>} */
        const humanIDPromise = fetch(
          `https://${WORKER_NAME}-humanid-worker.${CF_ACCOUNT_NAME}.workers.dev`, {
          method: "POST",
          headers: { "authorization": "Bearer " + BEARER_TOKEN },
          body: personInfo.localIdNumber
        }).then((res) => res.json());

        /** @const {!Promise<!Response>} */
        const responsePromise = Promise.all([exposureReportPromise, humanIDPromise])
          .then(([exposureReport, humanID]) => {
            personInfo.exposureReportID = exposureReport.id;
            return Response.json(
              sign({
                ...validatingTckt.tckt,
                "humanID": humanID,
                "exposureReport": exposureReport
              },
                base64(commitPow.subarray(0, 32)),
                base64(commitPow.subarray(32, 64)),
                remoteTs,
                BigInt("0x" + env.NODE_PRIVATE_KEY)
              ),
              { headers: HEADERS }
            );
          });

        return validatingTckt.validityCheck.then((isValid) => isValid
          ? responsePromise
          : reject(ErrorCode.AUTHENTICATION_FAILURE))
      })
      .catch((error) => errorResponse(400, /** @type {!node.HataBildirimi} */(error)));
  }
}

globalThis["NkoWorker"] = NkoWorker;
export { NkoWorker };
