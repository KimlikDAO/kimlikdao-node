import { webcrypto as crypto } from 'crypto';
import { base64 } from "./lib/util/çevir";
import { base64ten } from "./lib/util/çevir";

const a = () => {
  const arr = crypto.getRandomValues(new Uint8Array(32));
  const suff = "&" + new URLSearchParams({
    ts: ~~(Date.now() / 1000),
    oauth_code: "AC22345678902"
  }).toString();


  const url = "https://node5.kimlikdao.org/edevlet/oauth2?" + base64(arr).slice(0, -1) + suff;
  console.log(url);

  /** @type {number} */
  const idx = url.indexOf("?");
  /** @const {!Uint8Array} */
  const commitPow = base64ten(url.slice(idx + 1, idx + 44));
  /** @const {!URLSearchParams} */
  const searchParams = new URLSearchParams(url.slice(idx + 45));
  /** @const {string} */
  const oauthCode = searchParams.get('oauth_code') || "";
  /** @const {number} */
  const remoteTs = parseInt(searchParams.get('ts'), 10);

 // console.log(url.slice(idx + 43));
 console.log(base64(commitPow));

  // fetch(url).then((res) => res.json()).then(console.log);
}

a();
