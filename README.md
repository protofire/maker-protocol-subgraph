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
function init(bytes32 ilk)
```

Creates new _CollateralType_

The _handleInit_ mapper function receives a _LogNote_ event as parameter. We pick the _collateralTypeId_ from the _arg1_ then we create the _CollateralType_ record with some default values. Also, we track the _collateralType_ quantity by increasing the field _collateralCount_ on _SystemState_.

##### handleFile

```
function file(bytes32 what, uint data)

function file(bytes32 ilk, bytes32 what, uint data)
```

Updates _CollateralType_ and _SystemState_

- _SystemState_.totalDebtCeiling
- _CollateralType_.debtCeiling
- _CollateralType_.vaultDebtFloor

The _handleFile_ mapper function receives a _LogNote_ event as parameter. This handler processes 2 contract functions with the same name _file_ but different arity. We use the _signature_ parameter to split the logic for those contract functions.

##### handleCage

```
function cage()
```

Creates a _LiveChangeLog_ entry for the contract address

##### handleSlip

```
function slip(bytes32 ilk, address usr, int256 wad)
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
function flux(bytes32 ilk, address src, address dst, uint256 wad)
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

Transfers stablecoin between users

```
function move(address src, address dst, uint256 rad)
```

Updates _User_ and _DaiMoveLog_

- _User_.totalVaultDai
- _DaiMoveLog_.amount
- _DaiMoveLog_.src
- _DaiMoveLog_.dst

The _handleMove_ mapper function receives a _LogNote_ event as parameter. We receive 3 parameters; _src_ (source User), _dst_ (destination User) and the _rad_ (the amount of stablecoin) to transfer.

We track the in vault dai of an user by updating field _totalVaultDai_ in _User_ entity. Then we track the movement by adding a record to _DaiMoveLog_.

##### handleFrob

```
function frob(bytes32 i, address u, address v, address w, int dink, int dart)
```

Creates or updates a Vault

- _CollateralType_.unmanagedVaultCount
- _CollateralType_.totalCollateral
- _CollateralType_.debtNormalized
- _CollateralType_.totalDebt
- _SystemState_.unmanagedVaultCount
- _Vault_.collateral
- _Vault_.collateralType
- _Vault_.debt
- _Vault_.handler
- _Vault_.owner
- _VaultCollateralChangeLog_
- _VaultDebtChangeLog_
- _VaultCreationLog_

The _handleFrob_ receives 4 parameters; _ilk_ (collateralTypeId), _urn_ (vaultId), _dink_ (collateral), _dart_ (debt)

if the Vault exist, we update the Vault summing up the _collateral_ and _debt_ otherwise we create the Vault with default values then we track the unmanaged vault by increasing the _unmanagedVaultCount_ field.

##### handleFork

```
function fork(bytes32 ilk, address src, address dst, int dink, int dart)
```

Split a Vault

- _Vault_
- _VaultSplitChangeLog_

The _handleFork_ function receives 5 parameters; _ilk_, _src_, _dst_, _dink_, _dart_

We find the Vaults by using the _ilk_ (collateralTypeId), _src_ (source User) and _dst_ (destination User). Then we move collateral and debt from source Vault to destination Vault.

##### handleGrab

```
function grab(bytes32 i, address u, address v, address w, int dink, int dart)
```

Liquidates a Vault, create/update the following entities:

- _User_
- _Vault_
- _Collateral_
- _CollateralType_
- _SystemDebt_
- _SystemState_

The _handleGrab_ functions receives 6 parameters; _i_ (collateralTypeId), _u_ (urn user), _v_ (liquidator user), _w_ (vow address), _dink_ (collateral), _dart_ (debt)

- Find or create vault and liquidator users
- Updates the _CollateralType.debtNormalized_ by summing up the _dart_ (debt)
- Updates the _CollateralType.totalDebt_ by multipling the _dart_ by the _CollateralType.rate_
- Updates _Vault.collateral_ and _Vault.debt_
- Updates _Collateral_.amount for liquidator user
- Updates _SystemDebt.amount_
- Updates _SystemState.totalSystemDebt_

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
