import { Bytes, BigInt, BigDecimal } from "@graphprotocol/graph-ts";
import { test, assert } from "matchstick-as";
import { CollateralType, Vault } from "../../../../generated/schema";
import { LogNote } from "../../../../generated/Vat/Vat";
import { handleFork } from "../../../../src/mappings/modules/core/vat";
import { tests } from "../../../../src/mappings/modules/tests";

function createEvent(
  signature: string,
  ilk: string,
  src: string,
  dst: string,
  dink: Bytes,
  dart: Bytes
): LogNote {
  let a = new Bytes(100 + 32 - 9)
  let b = a.concat(dink) // 9
  let d = b.concat(dart)

  let sig = tests.helpers.params.getBytes("sig", Bytes.fromHexString(signature));
  let arg1 = tests.helpers.params.getBytes("arg1", Bytes.fromUTF8(ilk));
  let arg2 = tests.helpers.params.getBytes("arg2", Bytes.fromHexString(src));
  let arg3 = tests.helpers.params.getBytes("arg3", Bytes.fromHexString(dst));
  let data = tests.helpers.params.getBytes("data", d);

  let event = changetype<LogNote>(tests.helpers.events.getNewEvent([
    sig,
    arg1,
    arg2,
    arg3,
    data,
  ]));

  return event
}

test(
  "Vat#handleFork: Moves collateral and debt from vault to vault and creates VaultSplitChangeLog", () => {
    let collateralTypeId = "c1"
    let src = "0x09356aed1457d6ebb6cf6ad864ea318dcb815683"
    let dst = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
    let dink = Bytes.fromUint8Array(Bytes.fromBigInt(BigInt.fromString("100500000000000000000")).reverse())
    let dart = Bytes.fromUint8Array(Bytes.fromBigInt(BigInt.fromString("200500000000000000000")).reverse())

    let collateralType = new CollateralType(collateralTypeId)
    collateralType.save()

    let vault1Id = src.concat("-").concat(collateralTypeId)
    let vault1 = new Vault(vault1Id)
    vault1.collateralType = collateralTypeId
    vault1.collateral = BigDecimal.fromString("1000")
    vault1.debt = BigDecimal.fromString("1000")
    vault1.save()

    let vault2Id = dst.concat("-").concat(collateralTypeId)
    let vault2 = new Vault(vault2Id)
    vault2.collateralType = collateralTypeId
    vault2.collateral = BigDecimal.fromString("100")
    vault2.debt = BigDecimal.fromString("100")
    vault2.save()

    let event = createEvent(
      "0x1a0b287e",
      collateralTypeId,
      src,
      dst,
      dink,
      dart
    )

    let vaultSplitChangeLogId = event.transaction.hash.toHex() + '-' + event.logIndex.toString() + '-3'

    handleFork(event)

    assert.fieldEquals("VaultSplitChangeLog", vaultSplitChangeLogId, "src", src)
    assert.fieldEquals("VaultSplitChangeLog", vaultSplitChangeLogId, "dst", dst)
    assert.fieldEquals("VaultSplitChangeLog", vaultSplitChangeLogId, "collateralToMove", "100.5")
    assert.fieldEquals("VaultSplitChangeLog", vaultSplitChangeLogId, "debtToMove", "200.5")

    assert.fieldEquals("Vault", vault1Id, "collateral", "899.5")
    assert.fieldEquals("Vault", vault1Id, "debt", "799.5")
    assert.fieldEquals("Vault", vault2Id, "collateral", "200.5")
    assert.fieldEquals("Vault", vault2Id, "debt", "300.5")
  }
)