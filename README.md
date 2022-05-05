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


2. **handleInit:** CollateralType registration

> function init(bytes32 ilk)

This function modifies the following entities:

- CollateralType: It is created with the ilk<function param arg1 "ilk"> and modified as follows:
  
  - the "rate" attr<rate> is set to 1 in RAY format

    ilks[ilk].rate = 10 ** 27;

  - the "auctionDuration" attr<auctionDuration> is set to 2 days
  - the "bidDuration" attr<bidDuration> is set to 3 hours
  - the "minimumBidIncrease" attr<minimumBidIncrease> is set to 1.05, 5% minimum bid increase

- SystemState:
  - the "collateralCount" is increased by 1


3. **handleFrob:** Vault creation / modification

> function frob(bytes32 i, address u, address v, address w, int dink, int dart)

Modified entities:

  - Vault
    - "collateralType"
    - "collateral"
    - "debt"
    - "handler"
    - "owner"
  - CollateralType
    - "unmanagedVaultCount"
    - "totalCollateral"
    - "debtNormalized"
    - "totalDebt"
  - User
    - "vaultCount"
  - SystemState
    - "unmanagedVaultCount"
  - VaultCreationLog
    - "vault"
  - VaultCollateralChangeLog
    - "vault"
    - "collateralBefore"
    - "collateralAfter"
    - "collateralDiff"
  - VaultDebtChangeLog
    - "vault"
    - "debtBefore"
    - "debtAfter"
    - "debtDiff"

4. **handleFile:** CollateralType updates

This mapping handles 2 contract functions with the same name but different params by the use of an anonymous event that has a signature hash that depends on the params provided. We use this signature hash to split the logic for each contract function.

> function file(bytes32 what, uint data)

> function file(bytes32 ilk, bytes32 what, uint data)

If the signature matches the first function and the `what` param is "Line" then it updates the `totalDebtCeiling` on the `SystemState` Entity.
In the other hand if the signature matches the second function, we use the `ilk` param to load the `CollateralType` then we look at the `what` param to know what to update. ("line" means `Debt Ceiling` while "dust" means `Debt Floor`)

Entities modified:

- SystemState
  - the "totalDebtCeiling" attr<totalDebtCeiling> is updated with the data <function param arg2 "data">

      if (what == "Line") Line = data;

- CollateralType: 
It is loaded from the ilk <function param arg1 "ilk"> and modified as follows:
  - the "debtCeiling" attr<debtCeiling> is updated with the data <function param arg2 "data">

      > else if (what == "line") ilks[ilk].line = data;

  - the "vaultDebtFloor" attr<vaultDebtFloor> is updated with the data <function param arg2 "data">

      > else if (what == "dust") ilks[ilk].dust = data;

1. **handleSlip** Modify a user's collateral balance

>function slip(bytes32 ilk, address usr, int256 wad)

This function is executed e.g. by the join contract and modifies a user's collateral balance. It creates or modifies the following entity:

1. Collateral: It loads or creates a collateral <function param arg1 "ilk"> for a certain user <function param arg2 "usr">

  - The field amount is increased or decreased by adding <function param arg3 "wad"> (as wad)

    gem[ilk][usr] = add(gem[ilk][usr], wad);


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

5. **handleSuck** Mint unbacked stablecoin

> function suck(address u, address v, uint rad)

This function modifies the following entities:

    - User
      - "dai"
    - SystemDebt
      - "amount"
      - "owner"
    - SystemStatus
      - "totalDebt"
      - "totalSystemDebt"
    
2. **handleFold** Modify the debt multiplier, creating/destroying corresponding debt

> function fold(bytes32 i, address u, int rate)

This function modifies the following entities:

  - CollateralType
    - "rate"
  - User
    - "dai"
  - SystemState
    - "totalDebt"

6. **handleHeal** Create/destroy equal quantities of stablecoin and system debt

> function heal(uint rad)

This function modifies the following entities:

    - User
      - "dai"
    - SystemDebt
      - "amount"
      - "owner"
    - SystemStatus
      - "totalDebt"
      - "totalSystemDebt"
      
1. **handleFlux** Transfer Collateral between Users

>function flux(bytes32 ilk, address src, address dst, uint256 wad)

This function modifies the following entities:

1. Collateral: It loads the Collateral with the helper function loadOrCreateCollateral, which takes the ilk <function param arg1 "ilk"> and the src <function param arg2 "src"> address, as params

  - The field 'amount' is decreased by substracting the <function param data "wad"> from the amount field

2. Collateral: It loads the Collateral with the helper function loadOrCreateCollateral, which takes the ilk <function param arg1 "ilk"> and the src <function param arg3 "dst"> address, as params

  - The field 'amount' is increased by adding the <function param data "wad"> to the amount field

3. CollateralTransferLog: It creates a new CollateralTransferLog and updates it's fields

    > let log = new CollateralTransferLog(event.transaction.hash.toHex() + '-' + event.logIndex.toString() + '-5')

7. **handleCage** Set the Vat liveness to false

>function cage()

This function modifies the fllowing entities:

    -LiveChangeLog


Liquidation Agent (cat) 
TODO: remove, deprecated

	address: 0x78f2c2af65126834c51822f56be0d7469d7a523e

TODO: LIQUIDATION 2.0 DOG / CLIP / ABACUS

#### Liaison between the oracles and core contracts (spot)

  address: 0x65c79fcb50ca1594b025960e539ed7a9a6d434a3

1. **handleCage** Set the Spot liveness to false

>function cage()

This function modifies the fllowing entities:

    -LiveChangeLog

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

### 5. Collateral

Provide information about the user's current collateral (gem)
```graphql
" Collateral tokens (Gem)"
type Collateral @entity {
  " Collateral tokens (Gem) : ${user.id}-${collateralType.id} "
  id: ID!

  " Collateral type "
  type: CollateralType!

  " Account that owns this Collateral "
  owner: User!

  " Amount of collateral "
  amount: BigDecimal!

  " Timestamp of the block in which this collateral was created [seconds] "
  createdAt: BigInt

  " Block number in which this collateral was created "
  createdAtBlock: BigInt

  " Transaction hash in which this collateral was created "
  createdAtTransaction: Bytes

  " Timestamp of the block in which this collateral was last modified [seconds] "
  modifiedAt: BigInt

  " Block number in which this collateral was last modified "
  modifiedAtBlock: BigInt

  " Transaction hash in which this collateral was last modified "
  modifiedAtTransaction: Bytes

  " UserCollateral action history "
  logs: [CollateralLog!] @derivedFrom(field: "collateral")
}
```