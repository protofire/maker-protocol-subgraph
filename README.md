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

- handleInit
- handleFile
- handleCage
- handleSlip
- handleFlux
- handleMove
- handleFrob
- handleFork
- handleGrab
- handleHeal
- handleSuck
- handleFold

#### Liaison between the Oracles and Core Contracts (Spot)

### Dai Module:

The DAI token contract and all of the adapters DaiJoin adapters.

### Liquidation Module:

The Maker Protocol's Collateral Auction House (Liquidation System 2.0)

#### fill me (Clipper)

#### fill me (Dog)

### MKR Module:

#### fill me (DsToken)

### Proxy Module:

#### Proxy registration (ProxyFactory)

### Rates Module:

#### Accumulation of Stability Fees for Collateral Types (Jug)

#### The Dai Savings Rate (Pot)

### System Stabilizer Module:

#### Surplus Auction House (Flapper)

#### Debt Auction House (Flopper)

#### Balance Sheet (Vow)
