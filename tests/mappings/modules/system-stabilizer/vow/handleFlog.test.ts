import { Bytes, Address, BigInt } from "@graphprotocol/graph-ts";
import { test, clearStore, assert } from "matchstick-as";
import { LogNote } from "../../../../../generated/Vow/Vow";
import { handleFlog } from "../../../../../src/mappings/modules/system-stabilizer/vow";
import { tests } from "../../../../../src/mappings/modules/tests";
import { mockDebt } from "../../../../helpers/mockedFunctions";

function strRadToBytes(tab: string): Bytes {
    return Bytes.fromUint8Array(Bytes.fromBigInt(BigInt.fromString(tab)).reverse());
}

function createEvent(tab: string): LogNote {
    let sig = tests.helpers.params.getBytes("sig", Bytes.fromHexString("0x889bcf44"))
    let usr = tests.helpers.params.getBytes("usr",Bytes.fromUTF8(""))
    let arg1 = tests.helpers.params.getBytes("arg1", strRadToBytes(tab))

    let event = changetype<LogNote>(tests.helpers.events.getNewEvent([
      sig,
      usr,
      arg1,
    ]));

    return event
  }

  test(
    "Vow#handleFLog substracts given amount from SystemDebtInQueue", () => {

      let tab = "100500000000000000000000000000000000000000000000"
      let event = createEvent(tab)

      mockDebt()
      handleFlog(event)

      assert.fieldEquals("SystemState", "current", "systemDebtInQueue", "100.5")

      clearStore()
    }
  )