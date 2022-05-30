# Maker Protocol Subgraph
_Made by [Protofire.io](https://protofire.io/) under GPL-3.0-only License_
___
> "The Maker Protocol, also known as the Multi-Collateral Dai (MCD) system, allows users to generate Dai by leveraging collateral assets approved by “Maker Governance."

[Took from white paper](https://makerdao.com/en/whitepaper/)
___

## Description
This subgraph aims to track the status of the Multi-Collateral DAI (MCD) through multiple contracts.

___

## Data sources

### Dai Module:

	TODO: index dai contract

### Core Module

#### Vault Engine (vat)

**handleGrab:** Vault liquidation

>function grab(bytes32 i, address u, address v, address w, int dink, int dart)

_It's also referred as "*CDP Confiscation*"_

This function is executed by the Liquidation module through the "Bark method" and modifies following entities:

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


**handleInit:** CollateralType registration

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


**handleFrob:** Vault creation / modification

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

**handleFile:** CollateralType updates

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

**handleSlip:** Modify a user's collateral balance

> function slip(bytes32 ilk, address usr, int256 wad)

This function is executed e.g. by the join contract and modifies a user's collateral balance. It creates or modifies the following entity:

1. Collateral: It loads or creates a collateral <function param arg1 "ilk"> for a certain user <function param arg2 "usr">

    - The field amount is increased or decreased by adding <function param arg3 "wad"> (as wad)

      > gem[ilk][usr] = add(gem[ilk][usr], wad);


**handleMove:** Transfer Stablecoin

> function move(address src, address dst, uint256 rad)

This function moves the DAI Stablecoin from address to another. It modifies or creates the following entities:

1. User: It loads the user with the src <function param arg1 "src"> address.

    - The field DAI is decreased by substracting the <function param arg3 "rad"> (as wad) from the DAI field.

      > dai[src] = _sub(dai[src], rad);

2. User: It loads the user with the dst <function param arg2 "dst"> address and adds the. 

    - The field DAI is increased by adding the <function param arg3 "rad"> (as wad) to the DAI field

      > dai[dst] = _add(dai[dst], rad);


**handleFork:** Split a Vault - binary approval or splitting / merging Vaults

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

**handleSuck:** Mint unbacked stablecoin

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
    
**handleFold:** Modify the debt multiplier, creating / destroying corresponding debt

> function fold(bytes32 i, address u, int rate)

This function modifies the following entities:

  - CollateralType
    - "rate"
  - User
    - "dai"
  - SystemState
    - "totalDebt"

**handleHeal:** Create / destroy equal quantities of stablecoin and system debt

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
      
**handleFlux:** Transfer Collateral between Users

> function flux(bytes32 ilk, address src, address dst, uint256 wad)

This function modifies the following entities:

1. Collateral: It loads the Collateral with the helper function loadOrCreateCollateral, which takes the ilk <function param arg1 "ilk"> and the src <function param arg2 "src"> address, as params

    - The field 'amount' is decreased by substracting the <function param data "wad"> from the amount field

2. Collateral: It loads the Collateral with the helper function loadOrCreateCollateral, which takes the ilk <function param arg1 "ilk"> and the src <function param arg3 "dst"> address, as params

    - The field 'amount' is increased by adding the <function param data "wad"> to the amount field

3. CollateralTransferLog: It creates a new CollateralTransferLog and updates it's fields

    > let log = new CollateralTransferLog(event.transaction.hash.toHex() + '-' + event.logIndex.toString() + '-5')

**handleCage:** Set the Vat liveness to false

> function cage()

This function modifies the fllowing entities:

    - LiveChangeLog

**handlePoke:** Update the price of a collateral (ilk)

> function poke(bytes32 ilk)

This function modifies the following entities:

1. Collateral: The function checks if a given collateral is already created. If it is, it updates the CollateralPrice field on this collateral

2. CollateralPrice: It creates a new CollateralPrice entity for the given Collateral

3. CollateralPriceUpdateLog: It creates a new CollateralPriceUpdateLog

**handleCage:** Set the Spot liveness to false

> function cage()

This function modifies the fllowing entities:

    - LiveChangeLog

### System Stabilizer Module:

Surplus Auction (flapper)

	address: 0xdfe0fb1be2a52cdbf8fb962d5701d7fd0902db9f
	TODO: handleKick

**handleCage:** Set the Flapper liveness to false 

> function cage(uint rad)

This function modifies the fllowing entities:

    - LiveChangeLog

Debt Auction (flop)

	address: 0x4d95a049d5b0b7d32058cd3f2163015747522e99
	TODO:handleKick

Balance Sheet (vow)

	address: 0xa950524441892a31ebddf91d3ceefa04bf454466
	TODO: heal

**handleCage:** Set the Vow liveness to false 

> function cage()

This function modifies the fllowing entities:

    - LiveChangeLog

**handleFess:** Pushes debt to the debt-queue

> function fess(uint tab)

This function modifies the following entities:

  1. SystemState: It adds the parameter tab to the systemDebtQueue attribute

  2. PushDebtQueueLog: Creates a Log Event 

### Rates Module:

Jug - Accumulation of Stability Fees for collateral types

	// TODO: estimate
	address: 0x19c0976f590d67707e62397c87829d896dc0f1f1


Dai Savings Rate (pot)

	TODO: vow
	address: 0x197e90f9fad81970ba7976f33cbd77088e5d7cf7

### Proxy Module:

TODO

### Collateral Module:

TODO

### Liquidation Module:

TODO

### Flash Mint Module

TODO

### MKR Module:

TODO

### Governance Module:

TODO
