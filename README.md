# Maker Protocol Subgraph

_Made by [Protofire.io](https://protofire.io/) under GPL-3.0-only License_

---

> "The Maker Protocol, also known as the Multi-Collateral Dai (MCD) system, allows users to generate Dai by leveraging collateral assets approved by “Maker Governance."

[Took from white paper](https://makerdao.com/en/whitepaper/)

---

## Description

This subgraph aims to track the status of the Multi-Collateral DAI (MCD) through multiple contracts.

---

## Data sources

### Core Module:

> The Core Module is crucial to the system as it contains the entire state of the Maker Protocol and controls the central mechanisms of the system while it is in the expected normal state of operation.

#### Vault Engine (Vat)

> fill me with the description of the contract

##### handleInit

```
function init(bytes32 ilk) external note auth {
  require(ilks[ilk].rate == 0, "Vat/ilk-already-init");
  ilks[ilk].rate = 10 ** 27;
}
```

Creates new _CollateralType_

The _handleInit_ mapper function receives a _LogNote_ event as parameter. We pick the _collateralTypeId_ from the _arg1_ then we create the _CollateralType_ record with some default values. Also, we track the _collateralType_ quantity by increasing the field _collateralCount_ on _SystemState_.

##### handleFile

```
function file(bytes32 what, uint data) external note auth {
  require(live == 1, "Vat/not-live");
  if (what == "Line") Line = data;
  else revert("Vat/file-unrecognized-param");
}

function file(bytes32 ilk, bytes32 what, uint data) external note auth {
  require(live == 1, "Vat/not-live");
  if (what == "spot") ilks[ilk].spot = data;
  else if (what == "line") ilks[ilk].line = data;
  else if (what == "dust") ilks[ilk].dust = data;
  else revert("Vat/file-unrecognized-param");
}
```

Updates _CollateralType_ and _SystemState_

- _SystemState_.totalDebtCeiling
- _CollateralType_.debtCeiling
- _CollateralType_.vaultDebtFloor

The _handleFile_ mapper function receives a _LogNote_ event as parameter. This handler processes 2 contract functions with the same name _file_ but different arity. We use the _signature_ parameter to split the logic for those contract functions.

##### handleCage

```
function cage() external note auth {
  live = 0;
}
```

Creates a _LiveChangeLog_ entry for the contract address

##### handleSlip

```
  function slip(bytes32 ilk, address usr, int256 wad) external note auth {
    gem[ilk][usr] = add(gem[ilk][usr], wad);
  }
```

Updates _Collateral_, _CollateralType_ and _CollateralChangeLog_

- _Collateral_.amount
- _CollateralType_.totalCollateral
- _CollateralChangeLog_.collateralAfter
- _CollateralChangeLog_.collateralBefore

The _handleSlip_ mapper function receives a _LogNote_ event as parameter. We pick the _collateralTypeId_ from _arg1_, _user_ from _arg2_ and the _amount_ from _arg3_. Then we update the _amount_ of _CollateralType_ for the _user_ and track the change in time adding an entry on _CollateralChangeLog_.

##### handleFlux

Transfers collateral between users

```
function flux(bytes32 ilk, address src, address dst, uint256 wad) external note {
  require(wish(src, msg.sender), "Vat/not-allowed");
  gem[ilk][src] = sub(gem[ilk][src], wad);
  gem[ilk][dst] = add(gem[ilk][dst], wad);
}
```

Updates _Collateral_ and _CollateralTransferLog_

- _Collateral_.amount
- _CollateralTransferLog_.amount
- _CollateralTransferLog_.src
- _CollateralTransferLog_.dst
- _CollateralTransferLog_.collateral
- _CollateralTransferLog_.direction

The _handleFlux_ mapper function receives a _LogNote_ event as parameter. Here we receive 4 parameters; _ilk_ (the CollateralType id), _src_ (the source User), _dst_ (the destination User) and _wad_ (amount of Collateral) to transfer.

We track the collateral balance of the user by updating a record in the _Collateral_ entity. Then we track the movement by adding a record in the _CollateralTransferLog_ entity.

##### handleMove

##### handleFrob

##### handleFork

##### handleGrab

##### handleHeal

##### handleSuck

##### handleFold

#### Liaison between the Oracles and Core Contracts (Spot)

> fill me with the description of the contract

##### handleFile

##### handlePoke

##### handleCage

### Dai Module:

> The DAI token contract and all of the adapters DaiJoin adapters.

#### Token

> fill me with the description of the contract

##### handleTransfer

##### handleApproval

### Liquidation Module:

> The Maker Protocol's Collateral Auction House (Liquidation System 2.0)

#### fill me (Clipper)

> fill me with the description of the contract

##### handleFile1

##### handleFile2

##### handleKick

##### handleTake

##### handleRedo

##### handleYank

#### fill me (Dog)

> fill me with the description of the contract

##### handleCage

##### handleDigs

##### handleFileVow

##### handleFileHole

##### handleFileChop

##### handleFileClip

##### handleBark

### MKR Module:

> fill me with the description of the module

#### fill me (DsToken)

> fill me with the description of the contract

##### handleTransfer

##### handleApproval

##### handleMint

##### handleBurn

### Proxy Module:

> fill me with the description of the module

#### Proxy registration (ProxyFactory)

> fill me with the description of the contract

##### handleCreated

### Rates Module:

> fill me with the description of the module

#### Accumulation of Stability Fees for Collateral Types (Jug)

> fill me with the description of the contract

##### handleInit

##### handleDrip

##### handleFile

#### The Dai Savings Rate (Pot)

> fill me with the description of the contract

##### handleFile

##### handleCage

##### handleJoin

##### handleExit

##### handleDrip

### System Stabilizer Module:

> fill me with the description of the module

#### Surplus Auction House (Flapper)

> fill me with the description of the contract

##### handleFile

##### handleCage

##### handleKick

##### handleTick

##### handleDeal

##### handleTend

##### handleYank

#### Debt Auction House (Flopper)

> fill me with the description of the contract

##### handleFile

##### handleCage

##### handleKick

##### handleTick

##### handleDeal

##### handleDent

##### handleYank

#### Balance Sheet (Vow)

> fill me with the description of the contract

##### handleFile

##### handleCage

##### handleFrog

##### handleFess

##### handleFlap

##### handleFlop

##### handleKiss
