import { Bytes, BigInt } from "@graphprotocol/graph-ts";
import { test, clearStore, assert } from "matchstick-as";
import { CollateralType } from "../../../../../generated/schema";
import { LogNote } from "../../../../../generated/Vat/Vat";
import { handleFile } from "../../../../../src/mappings/modules/core/vat";
import { tests } from "../../../../../src/mappings/modules/tests";


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