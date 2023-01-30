import { validateTimestamp } from "./validation";
import { sign } from "/lib/did/decryptedSections";
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
 * OAuth2Worker responsible for creating `did.DecryptedSection`s via an edevlet
 * authentication. Since there is no way to hint workers to a specific data
 * center, we use Durable Objects instead.
 *
 * @implements {cloudflare.DurableObject}
 */
class OAuth2Worker {
  /**
   * @override
   *
   * @param {!cloudflare.DurableObject.State} _
   * @param {!OAuth2WorkerEnv} env
   */
  constructor(_, env) {
    /** @const {string} */
    this.edevletClientId = env.NODE_EDEVLET_CLIENT_ID;
    /** @const {string} */
    this.edevletClientSecret = env.NODE_EDEVLET_CLIENT_SECRET;

    /** @const {!cloudflare.ModuleWorkerStub} */
    this.HumanIDWorker = env.HumanIDWorker;
    /** @const {!cloudflare.ModuleWorkerStub} */
    this.ExposureReportWorker = env.ExposureReportWorker;
  }

  /**
   * @override
   *
   * @param {!Request} req
   * @return {!Promise<!Response>|!Response}
   */
  fetch(req) {
    if (req.method !== "GET")
      return err(405, ErrorCode.INVALID_REQUEST);

    // (1) Parse the url.
    /** @type {number} */
    const idx = req.url.indexOf("?");
    /** @const {!Uint8Array} */
    const commitPow = base64ten(req.url.slice(idx + 1, idx + 97));
    /** @const {!URLSearchParams} */
    const searchParams = new URLSearchParams(req.url.slice(idx + 98));
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
      client_id: this.edevletClientId,
      client_secret: this.edevletClientSecret,
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

        /** @const {!Promise<!did.VerifiableID>} */
        const exposureReportPromise = this.ExposureReportWorker.fetch("http://a/" + localIdNumber)
          .then((res) => res.json());
        /** @const {!Promise<!did.VerifiableID>} */
        const humanIDPromise = this.HumanIDWorker.fetch("http://a/" + localIdNumber)
          .then((res) => res.json());

        return Promise.all([exposureReportPromise, humanIDPromise])
          .then(([exposureReport, humanID]) => Response.json(
            sign({
              "personInfo": toPersonInfo(data["Temel-Bilgileri"], exposureReport.id),
              "contactInfo": toContactInfo(data["Iletisim-Bilgileri"]),
              "kütükBilgileri":
              /** @type {!did.KütükBilgileri} */(data["Kutuk-Bilgileri"]),
              "addressInfo": fromTürkiyeAdresi(data["Adres-Bilgileri"]),
              "humanID": humanID,
              "exposureReport": exposureReport
            },
              base64(commitPow.subarray(0, 32)),
              base64(commitPow.subarray(32, 64)),
              remoteTs,
              // this.privateKey
              1n // Don't sign mock data with actual keys
            ),
            { headers: PRIVATE_HEADERS }
          ));
      });
  }
}

export { OAuth2Worker };