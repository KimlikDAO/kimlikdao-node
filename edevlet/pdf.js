import { getValidatingTckt } from '/edevletPdfParser';
import { keccak256Uint32 } from '/lib/crypto/sha3';
import { signDecryptedSections } from "/lib/did/section";
import { ErrorCode } from '/lib/node/error';
import { base64ten, uint8ArrayeBase64ten } from '/lib/util/çevir';

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
 * @param {!Uint8Array} commitArray
 * @param {string} pdfChallengeSecret
 * @return {string}
 */
const getChallenge = (commitArray, pdfChallengeSecret) => {
  /** @const {!Uint8Array} */
  const buff = new Uint8Array(64);
  uint8ArrayeBase64ten(buff.subarray(32), pdfChallengeSecret);
  buff.set(commitArray);
  return base35(keccak256Uint32(buff)[0]);
}

/**
 * @param {!Request} req
 * @param {!Environment} env
 * @return {Promise<!Response>}
 */
const put = (req, env) => {
  if (req.method !== "PUT")
    return err(405, ErrorCode.INVALID_REQUEST);

  // (1) Parse the url.
  /** @const {number} */
  const idx = req.url.indexOf('?');
  /** @const {!Uint8Array} */
  const commitPow = base64ten(req.url.slice(idx + 1, idx + 55));
  /** @const {number} */
  const remoteTs = parseInt(req.url.slice(idx + 59), 10);

  // (2) Validate the remote timestamp.
  {
    /** @const {Response} */
    const timestampError = validateTimestamp(remoteTs, Date.now());
    if (timestampError) return timestampError;
  }

  // (3) Validate the commitment PoW.
  {
    /** @const {Response} */
    const powError = validatePoW(commitPow);
    if (powError) return powError;
  }

  return req.formData()
    .then((form) => form.values().next().value.arrayBuffer())
    .then((file) => getValidatingTckt(
      new Uint8Array(file),
      getChallenge(
        commitPow.subarray(0, 32),
        env.KIMLIKDAO_PDF_CHALLENGE_SECRET),
      Date.now()))
    .then((validatingTckt) => {
      /** @const {!did.DecryptedSections} */
      const signedTckt = signDecryptedSections(
        validatingTckt.tckt,
        base64(commitPow.subarray(0, 32)),
        remoteTs,
        BigInt(env.NODE_PRIVATE_KEY)
      );
      validatingTckt.validityCheck.then((isValid) => isValid
        ? Response.json(signedTckt, { headers: PRIVATE_HEADERS })
        : reject(ErrorCode.AUTHENTICATION_FAILURE))
    })
    .catch((error) => err(400, error));
}

/**
 * @param {!Request}
 * @param {!Environment}
 * @param {Promise<!Response>}
 */
const get = (req, env) => {
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
    const powError = validatePoW(commitPow);
    if (powError) return powError;
  }

  return new Promise((resolve) => setTimeout(() => resolve(
    Response.json(getChallenge(
      commitPow.subarray(0, 32),
      env.KIMLIKDAO_PDF_CHALLENGE_SECRET
    ), { headers: STATIC_HEADERS })), 1000));
}

export default { put, get };
