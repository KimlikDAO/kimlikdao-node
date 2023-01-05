import { generate } from "/lib/did/exposureReport";
import { signDecryptedSections } from "/lib/did/infoSection";
import { base64, base64ten } from "/lib/utli/çevir";

/** @const {string} */
const TOKEN_SERVER_URL = "https://mock-oauth2.kimlikdao.net/token";
/** @const {string} */
const BILGI_SERVER_URL = "https://mock-oauth2.kimlikdao.net/bilgi";

/**
 * @param {!nvi.TemelBilgileri} kişi
 * @param {!did.ExposureReportID} exposureReportID
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
 * @param {!Environment} env
 * @return {Promise<!Response>}
 */
const get = (req, env) => {
  if (req.method !== "GET")
    return err(405, ErrorCode.INVALID_REQUEST);

  // (1) Parse the url.
  /** @type {number} */
  const idx = req.url.indexOf("?");
  /** @const {!Uint8Array} */
  const commitPow = base64ten(url.slice(idx + 1, idx + 55));
  /** @const {!URLSearchParams} */
  const searchParams = new URLSearchParams(url.slice(idx + 56));
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
    const powError = validatePoW(commitPow);
    if (powError) return powError;
  }

  /** @const {oauth2.AccessTokenRequest} */
  const tokenRequest = {
    grant_type: "authorization_code",
    code: oauthCode,
    client_id: env.NODE_EDEVLET_CLIENT_ID,
    client_secret: env.NODE_EDEVLET_CLIENT_SECRET,
  }
  return fetch(TOKEN_SERVER_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(
      /** @type {!Object<string, string>} */(tokenRequest)).toString()
  }).then((res) => res.json())
    .then((/** @type {oauth2.AccessToken} */ body) => fetch(BILGI_SERVER_URL, {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + body.access_token }
    }))
    .then((res) => res.json())
    .then((data) => {
      /** @const {!did.ExposureReportID} */
      const exposureReportID = generate(
        "TR" + data["Temel-Bilgiler"]["localIdNumber"],
        env.KIMLIKDAO_EXPOSURE_ID_SECRET
      );
      /** @const {!did.DecryptedSections} */
      const decryptedSections = /** @type {!did.DecryptedSections} */({
        "personInfo": toPersonInfo(data["Temel-Bilgileri"], exposureReportID),
        "contactInfo": toContactInfo(data["Iletisim-Bilgileri"]),
        "kütükBilgileri":
          /** @type {!did.KütükBilgileri} */(data["Kutuk-Bilgileri"]),
        "addressInfo": fromTürkiyeAdresi(data["Adres-Bilgileri"]),
        "exposureReport": /** @type {!did.ExposureReport} */(exposureReportID)
      });
      signDecryptedSections(
        decryptedSections,
        commitment,
        remoteTs,
        BigInt(env.NODE_PRIVATE_KEY)
      );
      return new Response(JSON.stringify(decryptedSections), {
        headers: {
          'content-type': 'application/json;charset=utf-8',
          'access-control-allow-origin': '*'
        }
      });
    });
}

export default { get };
