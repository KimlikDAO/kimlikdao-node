import { getValidatingTckt, ValidatingTckt } from "./nkoParser";
import { validatePoW, validateTimestamp } from "./validation";
import { keccak256Uint32 } from "/lib/crypto/sha3";
import { sign } from "/lib/did/decryptedSections";
import { err, ErrorCode, errorResponse, reject } from "/lib/node/error";
import { base64, base64ten, uint8ArrayeBase64ten } from "/lib/util/çevir";

/** @const {!Object<string, string>} */
const STATIC_HEADERS = {
  'content-type': 'text/plain',
  'access-control-allow-origin': '*',
  'cache-control': 'max-age=29030400,public,immutable',
  'expires': 'Sun, 01 Jan 2034 00:00:00 GMT',
}

/** @const {!Object<string, string>} */
const PRIVATE_HEADERS = {
  'content-type': 'application/json;charset=utf-8',
  'access-control-allow-origin': '*',
  'cache-control': 'private,no-cache',
};

/**
 * @param {number} n
 * @return {string}
 */
const base35 = (n) => {
  let out = "";
  for (let i = 0; i < 6; ++i) {
    let r = n % 35;
    out += String.fromCharCode(r < 9 ? 49 + r : 56 + r)
    n /= 35;
  }
  return out;
}

/**
 * @param {!Uint8Array} commitArray of length 32.
 * @param {string} nkoChallengeSecret a base64 encoded byte array of length 32.
 * @return {string} challenge, base35 encoded string.
 */
const getChallenge = (commitArray, nkoChallengeSecret) => {
  /** @const {!Uint8Array} */
  const buff = new Uint8Array(64);
  uint8ArrayeBase64ten(buff.subarray(32), nkoChallengeSecret);
  buff.set(commitArray);
  return base35(keccak256Uint32(new Uint32Array(buff.buffer))[0]);
}

/**
 * Given a NKO (Nüfus kayıt örneği), parses the NKO, validates it against
 * e-devlet and signs it.
 *
 * The input data is processed and sent back to the user withouut ever saving
 * it to disk or any other persistence layer.
 *
 * Sadly, until Cloudflare Smart Placements rolls out, we have to use a
 * durable object for this worker so that we can place it as close to Ankara
 * as possible. Notice that the `state` object passed in the constructor is
 * never read or written, so no persistence can place.
 *
 * @implements {cloudflare.DurableObject}
 */
class NkoWorker {
  /**
   * @param {!cloudflare.DurableObject.State} _
   * @param {!cloudflare.Environment} env
   */
  constructor(_, env) {
    /** @const {!NkoEnv} */
    const nkoEnv = /** @type {!NkoEnv} */(env);
    /** @const {string} */
    this.challengeSecret = nkoEnv.KIMLIKDAO_NKO_CHALLENGE_SECRET;
    /** @const {number} */
    this.powThreshold = +nkoEnv.KIMLIKDAO_POW_THRESHOLD;
    /** @const {!bigint} */
    this.privateKey = BigInt("0x" + nkoEnv.NODE_PRIVATE_KEY);

    /** @const {!cloudflare.ModuleWorkerStub} */
    this.HumanIDWorker = nkoEnv.HumanIDWorker;
    /** @const {!cloudflare.ModuleWorkerStub} */
    this.ExposureReportWorker = nkoEnv.ExposureReportWorker;
  }

  /**
   * @param {!Request} req
   * @return {!Promise<!Response>|!Response}
   */
  fetch(req) {
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
      const powError = validatePoW(commitPow, this.powThreshold);
      if (powError) return powError;
    }

    return req.formData()
      .then((/** @type {!FormData} */ form) => form.values().next().value.arrayBuffer())
      .then((/** @type {!ArrayBuffer} */ file) => getValidatingTckt(
        new Uint8Array(file),
        getChallenge(commitPow.subarray(0, 32), this.challengeSecret),
        Date.now()))
      .then((/** @type {!ValidatingTckt} */ validatingTckt) => {
        /** @const {!did.PersonInfo} */
        const personInfo = /** @type {!did.PersonInfo} */(
          validatingTckt.tckt["personInfo"]);

        /** @const {!Promise<!did.VerifiableID>} */
        const exposureReportPromise = this.ExposureReportWorker.fetch("http://a/" + personInfo.localIdNumber)
          .then((res) => res.json());
        /** @const {!Promise<!did.VerifiableID>} */
        const humanIDPromise = this.HumanIDWorker.fetch("http://a/" + personInfo.localIdNumber)
          .then((res) => res.json());

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
                this.privateKey
              ),
              { headers: PRIVATE_HEADERS }
            );
          });

        return validatingTckt.validityCheck.then((isValid) => isValid
          ? responsePromise
          : reject(ErrorCode.AUTHENTICATION_FAILURE))
      })
      .catch((error) => errorResponse(400, /** @type {!node.HataBildirimi} */(error)));
  }
}

/**
 * @param {!Request} req
 * @param {!NkoEnv} nkoEnv
 * @return {!Promise<!Response>|!Response}
 */
const getCommitment = (req, nkoEnv) => {
  if (req.method !== "GET")
    return err(405, ErrorCode.INVALID_REQUEST);

  // (1) Parse the url.
  /** @const {number} */
  const idx = req.url.indexOf('?');
  /** @const {!Uint8Array} */
  const commitPow = base64ten(req.url.slice(idx + 1, idx + 55));

  // (2) Validate the commitment PoW.
  {
    /** @const {Response} */
    const powError = validatePoW(commitPow, +nkoEnv.KIMLIKDAO_POW_THRESHOLD);
    if (powError) return powError;
  }

  // (3) Return the challenge with 1 second threshold.
  return new Promise((resolve) => setTimeout(() => resolve(
    new Response(getChallenge(
      commitPow.subarray(0, 32),
      nkoEnv.KIMLIKDAO_NKO_CHALLENGE_SECRET
    ), { headers: STATIC_HEADERS })), 1000));
}

export { getCommitment, NkoWorker };
