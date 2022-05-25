import { Bytes, Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { test, clearStore, assert } from "matchstick-as";
import { LogNote } from "../../../../../generated/Vow/Vow";
import { handleFlog } from "../../../../../src/mappings/modules/system-stabilizer/vow";
import { tests } from "../../../../../src/mappings/modules/tests";
import { mockDebt, mockSin } from "../../../../helpers/mockedFunctions";



function createEvent(era: i32): LogNote {
    let sig = tests.helpers.params.getBytes("sig", Bytes.fromHexString("0x889bcf44"))
    let usr = tests.helpers.params.getBytes("usr",Bytes.fromUTF8(""))
    let arg1 = tests.helpers.params.getBytes("arg1", Bytes.fromUint8Array(Bytes.fromI32(era).reverse()))

    let event = changetype<LogNote>(tests.helpers.events.getNewEvent([
      sig,
      usr,
      arg1,
    ]));

    return event
  }

  test(
    "Vow#handleFLog substracts given amount from SystemDebtInQueue", () => {

      let era = 100
      let event = createEvent(era)

      mockSin(era)
      mockDebt()
      handleFlog(event)

      assert.fieldEquals("SystemState", "current", "systemDebtInQueue", "-0.0000000000000000000000000000000000000000001")

      clearStore()
    }
  )