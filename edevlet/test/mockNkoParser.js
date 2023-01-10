/**
 * @param {!Uint8Array} file pdf file to be parsed.
 * @param {string} challenge 9 digit challenge to be sought in the pdf file.
 * @param {number} timeNow The current unix timestamp.
 * @return {!Promise<!nkoParser.ValidatingTCKT>}
 */
nkoParser.getValidatingTckt = (file, challenge, timeNow) =>
  Promise.resolve(/** @type {!nkoParser.ValidatingTCKT} */({
    tckt: {
      personInfo: /** @type {!did.PersonInfo} */({
        first: "Kaan",
        last: "Ankara"
      })
    },
    validityCheck: Promise.resolve(true)
  }));
