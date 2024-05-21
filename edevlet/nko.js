import { keccak256Uint32 } from "@kimlikdao/lib/crypto/sha3";
import { err, ErrorCode } from "@kimlikdao/lib/node/error";
import { base64ten, uint8ArrayeBase64ten } from "@kimlikdao/lib/util/çevir";
import { validatePoW } from "./validation";

/** @const {!Object<string, string>} */
const STATIC_HEADERS = {
  'content-type': 'text/plain',
  'access-control-allow-origin': '*',
  'cache-control': 'max-age=29030400,public,immutable',
  'expires': 'Sun, 01 Jan 2034 00:00:00 GMT',
}

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
const generateCommitment = (commitArray, nkoChallengeSecret) => {
  /** @const {!Uint8Array} */
  const buff = new Uint8Array(64);
  uint8ArrayeBase64ten(buff.subarray(32), nkoChallengeSecret);
  buff.set(commitArray);
  return base35(keccak256Uint32(new Uint32Array(buff.buffer))[0]);
}

/**
 * @param {!Request} req
 * @param {!NkoEnv} env
 * @return {!Promise<!Response>|!Response}
 */
const commit = (req, env) => {
  if (req.method !== "GET")
    return err(405, ErrorCode.INVALID_REQUEST);

  // (1) Parse the url.
  /** @const {number} */
  const idx = req.url.indexOf('?');
  /** @const {!Uint8Array} */
  const commitPow = base64ten(req.url.slice(idx + 1, idx + 97));

  // (2) Validate the commitment PoW.
  {
    /** @const {Response} */
    const powError = validatePoW(commitPow, +env.KIMLIKDAO_POW_THRESHOLD);
    if (powError) return powError;
  }

  // (3) Return the challenge with 1 second threshold.
  return new Promise((resolve) => setTimeout(() => resolve(
    new Response(generateCommitment(
      commitPow.subarray(0, 32),
      env.KIMLIKDAO_NKO_CHALLENGE_SECRET
    ), { headers: STATIC_HEADERS })), 1000));
}

export { commit, generateCommitment };
