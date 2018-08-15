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