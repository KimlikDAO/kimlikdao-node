import { reject } from "/lib/node/error";

/** @const {!Object<string, number>} */
const MONTHS = {
  'Ocak': '01',
  'Şubat': '02',
  'Mart': '03',
  'Nisan': '04',
  'Mayıs': '05',
  'Haziran': '06',
  'Temmuz': '07',
  'Ağustos': '08',
  'Eylül': '09',
  'Ekim': '10',
  'Kasım': '11',
  'Aralık': '12',
}

/** @const {string} */
const EDEVLET_URL = "https://www.turkiye.gov.tr";

/**
 * @param {string} str String to be normalized
 * @return {string}
 * @example
 * ```
 *   canonicalCase("istanbul") == "İstanbul"
 *   canonicalCase("ığdır") == "Iğdır"
 * ```
 */
const canonicalCase = (str) => {
  if (!str) return "";
  /** @const {!Array<string>} */
  const strs = str.trim().split(/\s+/);
  let out = "";
  for (let s of strs) {
    out += s[0].toUpperCase() + s.slice(1).replace('I', 'ı').replace('İ', 'i').toLowerCase() + " ";
  }
  return out.slice(0, -1);
}

/**
 * @param {!Uint8Array} userFile
 * @param {string} barcode
 * @param {string} tckn
 * @return {!Promise<boolean>}
 */
const validateWithEDevlet = (userFile, barcode, tckn) => {
  return fetch(EDEVLET_URL + '/belge-dogrulama')
    .then(res => {
      const c = res.headers.get('set-cookie');
      const cookie = c.split(' ').filter((x) => x.startsWith("TURKIYESESSION") || x.startsWith('w3p')).join(' ');
      const headers = {
        cookie,
        'content-type': 'application/x-www-form-urlencoded',
      }
      return res.text()
        .then((text) => {
          const idx = text.indexOf('data-token="{');
          const token = text.slice(idx + 13, idx + 68);
          return fetch(EDEVLET_URL + '/belge-dogrulama?submit', {
            method: 'POST',
            headers,
            body: `sorgulananBarkod=${barcode}&token=%7B${token}%7D&btn=Devam+Et`
          })
        })
        .then((res) => res.text())
        .then((text) => {
          const progressIdx = text.indexOf('aşamadasınız');
          console.log("HTML:" + text.slice(progressIdx - 30, progressIdx + 20));
          const idx = text.indexOf('data-token="{');
          const token = text.slice(idx + 13, idx + 68);
          return fetch(EDEVLET_URL + '/belge-dogrulama?islem=dogrulama&submit', {
            method: 'POST',
            headers,
            body: `ikinciAlan=${tckn}&token=%7B${token}%7D&btn=Devam+Et`
          })
        })
        .then((res) => res.text())
        .then((text) => {
          const progressIdx = text.indexOf('aşamadasınız');
          console.log("HTML:" + text.slice(progressIdx - 30, progressIdx + 20));
          const idx = text.indexOf('data-token="{');
          const token = text.slice(idx + 13, idx + 68);
          return fetch(EDEVLET_URL + '/belge-dogrulama?islem=onay&submit', {
            method: 'POST',
            headers,
            body: `chkOnay=1&token=%7B${token}%7D&btn=Devam+Et`
          })
        })
        .then((res) => res.text())
        .then((text) => {
          const asamaidx = text.indexOf('aşamadasınız');
          console.log("HTML:", text.slice(asamaidx - 30, asamaidx + 20));
          return fetch(EDEVLET_URL + "/belge-dogrulama?belge=goster&goster=1", {
            headers: { 'cookie': cookie },
          })
        })
        .then((res) => res.arrayBuffer())
        .then((buff) => {
          const edevletFile = new Uint8Array(buff);
          const len = edevletFile.byteLength;
          if (len != userFile.byteLength)
            return false;
          for (let i = 0; i < len; ++i)
            if (edevletFile[i] != userFile[i]) return false;
          console.log(`TCKT: ${tckn} geçti`);
          return true;
        })
    });
};

/**
 * @param {!Uint8Array} file pdf file to be parsed.
 * @param {string} challenge 9 digit challenge to be sought in the pdf file.
 * @param {number} timeNow The current unix timestamp.
 * @return {!Promise<{
 *   tckt: !did.DecryptedSections,
 *   validityCheck: !Promise<boolean>
 * }>}
 */
const getValidatingTckt = (file, challenge, timeNow) => pdfjs.getDocument(file).promise
  .then((doc) => doc.getPage(1))
  .catch(() => reject(ErrorCode.INCORRECT_FILE_FORMAT))
  .then((page) => {
    const viewport = page.getViewport({ scale: 1.0 });
    return page.getTextContent().then((text) => {
      /** @type {number} */
      let notesY = -1;
      /** @type {number} */
      let note1Y = 101;
      /** @type {number} */
      let note2Y = 101;
      /** @type {number} */
      let note3Y = 101;
      /** @type {number} */
      let personY = -1;
      /** @type {number} */
      let recordY = -1;
      /** @type {number} */
      let recordX = -1;
      /** @type {string} */
      let date = '';
      /** @type {number} */
      let barcodeY = -1;
      /** @type {string} */
      let barcode;

      for (let t of text.items) {
        const x = 100 * t.transform[4] / viewport.width;
        const y = 100 * t.transform[5] / viewport.height;
        if (y <= 5 && x < 20) {
          date += t.str;
        } else if (y > barcodeY && t.str.startsWith('NV')) {
          barcodeY = y;
          barcode = t.str;
        }
        switch (t.str.trim().toUpperCase()) {
          case 'AÇIKLAMALAR':
            if (x <= 5) {
              notesY = y;
            }
            break;
          case 'KENDISI':
            if (10 <= x && x <= 15) {
              personY = y;
            }
            break;
          case 'ÖRNEĞİ':
            if (y > recordY) {
              recordY = y;
              recordX = x;
            }
            break;
          case '1)':
          case '1-)':
            note1Y = Math.min(note1Y, y);
            break;
          case '2)':
          case '2-)':
            note2Y = Math.min(notesY, y);
            break;
          case '3)':
          case '3-)':
            note3Y = Math.min(note3Y, y);
            break;
        }
      }
      const d = date.trim().split(/\s+/);
      d[0] = d[0].padStart(2, '0');
      const documentDate = new Date(`${d[2]}-${MONTHS[d[1]]}-${d[0]}T${d[4]}:00.000+03:00`);
      console.log(documentDate.getTime());
      const documentAge = timeNow - documentDate;
      if (documentAge > 86400_000)
        return reject(ErrorCode.DOCUMENT_EXPIRED, [Math.round(documentAge / 3600_000)]);

      const personInfo = /** @const {!did.PersonInfo} */({
        first: "",
        last: "",
        localIdNumber: "TR",
        dateOfBirth: "",
        cityOfBirth: "",
        gender: "",
        exposureReportID: "",
      });
      const kütükBilgileri = /** @const {!did.KütükBilgileri} */({
        il: "",
        ilçe: "",
        mahalle: "",
        cilt: -1,
        hane: -1,
        BSN: -1,
        tescil: "",
        annead: "",
        babaad: "",
        mhali: "",
      });

      const delta12 = (note1Y - note2Y) / 2;
      const note1YLow = note1Y - delta12
      const note1YHigh = note1Y + delta12;

      const delta23 = (note2Y - note3Y) / 2;
      const note2YLow = note2Y - delta23
      const note2YHigh = note2Y + delta23;

      /** @type {boolean} */
      let isRecordValid = false;
      /** @type {boolean} */
      let isInstitutionValid = false;
      /** @type {boolean} */
      let isChallengeValid = false;
      /** @type {boolean} */
      let isAlive = false;
      for (let t of text.items) {
        const x = 100 * t.transform[4] / viewport.width;
        const y = 100 * t.transform[5] / viewport.height;
        const str = t.str.trim();
        if (personY - 2 <= y && y <= personY + 2) {
          if (x <= 43) { // BSN, Cinsiyet, TCKN, Ad, Soyad
            if (x <= 20) { // BSN, Cinsiyet, TCKN
              if (x >= 16) {
                if (str) personInfo.localIdNumber = "TR" + parseInt(str, 10);
              } else if (9 <= x && x <= 11) {
                if (str) personInfo.gender = str == "E" ? "M" : "F";
              } else if (7 <= x && x <= 8.3) {
                if (str) kütükBilgileri.BSN = parseInt(str, 10);
              }
            } else if (24.2 <= x && x <= 32) { // Ad
              personInfo.first += t.str;
            } else if (32 < x) { // Soyad
              personInfo.last += t.str;
            }
          } else { // babaad, annead, dt, dyeri, mhali, din,
            if (x <= 72) { // babaad, annead, dt, dyeri
              if (x <= 52) {
                kütükBilgileri.babaad += t.str;
              } else if (x <= 63) {
                kütükBilgileri.annead += t.str;
              } else if (y > personY) {
                personInfo.cityOfBirth += t.str;
              } else if (str) {
                personInfo.dateOfBirth = str;
              }
            } else { // mhali, din
              if (x <= 80) {
                if (y > personY) {
                  kütükBilgileri.mhali = str;
                } else {
                  // personInfo.din += t.str;
                }
              } else if (x <= 83) {
                kütükBilgileri.tescil += t.str;
              } else if (str.toUpperCase().includes('SAĞ'))
                isAlive = true;
            }
          }
        } else if (recordY - 2 <= y && y <= recordY) {
          if (x <= 60) { // il, ilçe
            if (x <= 42) {
              if (x > recordX + 0.1)
                kütükBilgileri.il += t.str;
            } else {
              kütükBilgileri.ilçe += t.str;
            }
          } else { // mahalle, cilt, hane
            if (x < 82) {
              kütükBilgileri.mahalle += t.str;
            } else if (x < 85) {
              if (str) kütükBilgileri.cilt = parseInt(str, 10);
            } else
              if (str) kütükBilgileri.hane = parseInt(str, 10);
          }
        } else if (note1YLow <= y && y <= note1YHigh && str.includes('UYGUNDUR')) {
          isRecordValid = true;
        } else if (note2YLow <= y && y <= note2YHigh) {
          if (str.toUpperCase().includes('KİMLİKDAO')) isInstitutionValid = true;
          if (str.includes(challenge)) isChallengeValid = true;
        }
      }
      {
        const idx = kütükBilgileri.ilçe.indexOf('(');
        if (idx != -1) {
          kütükBilgileri.ilçe = kütükBilgileri.ilçe.slice(0, idx);
        }
      }
      personInfo.first = canonicalCase(personInfo.first);
      personInfo.last = canonicalCase(personInfo.last);
      personInfo.cityOfBirth = canonicalCase(personInfo.cityOfBirth);
      for (let key in kütükBilgileri) {
        if (typeof kütükBilgileri[key] == 'string')
          kütükBilgileri[key] = canonicalCase(kütükBilgileri[key])
      }
      if (!isRecordValid)
        return reject(ErrorCode.INVALID_RECORD);
      if (!isInstitutionValid)
        return reject(ErrorCode.INCORRECT_INSTITUTION);
      if (!isAlive)
        return reject(ErrorCode.PERSON_NOT_ALIVE);
      if (!isChallengeValid)
        return reject(ErrorCode.INVALID_CHALLENGE, [challenge]);

      return {
        tckt: /** @type {!did.DecryptedSections} */({
          "personInfo": personInfo,
          "kütükBilgileri": kütükBilgileri,
        }),
        validityCheck: validateWithEDevlet(file, barcode, personInfo.localIdNumber.slice(2))
      }
    })
  });

export { getValidatingTckt };
