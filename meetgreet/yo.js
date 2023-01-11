
/**
 * @param {!Request} req
 * @param {!Parameters} param
 * @return {!Response}
 */
const get = (req, param) => {
  return Response.json(/** @type {!YoBack} */({
    address: param.NODE_EVM_ADDRESS
  }));
}

export default { get };
