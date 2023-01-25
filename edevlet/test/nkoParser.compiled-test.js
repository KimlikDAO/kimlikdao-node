import { getValidatingTckt } from "/edevlet/nkoParser";

/**
 * @param {string} fileName
 * @return {number}
 */
const getTime = (fileName) => {
  const d = fileName.split("-")[1].split(".");
  return new Date(`${d[0]}-${d[1]}-${d[2]}T00:00:00.000+03:00`).getTime();
}

/**
 * @param {string} fileName
 * @return {string}
 */
const getAnswersFile = (fileName) => fileName.split("-")[0] + ".json";

/**
 * @param {string} fileName
 * @return {string}
 */
const getChallenge = (fileName) => fileName.split("-")[2].split(".")[0];

readdir('edevlet/testdata').then((files) => {
  files.forEach((fileName) => {
    if (!fileName.endsWith('.pdf')) return;
    console.log("Testing " + fileName);
    fileName = 'edevlet/testdata/' + fileName;
    const correctPromise = readFile(getAnswersFile(fileName), 'utf8')
      .then((file) => JSON.stringify(JSON.parse(file)));

    const returnedPromise = readFile(fileName)
      .then((file) => getValidatingTckt(
        file,
        getChallenge(fileName),
        getTime(fileName)))
      .then((validatingTckt) => validatingTckt
        .validityCheck.then((isValid) => isValid ? JSON.stringify(validatingTckt.tckt) : "Hata")
      );

    return Promise.all([correctPromise, returnedPromise])
      .then(([correct, returned]) => {
        if (correct == returned) console.log("Geçti\n");
        else {
          console.log("Hata\nExpected:", correct, "\n\nGiven:", returned);
        }
      })
      .catch(console.log);
  })
});
