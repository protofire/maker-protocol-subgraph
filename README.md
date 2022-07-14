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

The Core Module is crucial to the system as it contains the entire state of the Maker Protocol and controls the central mechanisms of the system while it is in the expected normal state of operation.

#### Vault Engine (Vat)

fill me with the description of the contract

##### handleInit

Creates new _CollateralType_

##### handleFile

##### handleCage

##### handleSlip

##### handleFlux

##### handleMove

##### handleFrob

##### handleFork

##### handleGrab

##### handleHeal

##### handleSuck

##### handleFold

#### Liaison between the Oracles and Core Contracts (Spot)

fill me with the description of the contract

##### handleFile

##### handlePoke

##### handleCage

### Dai Module:

The DAI token contract and all of the adapters DaiJoin adapters.

#### Token

fill me with the description of the contract

##### handleTransfer

##### handleApproval

### Liquidation Module:

The Maker Protocol's Collateral Auction House (Liquidation System 2.0)

#### fill me (Clipper)

fill me with the description of the contract

##### handleFile1

##### handleFile2

##### handleKick

##### handleTake

##### handleRedo

##### handleYank

#### fill me (Dog)

fill me with the description of the contract

##### handleCage

##### handleDigs

##### handleFileVow

##### handleFileHole

##### handleFileChop

##### handleFileClip

##### handleBark

### MKR Module:

fill me with the description of the module

#### fill me (DsToken)

fill me with the description of the contract

##### handleTransfer

##### handleApproval

##### handleMint

##### handleBurn

### Proxy Module:

fill me with the description of the module

#### Proxy registration (ProxyFactory)

fill me with the description of the contract

##### handleCreated

### Rates Module:

fill me with the description of the module

#### Accumulation of Stability Fees for Collateral Types (Jug)

fill me with the description of the contract

##### handleInit

##### handleDrip

##### handleFile

#### The Dai Savings Rate (Pot)

fill me with the description of the contract

##### handleFile

##### handleCage

##### handleJoin

##### handleExit

##### handleDrip

### System Stabilizer Module:

fill me with the description of the module

#### Surplus Auction House (Flapper)

fill me with the description of the contract

##### handleFile

##### handleCage

##### handleKick

##### handleTick

##### handleDeal

##### handleTend

##### handleYank

#### Debt Auction House (Flopper)

fill me with the description of the contract

##### handleFile

##### handleCage

##### handleKick

##### handleTick

##### handleDeal

##### handleDent

##### handleYank

#### Balance Sheet (Vow)

fill me with the description of the contract

##### handleFile

##### handleCage

##### handleFrog

##### handleFess

##### handleFlap

##### handleFlop

##### handleKiss
