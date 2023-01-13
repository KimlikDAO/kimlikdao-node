import { getDocument } from "./pdf.js/src/pdf.js";

globalThis["pdfjs"] = {};
globalThis["pdfjs"]["getDocument"] = getDocument;
