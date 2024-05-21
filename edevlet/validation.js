import { keccak256Uint32 } from "@kimlikdao/lib/crypto/sha3";
import { ErrorCode, errWithMessage } from "@kimlikdao/lib/node/error";

/**
 * @param {number} remoteTs
 * @param {number} localTsInMillis
 * @return {?Response}
 */
const validateTimestamp = (remoteTs, localTsInMillis) => {
  /** @const {number} */
  const localTs = localTsInMillis / 1000 | 0;
  if (localTs - 10 * 60 < remoteTs && remoteTs < localTs + 10 * 60)
    return null;
  return errWithMessage(409, ErrorCode.INVALID_TIMESTAMP, [
    "" + localTs, "" + remoteTs
  ]);
}

/**
 * @param {!Uint8Array} commitPow
 * @param {number} powThreshold
 * @return {?Response}
 */
const validatePoW = (commitPow, powThreshold) => {
  /** @const {number} */
  const digit = keccak256Uint32(new Uint32Array(commitPow.buffer))[0];
  if (digit <= powThreshold) return null;
  return errWithMessage(406, ErrorCode.INVALID_POW, ["" + digit, "" + powThreshold]);
}

export { validateTimestamp, validatePoW };
