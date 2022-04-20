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


1. **handleInit:** CollateralType registration

>function init(bytes32 ilk)

This function modifies the following entities:

1. CollateralType: It is created with the ilk<function param arg1 "ilk"> and modified as follows:
  
  - the "rate" attr<rate> is set to 1 in RAY format

    ilks[ilk].rate = 10 ** 27;

  - the "auctionDuration" attr<auctionDuration> is set to 2 days
  - the "bidDuration" attr<bidDuration> is set to 3 hours
  - the "minimumBidIncrease" attr<minimumBidIncrease> is set to 1.05, 5% minimum bid increase

2. SystemState:
  - the "collateralCount" is increased by 1

Liaison between the oracles and core contracts (spot)

	address:
	0x65c79fcb50ca1594b025960e539ed7a9a6d434a3


1. **handleMove** Transfer Stablecoin

>function move(address src, address dst, uint256 rad)

This function moves the DAI Stablecoin from address to another. It modifies or creates the following entities:

1. User: It loads the user with the src <function param arg1 "src"> address.

  - The field DAI is decreased by substracting the <function param arg3 "rad"> (as wad) from the DAI field.

    dai[src] = _sub(dai[src], rad);

2. User: It loads the user with the dst <function param arg2 "dst"> address and adds the . 

  - The field DAI is increased by adding the <function param arg3 "rad"> (as wad) to the DAI field

    dai[dst] = _add(dai[dst], rad);


3. **handleFork** Split a Vault - binary approval or splitting/merging Vaults

> function fork(bytes32 ilk, address src, address dst, int dink, int dart)

This function modifies the following entities:

  - Vault
    - "collateral"
    - "debt"
  - VaultSplitChangeLog
    - "src"
    - "dst"
    - "collateralToMove"
    - "debtToMove"

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

## Entities

### 1. Vault

Collateralized debt position or CDPs

```graphql
type Vault @entity {
  " Equals to: <urn>-<ilk>"
  id: ID!

  " CDP ID if this vault was created through the manager (CdpManager) "
  cdpId: BigInt

  " Collateral type associated to this vault (ilk) "
  collateralType: CollateralType!

  " Assets locked as collateral (ink) "
  collateral: BigDecimal!

  " Outstanding debt (art) [DAI] "
  debt: BigDecimal!

  " Address of this vault's UrnHandler instance "
  handler: Bytes!

  " Address of vault's owner "
  owner: User!

  " Timestamp of the block in which this vault was opened [seconds] "
  openedAt: BigInt!

  " Block number in which this vault was opened "
  openedAtBlock: BigInt!

  " Transaction hash in which this vault was opened "
  openedAtTransaction: Bytes!

  " Timestamp of the block in which this vault was last modified [seconds] "
  modifiedAt: BigInt

  " Block number in which this vault was last modified "
  modifiedAtBlock: BigInt

  " Transaction hash in which this vault was last modified "
  modifiedAtTransaction: Bytes

  " Vault action history "
  logs: [VaultLog!] @derivedFrom(field: "vault")
}
```

### 2. CollateralType

Particular collateral type registered in the system (Ilk)

```graphql
type CollateralType @entity {
  " Collateral type name "
  id: ID!

  #
  # Debt
  #

  " Debt ceiling [DAI] (line) "
  debtCeiling: BigDecimal!

  " Debt backed by this collateral type [DAI] (Art)"
  debtNormalized: BigDecimal!

  " Asset/DAI exchange rate (rate) "
  rate: BigDecimal!

  " Total assets locked as collateral"
  totalCollateral: BigDecimal!

  " Total debt backed by this collateral type [DAI] (Ilk.Art * rate)"
  totalDebt: BigDecimal!

  #
  # Liquidation parameters
  #

  " Maximum size of collateral that can be auctioned at once (lump) "
  liquidationLotSize: BigDecimal!

  " Liquidation penalty (chop) "
  liquidationPenalty: BigDecimal!

  " Min collateralization ratio "
  liquidationRatio: BigDecimal!

  #
  # Collateral auctions
  #

  " Collateral auctions for this collateral type "
  auctions: [CollateralAuction!] @derivedFrom(field: "collateral")

  " Number of collateral auctions started for this collateral type "
  auctionCount: BigInt!

  " Maximum auction duration [seconds] "
  auctionDuration: BigInt!

  " Max bid duration in a collateral auction [seconds] "
  bidDuration: BigInt!

  " Minimum bid increase in a collateral auction "
  minimumBidIncrease: BigDecimal!

  #
  # Stability rates
  #

  " Stability fee rate per second "
  stabilityFee: BigDecimal!

  #
  # Vaults
  #

  " Collateral auctions for this collateral type "
  vaults: [Vault!] @derivedFrom(field: "collateralType")

  " Min debt per vault [DAI] (dust) "
  vaultDebtFloor: BigDecimal!

  " Number of vaults opened through the manager (CdpManager) "
  vaultCount: BigInt!

  " Number of vaults NOT opened through the manager (CdpManager) "
  unmanagedVaultCount: BigInt!

  #
  # Asset price
  #

  " Current market price [USD] "
  price: CollateralPrice

  " Price history "
  prices: [CollateralPrice!] @derivedFrom(field: "collateral")

  #
  # Status fields
  #

  " Timestamp of the block in which this collateral type was added [seconds] "
  addedAt: BigInt!

  " Block number in which this collateral type was added "
  addedAtBlock: BigInt!

  " Transaction hash in which this collateral type was added "
  addedAtTransaction: Bytes!

  " Timestamp of the block in which this collateral type was last modified [seconds] "
  modifiedAt: BigInt

  " Block number in which this collateral type was last modified "
  modifiedAtBlock: BigInt

  " Transaction hash in which this collateral type was last modified "
  modifiedAtTransaction: Bytes
}
```

### 3. User

Vault owner

```graphql
type User @entity {
  " Equals to account address "
  id: ID!

  " Account address "
  address: Bytes!

  " User's DAI "
  dai: BigDecimal!

  " Number of user proxies associated to the user "
  proxyCount: BigInt!

  " Number of vaults opened by the user "
  vaultCount: BigInt!

  " User proxies. Up to one per collateral type "
  proxies: [UserProxy!] @derivedFrom(field: "owner")

  " User's vaults "
  vaults: [Vault!] @derivedFrom(field: "owner")
}
```

### 4. SystemState

Provide information about the current system state and parameters

```graphql
type SystemState @entity {
  " Singleton entity. Equals to 'current' "
  id: ID!

  #
  # General protocol stats
  #

  " Total debt issued [DAI] (Vat.debt)"
  totalDebt: BigDecimal!

  #
  # About number of entities registered system-wide
  #

  " Number of collateral types registered "
  collateralCount: BigInt!

  " Number of collateral auctions started "
  collateralAuctionCount: BigInt!

  " Number of user proxies created "
  userProxyCount: BigInt!

  " Number of vaults NOT opened through the manager (CdpManager) "
  unmanagedVaultCount: BigInt!

  " Number of vaults opened through the manager (CdpManager) "
  vaultCount: BigInt!

  #
  # General system parameters
  #

  " Base rate for stability fee per second "
  baseStabilityFee: BigDecimal!

  " Dai Savings Rate "
  savingsRate: BigDecimal!

  " Total Debt Ceiling "
  totalDebtCeiling: BigDecimal!

  #
  # Debt auction parameters (flop)
  #

  " Max bid duration / single bid lifetime [seconds] "
  debtAuctionBidDuration: BigInt

  " The fixed debt quantity to be covered by any one debt auction [DAI] "
  debtAuctionBidSize: BigDecimal

  " Debt auction delay [seconds] "
  debtAuctionDelay: BigInt

  " Maximum auction duration [seconds] "
  debtAuctionDuration: BigInt

  " The starting amount of MKR offered to cover the lot [MKR] "
  debtAuctionInitialLotSize: BigDecimal

  " Lot size increase "
  debtAuctionLotSizeIncrease: BigDecimal

  " Minimum bid increase "
  debtAuctionMinimumBidIncrease: BigDecimal

  #
  # Surplus auction parameters (flap)
  #

  " Max bid duration / bid lifetime [seconds] "
  surplusAuctionBidDuration: BigInt

  " Surplus buffer, must be exceeded before surplus auctions are possible [DAI] "
  surplusAuctionBuffer: BigDecimal

  " Maximum auction duration [seconds] "
  surplusAuctionDuration: BigInt

  " The fixed surplus quantity to be sold by any one surplus auction [DAI] "
  surplusAuctionLotSize: BigDecimal

  " Minimum bid increase "
  surplusAuctionMinimumBidIncrease: BigDecimal

  #
  # Status fields
  #

  " The latest block in which a system parameters was modified "
  block: BigInt!

  " The latest timestamp in which a system parameters was modified "
  timestamp: BigInt!

  " The latest transaction hash in which a system parameters was modified "
  transaction: Bytes!
}
```