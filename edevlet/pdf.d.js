/** @externs */

/** @const */
const pdfjs = {};


/**
 * @typedef {{
 *   items: !Array<{
 *     transform: !Array<number>,
 *     str: string
 *   }>
 * }}
 */
var TextContent;

/**
 * @constructor
 * @struct
 */
function PageViewport() { }

/** @const {number} */
PageViewport.prototype.width;

/** @const {number} */
PageViewport.prototype.height;

/**
 * @constructor
 * @struct
 */
function PDFPageProxy() { }

/**
 * @param {{
 *   scale: number
 * }} params
 * @return {!PageViewport}
 */
PDFPageProxy.prototype.getViewport = function (params) { };

/**
 * @return {!Promise<TextContent>}
 */
PDFPageProxy.prototype.getTextContent = function () { };

/**
 * @constructor
 * @struct
 */
function PDFDocumentProxy() { }

/**
 * @param {number} page
 * @return {!Promise<PDFPageProxy>}
 */
PDFDocumentProxy.prototype.getPage = function (page) { }

/**
 * @interface
 * @struct
 */
function PDFDocumentLoadingTask() { }

/** @const {!Promise<PDFDocumentProxy>} */
PDFDocumentLoadingTask.prototype.promise;

/**
 * @param {!Uint8Array} file
 * @return {!PDFDocumentLoadingTask}
 */
pdfjs.getDocument = function (file) { }
