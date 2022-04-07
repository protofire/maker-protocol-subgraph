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

>function grab(bytes32 i, address u, address v, address w, int dink, int dart)


_It's also referred as "*CDP Confiscation*"_

This function is executed by the Liquidation module trough the "Bark method" and modifies following entities:

1. User: the user is created with the urnAddress<function param arg2 "u">

2. User: the liquidator is created with the  liquidatorAddress<function param arg3 "v">

3. CollateralType: the ilk is loaded with the ilkAddress<function param arg1 "i"> and modified as follows:
	- the "debtNormalized" attr<art> is decreased by adding the "dart" value (negative signed float number)

			ilk.Art = _add(ilk.Art, dart); // vat.sol ln213


	- the "totalDebt" attr<dtab> ir re calculated by multipliying the "debtNormalized" times the 
	"colalteralType's rate"

			int dtab = _mul(ilk.rate, dart); // vat.sol ln215

4. Vault: the urn is loaded with the urnAddress<function param arg2 "u"> and modified as follows:

	- the "collateral" attr<ink> is decreased by adding the "dink" value (negative signed float number)

			urn.ink = _add(urn.ink, dink); // vat.sol ln211

	- the "debt" attr<art> is decreased by adding the "dart" value (negative signed float number)
			
			urn.art = _add(urn.art, dart); // vat.sol ln212

5. Collateral: the gem is created or loaded with the composition of the CollateralType ilkAddress<function param arg1 "i"> and the User liquidatorAddress<function param arg3 "v">

	- the "amount" is increased by substracting the "dink" value (negative signed float number)
		
			gem[i][v] = _sub(gem[i][v], dink); // vat.sol ln217

6. SystemDebt: the sin is created or loaded with the vowAddres<function param arg3 "w">

	- the "amount" is increased by substracting the "dtab" value (negative signed float number)
	
			sin[w]    = _sub(sin[w],    dtab); // vat.sol ln218

7. SystemState: the systemState is loaded with it's singleton id.

	-	the "totalSystemDebt" attr<vice> is increased by substracting the "dtab" value (negative signed float number)

			vice      = _sub(vice,      dtab); // vat.sol ln219


  

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
