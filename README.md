# KimlikDAO protocol full node
------------------------------


|   File           |  Example REST endpoints         |  Purpose                |
|------------------|---------------------------------|-------------------------|
|   `/meetgreet`   |  `/yo`                          | Node discovery / gossip |
|   `/edevlet`     |  `/edevlet/oauth2`              | Get `did.DecryptedSections` via edevlet oauth |
|   `/hint`        |  `/hint/revokees`               | Hints for evm node lookups |
|   `ipfs.js`      |  GET `/ipfs`, PUT `/api/v0/add` | Persistence layer       |
