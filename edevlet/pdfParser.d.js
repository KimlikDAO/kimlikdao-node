
/** @interface */
function ValidatingTCKT() { }

/** @type {!did.DecryptedSections} */
ValidatingTCKT.prototype.tckt;

/** @type {Promise<boolean>} */
ValidatingTCKT.prototype.validityCheck;

/**
 * @param {!Uint8Array} file pdf file to be parsed.
 * @param {string} challenge 9 digit challenge to be sought in the pdf file.
 * @param {number} timeNow The current unix timestamp in milliseconds.
 * @return {Promise<!ValidatingTCKT>}
 */
const getValidatingTckt = function () { }
