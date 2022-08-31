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
#### Liquidation Contract (Dog)

> In the liquidation contract (the Dog), an auction is started promptly to sell the transferred collateral for DAI in an attempt to cancel out the debt now assigned to the protocol.

##### handleCage
Create the _LiveChangeLog_ entity.

The _handleCage_ function changes the Liveness of the spot contract. It creates the _LiveChangeLog_ Entity to track the changes.

##### handleDigs
Updates:
- _SystemState_
- _CollateralType_

The _handleDigs_ function loads the _SystemState_ Entity and substracts the _rad_ (contract parameter) from the _totalDaiAmountToCoverDebtAndFees_.
Afterwards, it updates the _Collateraltype_ and subtracts the _rad_ from the _daiAmountToCoverDebtAndFees_.

##### handleFileVow
Updates:
- _SystemState_

The _handleFileVow_ functions receives a _File1_ Event. It updates the address in the parameter _dogVowContract_ when _what_ = "vow".

##### handleFileHole
Updates:
- _SystemState_

The _handleFileHole_ functions receives a _File_ Event. It updates the parameter _maxDaiToCoverAuction_ with the rad value from the submitted _data_.

##### handleFileChop
Updates:
- _CollateralType_

The _handleFileChop_ functions receives a _File2_ Event. It updates the parameters of the entity _CollateralType_ according to the provided _what_ parameter.

_what_ = "chop": Updates the parameter _liquidationPenalty_ with the wad value from the submitted _data_.

_what_ = "hole": Updates the parameter _maxDaiToCoverAuction_ with the rad value from the submitted _data_.

##### handleFileClip
Updates:
- _CollateralType_

The _handleFileClip_ functions receives a _File3_ Event. It updates the _liquidatorAddress_ when _what_ = "clip".
##### handleBark
Updates:
- _SaleAuction_
- _CollateralType_
- _SystemState_

The _handleBark_ functions receives a _Bark_ Event. It liquidates a Vault and start a Dutch auction to sell its collateral for DAI.

_SaleAuction_: Updates the connection to the _Vault_ and _CollateralType_ entity.

_CollateralType_: Adds _liquidationPenalty_ * _due_ to the _daiAmountToCoverDebtAndFees_

_SystemState_: Adds _liquidationPenalty_ * _due_ to the _totalDaiAmountToCoverDebtAndFees_

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

> The primary function of the Jug smart contract is to accumulate stability fees for a particular collateral type whenever its _drip()_ method is called.

##### handleInit
Updates:
-_CollateralType_

Fetches the _CollateralType_ according to _arg1_, sets _stabilityFee_ to '1' and _stabilityFeeUpdateAt_ to the timestamp of the block.

##### handleDrip
Updates:
-_CollateralType_

Updates the _stabilityFeeUpdatedAt_ of the CollateralType.

##### handleFile
Updates:
-_SystemState_
-_ColllateralType_

Updates variables according to the _what_ variable.

what="duty": Updates _CollateralType.stabilityFee_ to the Ray value from _data_.

what="base": Updates _SystemState.baseStabilityFee_ to the Ray value from _data_.

what="vow": Updates _SystemState.jugVowContract_ to the Address from _data_.

#### The Dai Savings Rate (Pot)

> The Pot is the core of theDai Savings Rate. It allows users to deposit dai and activate the Dai Savings Rate and earning savings on their dai.

##### handleFile
Updates:
-_SystemState_

Updates the _SystemState_ according to the _what_ variable.

_what_="dsr": Updates _SystemState.savingsRate_ with the Ray value from _data_.

_what_="vow": Updates _SystemState.potVowContract_ with the value from _data_.

##### handleCage
Creates:
-_LiveChangeLog_

Updates:
-_SystemState_

Updates the _SystemState.savingsRate_ to 1 and creates a new _LiveChangeLog_.

##### handleJoin
Updates:
-_User_
-_SystemState_

Adds the WDA value _arg1_ to _User.savings_ and _SystemState.totalSavingsInPot_. The Subgraph will update these values according to the result.

##### handleExit
Updates:
-_User_
-_SystemState_

Substracts the WDA value _arg1_ from _User.savings_ and _SystemState.totalSavingsInPot_. The Subgraph will update these values according to the result.

##### handleDrip
Updates:
-_SystemState_

Binds the Pot contract to get the _chi_ value from the contract. Afterwards, the subgraph will update _SystemState.rateAccumulator_ with the resultvalue and sets _SystemState.lastPotDripAt_ to the timestamp of the block.

### System Stabilizer Module:

> fill me with the description of the module

#### Surplus Auction House (Flapper)

> Flapper is a Surplus Auction. These auctions are used to auction off a fixed amount of the surplus Dai in the system for MKR. This surplus Dai will come from the Stability Fees that are accumulated from Vaults. In this auction type, bidders compete with increasing amounts of MKR. Once the auction has ended, the Dai auctioned off is sent to the winning bidder. The system then burns the MKR received from the winning bid.

##### handleFile
Updates:
-_SystemState_

Updates _SystemState_ according to the _what_ value.

_what_="beg": Updates _surplusAuctionMinimumBidIncrease_ to the WAD value from _data_.

_what_="ttl": Updates _surplusAuctionBidDuration_ to the value from _data_.

_what_="tau": Updates _surplusAuctionDuration_ to the value from _data_.

##### handleCage
Creates:
-_LiveChangeLog_

Creates the LiveChangeLog event with the required values.

##### handleKick
Updates:
-_SystemState_
-_SurplusAuction_

Updates _bidAmount_, _quantity_, _highestBidder_ from the _SurplusAuction_ entities to the values from the event and sets _active_ to true. If _SystemState.surplusAuctionBidDuration_ is set, it will add the block timestamp to this value.

##### handleTick
Updates:
-_SurplusAuction_

Sets _SurplusAuction.endTimeAt_ to the timestamp of the block and adds _SystemState.surplusAuctionBidDuration_ to it

##### handleDeal
Updates:
-_SurplusAuction_

Sets the _highestBidder_ to the transaction creator.

##### handleTend
Updates:
-_SurplusAuction_

Sets the _highestBidder_ to the transaction creator and updates the _bidAmount_ to Int value of _arg2_. 

##### handleYank
Updates:
-_SurplusAuction_

Deactivates (_active_=false) the _SurplusAuction_ and sets the _deletedAt_ variable.

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
