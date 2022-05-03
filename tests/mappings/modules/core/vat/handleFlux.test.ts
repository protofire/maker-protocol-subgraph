import { BigInt, Bytes, Address } from "@graphprotocol/graph-ts";
import { test, assert, clearStore } from "matchstick-as";
import { LogNote } from "../../../../../generated/Vat/Vat";
import { handleFlux } from "../../../../../src/mappings/modules/core/vat";
import { tests } from "../../../../../src/mappings/modules/tests";

test(
    "Vat#handleFlux moves collateral from src to dst", () => {
      let signature = "0x6111be2e"
      let ilk = "c1"
      let src = "0x10994f7d520ef08dd877499fb1b052dbde3d4601"
      let dst = "0xeef39ddcb7ad0538af701e1c41e6dab4f758fec4"
      //let wad = "0x0000000000000000000000000000000000000000000000000ce80612991d"
  
      let wad = Bytes.fromUint8Array(Bytes.fromBigInt(BigInt.fromString("100500000000000000000")).reverse())
      let a = new Bytes(100 + 32 - 9)
      let b = a.concat(wad) // 9
  
      let sig = tests.helpers.params.getBytes("sig", Bytes.fromHexString(signature))
      let arg1 = tests.helpers.params.getBytes("arg1", Bytes.fromUTF8(ilk));
      let arg2 = tests.helpers.params.getBytes("arg2", Address.fromString(src))
      let arg3 = tests.helpers.params.getBytes("arg3", Address.fromString(dst))
      let data = tests.helpers.params.getBytes("data", b)
  
      let event = changetype<LogNote>(tests.helpers.events.getNewEvent([
        sig,
        arg1,
        arg2,
        arg3,
        data,
      ]))
  
      handleFlux(event)
  
      assert.fieldEquals("Collateral", src + "-" + ilk, "amount", "-100.5")
      assert.fieldEquals("Collateral", dst + "-" + ilk, "amount", "100.5")
  
      clearStore()
    }
  )