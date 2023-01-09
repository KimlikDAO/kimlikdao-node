fetch('testdata/24868483126-2022.11.12-HSRN6W.pdf')
  .then((res) => res.arrayBuffer())
  .then((file) => pdfParser.getValidatingTckt(file, "HSRN6W", Date.now()))
  .then((validatingTckt) => {
    console.log(JSON.stringify(validatingTckt.tckt, null, 2));
    return validatingTckt.validityCheck;
  })
  .then((isValid) => console.log("isValid: " + isValid))
