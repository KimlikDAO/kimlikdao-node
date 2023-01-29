
/**
 * @param {!Request} req
 * @param {!YoEnv} env
 * @return {!Response}
 */
const yo = (req, env) => {
  return Response.json(/** @type {!YoBack} */({
    address: env.NODE_EVM_ADDRESS
  }));
}

export { yo };
