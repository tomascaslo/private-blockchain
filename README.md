# Private Blockchain

This project has the purpose of demonstrating the workings of a blockchain data model by leveraging the usage of `LevelDB` as the data layer. There are no consensus algorithms implemented in this project.

## Setup
To install simply clone the repo and run `npm install`.

## Tests
To run tests `npm test`.

Since by design LevelDB can only work with a single process at a time, tests run serially with jest flag `--runInBand` enabled.

## Data Model

### Block

#### Properties
```javascript
{
	hash: "", # The current blocks hash. Auto-generated when added to the Blockchain.
	height: 0, # The blocks position in the blockchain. Auto-generated when added to the Blockchain.
	body: "", # Data held in by the block. Manually added on block creation.
	time: 0, # The blocks creation timestamp. Auto-generated when added to the Blockchain.
	previousBlockHash: "", # The previous block hash. Auto-generated when added to the Blockchain.
}
```

#### Constructor
```javascript
constructor(data) { ... } 
```
- data: Used to set the Block.body property.

### Blockchain

#### Properties
```javascript
{
	chain: LevelDB(), # Object used for data persistance through usage of LevelDB.
}
```

#### Constructor
*Not to be used directly.* To create an instance of a blockchain use static method `Blockchain.load(blockchainName)` as described below.

```javascript
constructor(blockchainName) { ... }
```
- blockchainName: Used to set the database filename used internally by the `LevelDB` class.

#### Methods
```javascript

# Creates a Blockchain instance. Creates genesis block if blockchain height is 0.
static load(blockchainName) { ... } returns Blockchain instance
	
# Adds a new Block to the Blockchain.
addBlock(Block) { ... } returns Promise -> Boolean
	
# Gets Block object at specified height.
getBlock((int) height) { ... } returns Promise -> Block
	
# Validates Block at specified height.
validateBlock((int) height) { ... } returns Promise -> Boolean

# Validates whole Blockchain.
validateChain() { ... } returns Promise -> Boolean

# Get last or most recently created Block in Blockchain.
getLastBlock() { ... } returns Promise -> Block

# Get current Blockchain height.
getBlockchainHeight() { ... } returns Promise -> int

# Wrapper around Blockchain.getBlockchainHeight().
getBlockHeight() { ... } returns Promise -> int

```

## Usage
The implementation of this blockchain is heavily Promise-based. There are two main classes that handle all the logic `Blockchain` and `Block`. Underlying logic and persistance is handled through the class `LevelDB` which interfaces as a wrapper with `LevelDB` for persisting blocks.

See `implementation-usage.js`.


## Npm dependencies

* crypto-js
* level 
* express

## RESTful API
This blockchain implements a RESTful API which can be run locally for development with `npm start` which uses nodemon for automatic server reloading. Development server runs on port 8000 by default.

### Endpoints

---

`/requestValidation`

**Method:** `POST`

**Data:** JSON with `address` attribute.

```json
{
	address: string
}
```

**Returns:** JSON with to be signed message.

```json
{
    address: string,
    timestamp: date,
    message: string,
    validationWindow: int
}
```

**Example:** 

```bash
$ curl -X POST -d '{"address": "15U4AnCwdRYT5WJdtejHKK6UMSiShVFMQF"}' -H 'Content-Type: application/json' http://127.0.0.1:8000/requestValidation
{
    "address": "15U4AnCwdRYT5WJdtejHKK6UMSiShVFMQF",
    "timestamp": 1540957704748,
    "message": "15U4AnCwdRYT5WJdtejHKK6UMSiShVFMQF:1540957704748:starRegistry",
    "validationWindow": 300
}
```
---

`/message-signature/validate`

**Method:** `POST`

**Data:** JSON with `address` and `signature` attributes.

```json
{
	address: string,
	signature: string
}
```

**Returns:** JSON with status for star registration.

```json
{
    status: {
        address: string,
        timestamp: date,
        message: string,
        validationWindow: int,
        messageSignature: string
    },
    registerStar: bool
}
```

**Example:** 

```bash
$ curl -X POST -d '{"address": "15U4AnCwdRYT5WJdtejHKK6UMSiShVFMQF", "signature": "HzETcGrAPcaJ2Z2jU2cd3iPytEbbfbTK+V5SkvT7EXqZDwrp7HDS7Sz/L8Ve4r/JyfCQssOQS0BxPbNDp3m0FUQ="}' -H 'Content-Type: application/json' http://127.0.0.1:8000/message-signature/validate
{
    "status": {
        "address": "15U4AnCwdRYT5WJdtejHKK6UMSiShVFMQF",
        "timestamp": 1540957704748,
        "message": "15U4AnCwdRYT5WJdtejHKK6UMSiShVFMQF:1540957704748:starRegistry",
        "validationWindow": 243,
        "messageSignature": "valid"
    },
    "registerStar": true
}
```
---

`/block`

**Method:** `POST`

**Data:** JSON with `address` and `star` attributes.

```json
{
  address: string,
  star: {
    dec: string,
    ra: string,
    story: string
    mag: string,
    con: string
  }
}
```

**Returns:** JSON with newly created star block data.

```json
{
    hash: string,
    height: int,
    body: {
        address: string,
        star: {
            dec: string,
            ra: string,
            story: string,
            mag: string or null,
            con: string or null
        }
    },
    time: date,
    previousBlockHash: string
}
```

**Example:** 

```bash
$ curl -X POST -d '{"address": "15U4AnCwdRYT5WJdtejHKK6UMSiShVFMQF", "star": {"dec": "69° 7' 5", "ra": "10h 12m 2s", "story": "Found star using https://www.google.com/sky/"}}' -H 'Content-Type: application/json' http://127.0.0.1:8000/block/
{
  "address": "15U4AnCwdRYT5WJdtejHKK6UMSiShVFMQF",
  "star": {
    "dec": "69° 7' 5",
    "ra": "10h 12m 2s",
    "story": "Found star using https://www.google.com/sky/"
  }
}
```
---
`/stars/address:[address]`

**Method:** `GET`

**Returns:** Array of JSON with matching `address`.

**Example:** 

```bash
$ curl http://127.0.0.1:8000/stars/address:15U4AnCwdRYT5WJdtejHKK6UMSiShVFMQF
[
    {
        "hash": "dd2a7539ecd972f4106c9eae892164e04c89da9f0b7260829cd3d595b82693d7",
        "height": 1,
        "body": {
            "address": "15U4AnCwdRYT5WJdtejHKK6UMSiShVFMQF",
            "star": {
                "dec": "-26° 29'' 24.9",
                "ra": "16h 29m 1.0s",
                "story": "Found star using https://www.google.com/sky/",
                "mag": null,
                "con": null
            }
        },
        "time": "1540611764",
        "previousBlockHash": "7728b6c324c091afc100944086a063c59cd6b70d91d6a28678115df87fae69f3"
    },
    {
        "hash": "3f26228581515ba67d33d3e103ddae1be33106ec79d3e033bea3cef49b40755d",
        "height": 2,
        "body": {
            "address": "15U4AnCwdRYT5WJdtejHKK6UMSiShVFMQF",
            "star": {
                "dec": "-26° 29'' 24.9",
                "ra": "16h 29m 1.0s",
                "story": "Found star using https://www.google.com/sky/",
                "mag": null,
                "con": null
            }
        },
        "time": "1540957788",
        "previousBlockHash": "dd2a7539ecd972f4106c9eae892164e04c89da9f0b7260829cd3d595b82693d7"
    },
    {
        "hash": "e971031b82cc687681900b188f94c0528e8cede0a1649001d33d507b7926d586",
        "height": 3,
        "body": {
            "address": "15U4AnCwdRYT5WJdtejHKK6UMSiShVFMQF",
            "star": {
                "dec": "69° 6' 33",
                "ra": "10h 12m 24s",
                "story": "Found star using https://www.google.com/sky/",
                "mag": null,
                "con": null
            }
        },
        "time": "1540957812",
        "previousBlockHash": "3f26228581515ba67d33d3e103ddae1be33106ec79d3e033bea3cef49b40755d"
    },
    {
        "hash": "0e99a7ab14f3d62063cae65b1db3705686d1e4dee8a00bc3e60bf75d686221c3",
        "height": 4,
        "body": {
            "address": "15U4AnCwdRYT5WJdtejHKK6UMSiShVFMQF",
            "star": {
                "dec": "69° 7' 5",
                "ra": "10h 12m 2s",
                "story": "Found star using https://www.google.com/sky/",
                "mag": null,
                "con": null
            }
        },
        "time": "1540957833",
        "previousBlockHash": "e971031b82cc687681900b188f94c0528e8cede0a1649001d33d507b7926d586"
    }
]
```
---
`/stars/hash:[hash]`

**Method:** `GET`

**Returns:** JSON with specified block data.

**Example:** 

```bash
$ curl http://127.0.0.1:8000/stars/hash:0e99a7ab14f3d62063cae65b1db3705686d1e4dee8a00bc3e60bf75d686221c3
{
    "hash": "0e99a7ab14f3d62063cae65b1db3705686d1e4dee8a00bc3e60bf75d686221c3",
    "height": 4,
    "body": {
        "address": "15U4AnCwdRYT5WJdtejHKK6UMSiShVFMQF",
        "star": {
            "dec": "69° 7' 5",
            "ra": "10h 12m 2s",
            "story": "Found star using https://www.google.com/sky/",
            "mag": null,
            "con": null
        }
    },
    "time": "1540957833",
    "previousBlockHash": "e971031b82cc687681900b188f94c0528e8cede0a1649001d33d507b7926d586"
}
```
---
`/block/[height]`

**Method:** `GET`

**Returns:** JSON with star block data at height `height`.

**Example:** 

```bash
$ curl http://127.0.0.1:8000/block/0
{
	"hash":"676d6c8939f466f517a48ae8a354888df14a583f987fb544175354eaba525ea3",
	"height":0,
	"body":"First block in the chain - Genesis block",
	"time":"1536001430",
	"previousBlockHash":""
}
```
---