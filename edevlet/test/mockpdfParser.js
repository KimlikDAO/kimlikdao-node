/**
 * @param {!Uint8Array} file pdf file to be parsed.
 * @param {string} challenge 9 digit challenge to be sought in the pdf file.
 * @param {number} timeNow The current unix timestamp.
 * @return {Promise<ValidatingTCKT>}
 */
pdfParser.getValidatingTckt = (file, challenge, timeNow) =>
  Promise.resolve(/** @type {!pdfParser.ValidatingTCKT} */({
    tckt: {
      personInfo: /** @type {!did.PersonInfo} */({
        first: "Kaan",
        last: "Ankara"
      })
    },
    validityCheck: Promise.resolve(false)
  }));
