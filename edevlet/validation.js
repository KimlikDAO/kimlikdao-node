import { keccak256Uint32 } from "/lib/crypto/sha3";

/** @define {number} */
const POW_EŞİĞİ = 20000;

/**
 * @param {number} remoteTs
 * @param {number} localTsInMillis
 * @return {?Response}
 */
const validateTimestamp = (remoteTs, localTsInMillis) => {
  const localTs = ~~(localTsInMillis / 1000);
  if (localTs - 10 * 60 < remoteTs && remoteTs < localTs + 10 * 60)
    return null;
  return errWithMessage(400, ErrorCode.INVALID_TIMESTAMP, [
    "" + localTs, "" + remoteTs
  ]);
}

/**
 * @param {!Uint8Array} commitPow
 * @return {?Response}
 */
const validatePoW = (commitPow) => {
  const digit = keccak256Uint32(new Uint32Array(commitPow.buffer))[0];
  if (digit <= POW_EŞİĞİ) return null;
  return errWithMessage(400, ErrorCode.INVALID_POW, ["" + digit, "" + POW_EŞİĞİ]);
}

export { validateTimestamp, validatePoW };
