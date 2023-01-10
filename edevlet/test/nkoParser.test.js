import { readdir, readFile } from 'fs/promises';

/**
 * @param {string} fileName
 * @return {number}
 */
const getTime = (fileName) => {
  const d = fileName.split("-")[1].split(".");
  return new Date(`${d[0]}-${d[1]}-${d[2]}T00:00:00.000+03:00`);
}

const getAnswersFile = (fileName) => fileName.split("-")[0] + ".json";

const getChallenge = (fileName) => fileName.split("-")[2].split(".")[0];

readdir('edevlet/testdata').then((files) => {
  files.forEach((fileName) => {
    if (!fileName.endsWith('.pdf')) return;
    console.log("Testing " + fileName);
    fileName = 'edevlet/testdata/' + fileName;
    const correctPromise = readFile(getAnswersFile(fileName), 'utf8')
      .then((file) => JSON.stringify(JSON.parse(file)));

    const returnedPromise = readFile(fileName)
      .then((file) => nkoParser.getValidatingTckt(
        file,
        getChallenge(fileName),
        getTime(fileName)))
      .then((validatingTckt) => validatingTckt
        .validityCheck.then((isValid) => isValid ? JSON.stringify(validatingTckt.tckt) : "")
      );

    return Promise.all([correctPromise, returnedPromise])
      .then(([correct, returned]) => {
        if (correct == returned) console.log("Geçti\n" + correct);
        else {
          console.log("Hata\n", correct, "\n\n", returned);
        }
      })
      .catch(console.log);
  })
});
