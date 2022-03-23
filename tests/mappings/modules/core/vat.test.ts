import { test, clearStore, assert } from "matchstick-as";
import { Address, Bytes, ethereum, TypedMap, BigInt } from '@graphprotocol/graph-ts';
import { handleInit, handleFile } from '../../../../src/mappings/modules/core/vat';
import { LogNote } from '../../../../generated/Vat/Vat';
import { tests } from '../../../../src/mappings/modules/tests'
import { integer, decimal } from '@protofire/subgraph-toolkit';
import { CollateralType } from "../../../../generated/schema";

test(
  "Vat#handleInit creates initial CollateralType and updates SystemState",
  () => {
    let sig = tests.helpers.params.getBytes("sig", Bytes.fromUTF8("sig"));
    let arg1 = tests.helpers.params.getBytes("arg1", Bytes.fromUTF8("arg1"));
    let arg2 = tests.helpers.params.getBytes("arg2", Bytes.fromUTF8("arg2"));
    let arg3 = tests.helpers.params.getBytes("arg3", Bytes.fromUTF8("arg3"));
    let data = tests.helpers.params.getBytes("data", Bytes.fromUTF8("data"));

    let event = changetype<LogNote>(tests.helpers.events.getNewEvent([
      sig,
      arg1,
      arg2,
      arg3,
      data,
    ]));

    let debtResult = BigInt.fromString("100").toI32()

    tests.helpers.contractCalls.mockFunction(
      Address.fromString("0x35d1b3f3d7966a1dfe207aa4514c12a259a0492b"),
      'debt',
      'debt():(uint256)',
      [],
      [ethereum.Value.fromI32(debtResult)]
    )

    handleInit(event);

    let collateralTypeFields = new TypedMap<string, string>();
    collateralTypeFields.set("debtCeiling", decimal.ZERO.toString());
    collateralTypeFields.set("vaultDebtFloor", decimal.ZERO.toString());
    collateralTypeFields.set("totalCollateral", decimal.ZERO.toString());
    collateralTypeFields.set("totalDebt", decimal.ZERO.toString());
    collateralTypeFields.set("debtNormalized", decimal.ZERO.toString());
    collateralTypeFields.set("auctionCount", integer.ZERO.toString());
    collateralTypeFields.set("auctionDuration", integer.fromNumber(172800).toString());
    collateralTypeFields.set("bidDuration", integer.fromNumber(10800).toString());
    collateralTypeFields.set("minimumBidIncrease", decimal.fromNumber(1.05).toString());
    collateralTypeFields.set("liquidationLotSize", decimal.ZERO.toString());
    collateralTypeFields.set("liquidationPenalty", decimal.ZERO.toString());
    collateralTypeFields.set("liquidationRatio", decimal.ZERO.toString());
    collateralTypeFields.set("rate", decimal.ONE.toString());
    collateralTypeFields.set("stabilityFee", decimal.ONE.toString());
    collateralTypeFields.set("unmanagedVaultCount", integer.ZERO.toString());
    collateralTypeFields.set("vaultCount", integer.ZERO.toString());
    collateralTypeFields.set("addedAt", event.block.timestamp.toString());
    collateralTypeFields.set("addedAtBlock", event.block.number.toString());
    collateralTypeFields.set("addedAtTransaction", event.transaction.hash.toHexString());

    tests.helpers.asserts.assertMany("CollateralType", "arg1", collateralTypeFields);

    let systemStateFields = new TypedMap<string, string>();
    systemStateFields.set("collateralCount", integer.ONE.toString());
    systemStateFields.set("collateralAuctionCount", integer.ZERO.toString());
    systemStateFields.set("userProxyCount", integer.ZERO.toString());
    systemStateFields.set("unmanagedVaultCount", integer.ZERO.toString());
    systemStateFields.set("vaultCount", integer.ZERO.toString());
    systemStateFields.set("baseStabilityFee", decimal.ONE.toString());
    systemStateFields.set("savingsRate", decimal.ONE.toString());
    systemStateFields.set("totalDebtCeiling", decimal.ZERO.toString());
    systemStateFields.set("totalDebt", "0.0000000000000000000000000000000000000000001");
    systemStateFields.set("block", event.block.number.toString());
    systemStateFields.set("timestamp", event.block.timestamp.toString());
    systemStateFields.set("transaction", event.transaction.hash.toHexString());

    tests.helpers.asserts.assertMany("SystemState", "current", systemStateFields);

    clearStore();
  }
)

function strRadToBytes(value: string): Bytes {
  return Bytes.fromUint8Array(Bytes.fromBigInt(BigInt.fromString(value)).reverse());
}

test(
  "Vat#handleFile updates SystemState.totalDebtCeiling when signature is 0x29ae8114 and what is Line", () => {
    let signature = "0x29ae8114"
    let what = "Line"
    let data = "100500000000000000000000000000000000000000000000" // 100.5 (rad)

    let sig = tests.helpers.params.getBytes("sig", Bytes.fromHexString(signature));
    let arg1 = tests.helpers.params.getBytes("arg1", Bytes.fromUTF8(what));
    let arg2 = tests.helpers.params.getBytes("arg2", strRadToBytes(data));

    let event = changetype<LogNote>(tests.helpers.events.getNewEvent([
      sig,
      arg1,
      arg2,
    ]));

    handleFile(event);

    assert.fieldEquals("SystemState", "current", "totalDebtCeiling", "100.5");

    clearStore();
  }
)

test(
  "Vat#handleFile updates CollateralType.debtCeiling when signature is 0x1a0b287e and what is line", () => {
    let collateralTypeId = "c1"
    let collateralType = new CollateralType(collateralTypeId)
    collateralType.save()

    let signature = "0x1a0b287e"
    let what = "line"
    let data = "100500000000000000000000000000000000000000000000"

    let sig = tests.helpers.params.getBytes("sig", Bytes.fromHexString(signature));
    let arg1 = tests.helpers.params.getBytes("arg1", Bytes.fromUTF8(collateralTypeId));
    let arg2 = tests.helpers.params.getBytes("arg2", Bytes.fromUTF8(what));
    let arg3 = tests.helpers.params.getBytes("arg3", strRadToBytes(data));

    let event = changetype<LogNote>(tests.helpers.events.getNewEvent([
      sig,
      arg1,
      arg2,
      arg3,
    ]));

    handleFile(event);

    assert.fieldEquals("CollateralType", collateralTypeId, "debtCeiling", "100.5");

    clearStore();
  }
)

test(
  "Vat#handleFile updates CollateralType.vaultDebtFloor when signature is 0x1a0b287e and what is dust", () => {
    let collateralTypeId = "c1"
    let collateralType = new CollateralType(collateralTypeId)
    collateralType.save()

    let signature = "0x1a0b287e"
    let what = "dust"
    let data = "100500000000000000000000000000000000000000000000"

    let sig = tests.helpers.params.getBytes("sig", Bytes.fromHexString(signature));
    let arg1 = tests.helpers.params.getBytes("arg1", Bytes.fromUTF8(collateralTypeId));
    let arg2 = tests.helpers.params.getBytes("arg2", Bytes.fromUTF8(what));
    let arg3 = tests.helpers.params.getBytes("arg3", strRadToBytes(data));

    let event = changetype<LogNote>(tests.helpers.events.getNewEvent([
      sig,
      arg1,
      arg2,
      arg3,
    ]));

    handleFile(event);

    assert.fieldEquals("CollateralType", collateralTypeId, "vaultDebtFloor", "100.5");

    assert.fieldEquals("CollateralType", collateralTypeId, "modifiedAt", event.block.timestamp.toString());
    assert.fieldEquals("CollateralType", collateralTypeId, "modifiedAtBlock", event.block.number.toString());
    assert.fieldEquals("CollateralType", collateralTypeId, "modifiedAtTransaction", event.transaction.hash.toHexString());

    clearStore();
  }
)
