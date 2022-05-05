import { Bytes, BigInt } from "@graphprotocol/graph-ts";
import { bytes } from "@protofire/subgraph-toolkit";
import { test, clearStore, assert, log } from "matchstick-as";
import { CollateralType } from "../../../../../generated/schema";
import { LogNote } from "../../../../../generated/Spot/Spotter";
import { handleFile } from "../../../../../src/mappings/modules/core/spot";
import { tests } from "../../../../../src/mappings/modules/tests";
import { mockDebt } from "../../../../helpers/mockedFunctions";


function strRadToBytes(value: string): Bytes {
  return Bytes.fromUint8Array(Bytes.fromBigInt(BigInt.fromString(value)).reverse());
}

test(
  "Spot#handleFile updates CollateralType.liquidationRatio when signature is 0x1a0b287e and what is mat", () => {
    let signature = "0x1a0b287e"
    let ilk = "c1"
    let what = "mat"
    let ray = "0x000000000000000000000000000000000004d8c55aefb8c05b5c000000000000" //25165824(000000000000000000000000000)

    let collateralType = new CollateralType(ilk)
    collateralType.save()

    let dataBytes = Bytes.fromHexString(signature)
    let ilkBytes = Bytes.fromUTF8(ilk)
    let whatBytes = Bytes.fromUTF8(what)
    dataBytes = dataBytes.concat(ilkBytes).concat(new Bytes(32-ilkBytes.length))
    dataBytes = dataBytes.concat(whatBytes).concat(new Bytes(32-whatBytes.length))
    dataBytes = dataBytes.concat(Bytes.fromHexString(ray))

    let sig = tests.helpers.params.getBytes("sig", Bytes.fromHexString(signature));
    let arg1 = tests.helpers.params.getBytes("arg1", ilkBytes);
    let arg2 = tests.helpers.params.getBytes("arg2", whatBytes);
    let usr = tests.helpers.params.getBytes("usr",Bytes.fromUTF8(""))
    let data = tests.helpers.params.getBytes("data", dataBytes)

    let event = changetype<LogNote>(tests.helpers.events.getNewEvent([
      sig,
      usr,
      arg1,
      arg2,
      data
    ]));

    mockDebt()
    handleFile(event);

    assert.fieldEquals("CollateralType", ilk, "liquidationRatio", "25165824");
    clearStore();
  }
)