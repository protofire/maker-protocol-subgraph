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

Update the following entities:

- _CollateralType_
- _SystemState_

The _handleInit_ mapper function receives 1 parameter.

We pick the _collateralTypeId_ from the _arg1_ then we create the _CollateralType_ record with some default values. Also, we track the _collateralType_ quantity by increasing the field _collateralCount_ on _SystemState_.

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

```
function heal(uint rad)
```

Create/destroy equal quantities of stablecoin and system debt

The _handleHeal_ function receives 1 parameter; _rad_ (debt amount)

Update the following entities:

- _User_
- _SystemDebt_
- _SystemState_

##### handleSuck

```
function suck(address u, address v, uint rad)
```

Mint unbacked stablecoin

Update the following entities:

- _User_
- _SystemDebt_
- _SystemState_

##### handleFold

```
function fold(bytes32 i, address u, int rate)
```

Modify the debt multiplier, creating/destroying corresponding debt

Update the following entities:

- _User_
- _CollateralType_
- _SystemState_

#### Liaison between the Oracles and Core Contracts (Spot)

> The Spot liaison between the oracles and the core contracts. It functions as an interface contract and only stores the current ilk list.

##### handleFile
Creates/Updates the following entities:
- _CollateralPrice_
- _SpotParLog_
- _CollateralType_
- _SystemState_

The _handleFile_ mapper function receives a _LogNote_ event as parameter. The handler processes 3 contract functions with the same name _file_ but different arity. We pick _arg2_ as _what_ parameter to separate the logic.

_what_ = "mat": Updates the liquidationRatio of a _CollateralType_

_what_ = "pip": Creates a new CollateralPrice and maps it to the corresponding _CollateralType_

_what_ = "par": Creates the Entity _SpotParLog_
##### handlePoke
Creates/Updates the following entities:
- _CollateralPrice_
- _CollateralPriceUpdateLog_
- _CollateralType_

The _handlePoke_ mapper function receives a _Poke_ event as parameter. This event consists of two parameters: the id of the CollateralType (ilk) and the price (val). It creates the entity _CollateralPrice_. It also updates the price parameter of the _CollateralType_ entity to the newly created _CollateralPrice_ entity.

##### handleCage
Create the _LiveChangeLog_ entity.

The _handleCage_ function changes the Liveness of the spot contract. It creates the _LiveChangeLog_ Entity to track the changes.

### Dai Module:

> The DAI token contract and all of the adapters DaiJoin adapters.

#### Token

> fill me with the description of the contract

##### handleTransfer

##### handleApproval

### Liquidation Module:

> The Maker Protocol's Collateral Auction House (Liquidation System 2.0)

#### DAI Auction Module 2.0 (Clipper)

> The Clipper contract is part of the Liquidation 2.0 Module. It is responsible for creating and managing auctions.

##### handleFile1
Updates:
- _SystemState_

The _handleFile1_ mapper function receives a _FileBigIntEvent_ event as parameter. It updates the _SystemState_ depending on the submitted _what_ parameter in the event. This function updates required parameters by the Clipper contract.

_what_ = "buf": updates _saleAuctionStartingPriceFactor_

_what_ = "tail": updates _saleAuctionResetTime_

_what_ = "cusp": updates _saleAuctionDropPercentage_

_what_ = "chip": updates _saleAuctionDaiToRaisePercentage_

_what_ = "tip": updates _saleAuctionFlatFee_
##### handleFile2
Updates:
- _SystemState_

The _handleFile2_ mapper function receives a _FileAddressEvent_ event as parameter. It updates the _SystemState_ depending on the submitted _what_ parameter in the event. The clipper contract requires other contracts for various functionalities. This function updates the address for required contracts.

_what_ = "spotter": updates _saleAuctionSpotterContract_

_what_ = "dog": updates _saleAuctionDogContract_

_what_ = "vow": updates _saleAuctionVowContract_

_what_ = "calc": updates _saleAuctionCalcContract_

##### handleKick
Creates:
- _SaleAuction_

The _handleKick_ mapper function receives a _KickEvent_ event as parameter. The contract intiiates an auction by calling the Kick function. Therefore, this function creates the entity _SaleAuction_ with the parameters of the event and sets _isActive_ to true.
##### handleTake
Updates:
- _SaleAuction_

The _handleTake_ mapper function receives a _TakeEvent_ event as parameter. With this function you can buy collateral from the auction indexed by _id_. If the auction is sold out, it will set _isActive_ to false.
##### handleRedo
Updates:
- _SaleAuction_

The _handleRedo_ mapperfunction receives a _RedoEvent_ event as parameter. The starting price of an auction will be set to the corresponding parameter in the event.

##### handleYank
Updates:
- _SaleAuction_

The _handleYank_ mapperfunction receives a _YankEvent_ event as parameter. This function will mark an auction as deleted by setting _isActive_ to false and the timestamp to _deletedAt_
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
