fetch('edevlet/testdata/24868483126-2022.11.12-HSRN7W.pdf')
  .then((res) => res.arrayBuffer())
  .then((file) => nkoParser.getValidatingTckt(file, "HSRN7W", Date.now()))
  .then((validatingTckt) => {
    console.log(JSON.stringify(validatingTckt.tckt, null, 2));
    return validatingTckt.validityCheck;
  })
  .then((isValid) => console.log("isValid: " + isValid))
