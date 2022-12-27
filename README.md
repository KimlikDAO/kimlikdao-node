# KimlikDAO protocol full node
------------------------------


|   Directory      |  Example REST endpoints         |  Purpose                |
|------------------|---------------------------------|-------------------------|
|   `/meetgreet`   |  `/yo`                          | Node discovery / gossip |
|   `/pdf`         |  PUT `/pdf`, GET `/pdf/commit`  | Get `did.DecryptedInfos` from pdf  |
|   `/ipfs`        |  GET `/ipfs`, PUT `/api/v0/add` | Persistence layer       |
|   `/edevlet`     |  `/edevlet`                     | Get `did.DecryptedInfos` via edevlet oauth |
|   `/hint`        |  `/hint/revokees`               | Hints for evm node lookups |
