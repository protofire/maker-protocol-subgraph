# Maker Protocol Subgraph
_Made by [Protofire.io](https://protofire.io/) under GPL-3.0-only License_
___
> "The Maker Protocol, also known as the Multi-Collateral Dai (MCD) system, allows users to generate Dai by leveraging collateral assets approved by “Maker Governance."

[Took from white paper](https://makerdao.com/en/whitepaper/)
___

## Description
This subgraph aims to track the status of the Multi-Collateral DAI (MCD) trough multiple contracts.

___

TODO: add docs

## Data sources

### 0. Dai Module


Dai 

	TODO: index dai contract
	address: 0x6b175474e89094c44da98b954eedeac495271d0f

Dai Join :

	TODO: index dai join contract
	address: 0x9759a6ac90977b93b58547b4a71c78317f391a28


### 1.  Core Module:

#### Vault Engine (vat)

	address: 0x35d1b3f3d7966a1dfe207aa4514c12a259a0492b

	TODO: handleSlip
	TODO: handleFlux
	TODO: handleMove

1. **handleGrab:** Vault liquidation

	_It's also referred as "*CDP Confiscation*"_

	This function is executed by the Liquidation module trough the "Bark method" and modifies


  

Liaison between the oracles and core contracts (spot)

	address:
	0x65c79fcb50ca1594b025960e539ed7a9a6d434a3


Liquidation Agent (cat) 
TODO: remove, deprecated

	address: 0x78f2c2af65126834c51822f56be0d7469d7a523e

TODO: LIQUIDATION 2.0 DOG / CLIP / ABACUS


### 2. System Stabilizer Module:

Surplus Auction (flapper)

	address: 0xdfe0fb1be2a52cdbf8fb962d5701d7fd0902db9f
	TODO: handleKick

Debt Auction (flop)

	address: 0x4d95a049d5b0b7d32058cd3f2163015747522e99
	TODO:handleKick

Balance Sheet (vow)

	address: 0xa950524441892a31ebddf91d3ceefa04bf454466
	TODO: heal

### 3. Rates Module:

Jug - Accumulation of Stability Fees for collateral types

	// TODO: estimate
	address: 0x19c0976f590d67707e62397c87829d896dc0f1f1


Dai Savings Rate (pot)

	TODO: vow
	address: 0x197e90f9fad81970ba7976f33cbd77088e5d7cf7



### 4. Proxy Module

Used to deploy new user proxy instances (ProxyFactory)

	address: 0xa26e15c895efc0616177b7c1e7270a4c7d51c997

Allow users to interact with their Vaults in an easy way, treating them as non-fungible tokens NFTs (CdpManager)

	address: 0x5ef30b9986345249bc32d8928b7ee64de9435e39
 

### 5. Flash Mint

TODO: Flash mint support

### 6. templates:

Collateral Auction (flip)
