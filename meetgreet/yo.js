
/**
 * @param {!Request} req
 * @param {!Context} ctx
 * @param {!Parameters} param
 * @return {!Response}
 */
const get = (req, ctx, param) => {
  return Response.json(/** @type {!YoBack} */({
    address: param.NODE_EVM_ADDRESS
  }));
}

export default { get };
