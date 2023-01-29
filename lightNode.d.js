/** @externs */

/**
 * @interface
 */
function Persistence() { }

/** @const {!cloudflare.KeyValue} */
Persistence.prototype.db;

/** @const {!Cache} */
Persistence.prototype.cache;

/**
 * @interface
 * @extends {cloudflare.Environment}
 */
function LightNodeEnv() { }

/** @const {!cloudflare.KeyValue} */
LightNodeEnv.prototype.KeyValue;
