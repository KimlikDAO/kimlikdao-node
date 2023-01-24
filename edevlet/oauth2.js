import { validateTimestamp } from "./validation";
import { sign } from "/lib/did/decryptedSections";
import { generate } from "/lib/did/verifiableID";
import { err, ErrorCode } from "/lib/node/error";
import { base64, base64ten } from "/lib/util/çevir";

/** @const {string} */
const EDEVLET_KAPISI = "https://mock-edevlet-kapisi.kimlikdao.net/";

/** @const {!Object<string, string>} */
const PRIVATE_HEADERS = {
  'content-type': 'application/json;charset=utf-8',
  'access-control-allow-origin': '*',
  'cache-control': 'private,no-cache',
};

/**
 * Convert a local `nvi.TemelBilgileri` into a global `did.PersonInfo`.
 *
 * The `exposureReportID` must be generated beforehand and supplied here.
 *
 * @param {!nvi.TemelBilgileri} kişi
 * @param {string} exposureReportID
 * @return {!did.PersonInfo}
 */
const toPersonInfo = (kişi, exposureReportID) => /** @type {!did.PersonInfo} */({
  first: kişi.ad,
  last: kişi.soyad,
  localIdNumber: "TR" + kişi.TCKN,
  cityOfBirth: kişi.dyeri,
  dateOfBirth: kişi.dt,
  gender: kişi.cinsiyet,
  exposureReportID
})

/**
 * @param {!nvi.IletisimBilgileri} iletişim
 * @return {!did.ContactInfo}
 */
const toContactInfo = (iletişim) => /** @type {!did.ContactInfo} */({
  email: iletişim.eposta,
  phone: iletişim.telefon.replace(/[^0-9+]/gi, ''),
})

/**
 * @param {!did.TürkiyeAdresi} trAdresi
 * @return {!did.AddressInfo}
 */
const fromTürkiyeAdresi = (trAdresi) => {
  trAdresi.country = "Türkiye";
  return trAdresi;
}

/**
 * @param {!Request} req
 * @param {!Parameters} param
 * @return {!Promise<!Response>|!Response}
 */
const get = (req, param) => {
  if (req.method !== "GET")
    return err(405, ErrorCode.INVALID_REQUEST);

  // (1) Parse the url.
  /** @type {number} */
  const idx = req.url.indexOf("?");
  /** @const {!Uint8Array} */
  const commit = base64ten(req.url.slice(idx + 1, idx + 44));
  /** @const {!URLSearchParams} */
  const searchParams = new URLSearchParams(req.url.slice(idx + 45));
  /** @const {string} */
  const oauthCode = searchParams.get('oauth_code') || "";
  /** @const {number} */
  const remoteTs = parseInt(searchParams.get('ts'), 10);

  // (2) Validate the remote timestamp.
  {
    const timestampError = validateTimestamp(remoteTs, Date.now());
    if (timestampError) return timestampError;
  }

  // (3) Validate the commitment PoW.
  {
    // const powError = validatePoW(commitPow, param.KIMLIKDAO_POW_THRESHOLD);
    // if (powError) return powError;
  }

  /** @const {!oauth2.AccessTokenRequest} */
  const tokenRequest = {
    grant_type: "authorization_code",
    code: oauthCode,
    client_id: param.NODE_EDEVLET_CLIENT_ID,
    client_secret: param.NODE_EDEVLET_CLIENT_SECRET,
  }
  return fetch(EDEVLET_KAPISI + "token", {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(
      /** @type {!Object<string, string>} */(tokenRequest)).toString()
  }).then((res) => res.json())
    .then((/** @type {oauth2.AccessToken} */ body) => fetch(EDEVLET_KAPISI + "nvi/kisi", {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + body.access_token }
    }))
    .then((/** !Response */ res) => res.json())
    .then((data) => {
      /** @const {string} */
      const localIdNumber = "TR" + data["Temel-Bilgileri"]["TCKN"];

      return Promise.all([
        generate(localIdNumber, param.KIMLIKDAO_EXPOSURE_ID_SECRET),
        generate(localIdNumber, param.KIMLIKDAO_HUMAN_ID_SECRET),
      ]).then(([exposureReportID, humanID]) => Response.json(
        sign({
          "personInfo": toPersonInfo(data["Temel-Bilgileri"], exposureReportID.id),
          "contactInfo": toContactInfo(data["Iletisim-Bilgileri"]),
          "kütükBilgileri":
              /** @type {!did.KütükBilgileri} */(data["Kutuk-Bilgileri"]),
          "addressInfo": fromTürkiyeAdresi(data["Adres-Bilgileri"]),
          "humanID": humanID,
          "exposureReport": exposureReportID
        },
          base64(commit),
          remoteTs,
          1n // Don't sign mock data with actual keys
        ),
        { headers: PRIVATE_HEADERS }
      ));
    });
}

export default { get };
