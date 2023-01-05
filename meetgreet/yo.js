
/**
 * @param {!Request} req
 * @param {!Environment} env
 * @param {!Context} ctx
 * @return {Promise<!Response>}
 */
const get = (req, env, ctx) => {
  return Promise.json(/** @type {YoBack} */({
    address: env.NODE_EVM_ADDRESS
  }));
}

export default { get };
