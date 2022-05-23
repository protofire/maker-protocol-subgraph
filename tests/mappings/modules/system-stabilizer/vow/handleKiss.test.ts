import { Bytes, BigInt } from "@graphprotocol/graph-ts";
import { test, clearStore } from "matchstick-as";
import { LogNote } from "../../../../../generated/Vow/Vow";
import { handleKiss } from "../../../../../src/mappings/modules/system-stabilizer/vow";
import { tests } from "../../../../../src/mappings/modules/tests";

function createEvent(rad: string): LogNote {
  let sig = tests.helpers.params.getBytes("sig", Bytes.fromHexString("0x1a0b287e"));
  let arg1 = tests.helpers.params.getBytes("arg1", Bytes.fromUTF8(""));
  let radBytes = Bytes.fromUint8Array(Bytes.fromBigInt(BigInt.fromString(rad)).reverse())
  let arg2 = tests.helpers.params.getBytes("arg2", radBytes);

  let event = changetype<LogNote>(tests.helpers.events.getNewEvent([
    sig,
    arg1,
    arg2,
  ]));

  return event
}

test(
  "Vow#handleKiss",
  () => {
    let rad = "100500000000000000000000000000000000000000000000"

    let event = createEvent(rad)

    handleKiss(event)

    clearStore()
  }
)
