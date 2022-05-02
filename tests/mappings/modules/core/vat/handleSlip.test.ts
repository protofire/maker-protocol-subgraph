import { Bytes, Address, BigDecimal } from "@graphprotocol/graph-ts";
import { test, clearStore, assert } from "matchstick-as";
import { CollateralType } from "../../../../../generated/schema";
import { LogNote } from "../../../../../generated/Vat/Vat";
import { handleSlip } from "../../../../../src/mappings/modules/core/vat";
import { tests } from "../../../../../src/mappings/modules/tests";

test(
  "Vat#handleSlip modifies a user's collateral balance via adding wad", () => {
    let signature = "0x7cdd3fde"
    let ilk = "c1"
    let usr = "0x89b78cfa322f6c5de0abceecab66aee45393cc5a"
    // signed value of -134034148651000000000000 ==> -134034.148651
    let wad = "0xffffffffffffffffffffffffffffffffffffffffffffe39dfe86a9453a765000"

    let collateralType = new CollateralType(ilk)
    collateralType.rate = BigDecimal.fromString("1.5")
    collateralType.save()

    let sig = tests.helpers.params.getBytes("sig", Bytes.fromHexString(signature))
    let arg1 = tests.helpers.params.getBytes("arg1", Bytes.fromUTF8(ilk));
    let arg2 = tests.helpers.params.getBytes("arg2", Address.fromString(usr))
    let arg3 = tests.helpers.params.getBytes("arg3", Bytes.fromHexString(wad))

    let event = changetype<LogNote>(tests.helpers.events.getNewEvent([
      sig,
      arg1,
      arg2,
      arg3,
    ]))

    handleSlip(event)

    assert.fieldEquals("Collateral", usr + "-" + ilk, "amount", "-134034.148651")

    clearStore()
  }
)
