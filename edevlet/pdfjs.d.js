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
pdfjs.TextContent;

/**
 * @constructor
 * @struct
 */
pdfjs.PageViewport = function () { }

/** @const {number} */
pdfjs.PageViewport.prototype.width;

/** @const {number} */
pdfjs.PageViewport.prototype.height;

/**
 * @see PDFPageProxy in pdf.js.
 *
 * @constructor
 * @struct
 */
pdfjs.PDFPage = function () { }

/**
 * @param {{
 *   scale: number
 * }} params
 * @return {!pdfjs.PageViewport}
 */
pdfjs.PDFPage.prototype.getViewport = function (params) { };

/**
 * @return {!Promise<!pdfjs.TextContent>}
 */
pdfjs.PDFPage.prototype.getTextContent = function () { };

/**
 * @see PDFDocumentProxy in pdf.js.
 *
 * @constructor
 * @struct
 */
pdfjs.PDFDocument = function () { }

/**
 * @param {number} page
 * @return {!Promise<!pdfjs.PDFPage>}
 */
pdfjs.PDFDocument.prototype.getPage = function (page) { }

/**
 * @see PDFDocumentLoadingTask in pdf.js
 *
 * @interface
 * @struct
 */
pdfjs.PDFDocumentLoadingTask = function () { }

/** @const {!Promise<!pdfjs.PDFDocument>} */
pdfjs.PDFDocumentLoadingTask.prototype.promise;

/**
 * @param {!Uint8Array} file
 * @return {!pdfjs.PDFDocumentLoadingTask}
 */
pdfjs.getDocument = function (file) { }
