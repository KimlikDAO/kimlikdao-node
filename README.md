# 🎛️ KimlikDAO protocol node

A KimlikDAO protocol node may be run in one of the two modes:

- 🪶 light node: permissionless; anyone can run a binary to join the network, <!--
  --> and
- 🖋️ signer node: requires staking the minimum required <!--
  --> [TCKO](https://github.com/KimlikDAO/TCKO)s and an approval by the DAO vote <!--
  --> (the process in fully on-chain; see below). A malicious deviation from the <!--
  --> protocol results in complete loss of all the staked TCKOs (which are then <!--
  --> distributed to the honest signers by the <!--
  --> [TCKTSigners](https://github.com/KimlikDAO/TCKT/blob/main/contracts/TCKTSigners.sol) contract).

Soon we will have two node implementations: one written in Javascript + wasm to <!--
--> be run on the Cloudflare Workers platform and one written in Rust and <!--
--> to be run on self hosted machines. Currently only the JavaScript + wasm<!--
--> version is functional and the Rust implementation is expected to be<!--
--> ready by mid 2023.

## 🪶 Light nodes

```shell
make build/lightNode.deployment
```

## 🖋️ Signer nodes

To run a signer node, first you need

1. A computer (for the rust client) or a Clouflare Workers account <!--
   -->(for the javascript + wasm client).
2. The required amount of [TCKO](https://github.com/KimlikDAO/TCKO)s to stake.
3. Optionally, if you want to enable the email verification endpoint, <!--
   -->a domain name and in the case of the rust client a static IP (this <!--
   -->is so that your node can send out verification emails without getting <!--
   -->flagged by SMTP recipients.)
4. Optionally, if you want to enable the `/edevlet/oauth2` endpoint, <!--
   -->an `EDEVLET_CLIENT_ID` and the corresponding `EDEVLET_CLIENT_SECRET`, <!--
   -->obtained by a Türksat A.Ş. application.

Once you have these, the step are as follows:

1. Generate an EVM private key and the derived address. It is crucial that <!--
   -->you keep this private key secure. You'll lose all your staked TCKOs if <!--
   -->you get this key stolen or misplace it.
2. Transfer the minimum required TCKOs to the address you obtained.
3. Approve the <!--
   -->[TCKTSigners](https://github.com/KimlikDAO/TCKT/blob/main/contracts/TCKTSigners.sol) <!--
   -->contract for the required amount of TCKOs. (Call the `approve()` method of <!--
   -->the `TCKO` contract with `TCKTSigners`'s address and the required amount <!--
   -->for a long enough duration.)
4. Submit your proposal to be a signer to the <!--
   -->[Oylama](https://github.com/KimlikDAO/Oylama) contract. For convenience you <!--
   -->may use the interface at https://kimlikdao.org/vote.

```toml
# A hex string of lenght 64 (i.e., without a leading 0x)
NODE_PRIVATE_KEY = ""
# To enable the /edevlet/oauth2 enpoint, set the following
NODE_EDEVLET_CLIENT_ID = ""
NODE_EDEVLET_CLIENT_SECRET = ""
```

Set the above variables and edit `signerNode/signerNode.config` to update <!--
-->the KV id and the worker route. Once you are done, you can deploy the node using

```shell
make build/signerNode.deployment
```

Your node will <!--
-->discover other nodes and request the network parameters from them. If you <!--
-->have been approved by the DAO vote, your nodes EVM address will be registered in the <!--
-->[TCKTSigners](https://github.com/KimlikDAO/TCKT/blob/main/contracts/TCKTSigners.sol) <!--
-->contract and your node will be able to prove its identity. Once that happens, <!--
-->you should start getting some requests from the KimlikDAO dApps.

![Signer Node Workers Architecture](/.github/img/SignerNodeWorkers.png?raw=true "Signer Node Workers Architecture")

## Endpoints

| Directory    | Example REST endpoints         | Purpose                                       |
| ------------ | ------------------------------ | --------------------------------------------- |
| `/meetgreet` | `/yo`                          | Node discovery / gossip                       |
| `/edevlet`   | `/edevlet/oauth2`              | Get `did.DecryptedSections` via edevlet oauth |
| `/hint`      | `/hint/revokees`               | Hints for evm node lookups                    |
| `/ipfs`      | GET `/ipfs`, PUT `/api/v0/add` | Persistence layer                             |
