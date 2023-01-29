/**
 * @fileoverview
 * 
 * @author KimlikDAO
 * @externs
 */

/**
 * @interface
 * @extends {cloudflare.Environment}
 */
function YoEnv() { }

/** @const {string} */
YoEnv.prototype.NODE_PRIVATE_KEY;

/** @const {string} */
YoEnv.prototype.NODE_EVM_ADDRESS;

/** @constructor */
function YoBack() { }

/** @type {string} */
YoBack.prototype.address;

/** @type {string} */
YoBack.prototype.signature;
