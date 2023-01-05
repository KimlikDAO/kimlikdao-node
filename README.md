# KimlikDAO protocol full node
------------------------------


|   Directory      |  Example REST endpoints         |  Purpose                |
|------------------|---------------------------------|-------------------------|
|   `/meetgreet`   |  `/yo`                          | Node discovery / gossip |
|   `/ipfs`        |  GET `/ipfs`, PUT `/api/v0/add` | Persistence layer       |
|   `/edevlet`     |  `/edevlet/oauth2`              | Get `did.DecryptedSections` via edevlet oauth |
|   `/hint`        |  `/hint/revokees`               | Hints for evm node lookups |
