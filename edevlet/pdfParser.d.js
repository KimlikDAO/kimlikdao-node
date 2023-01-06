/** @externs */

/** @const */
const pdfParser = {};

/** @interface */
pdfParser.ValidatingTCKT = function () { }

/** @type {!did.DecryptedSections} */
pdfParser.ValidatingTCKT.prototype.tckt;

/** @type {Promise<boolean>} */
pdfParser.ValidatingTCKT.prototype.validityCheck;

/**
 * @param {!Uint8Array} file pdf file to be parsed.
 * @param {string} challenge 9 digit challenge to be sought in the pdf file.
 * @param {number} timeNow The current unix timestamp in milliseconds.
 * @return {Promise<!pdfParser.ValidatingTCKT>}
 */
pdfParser.getValidatingTckt = function (file, challenge, timeNow) { }
