import { BigDecimal, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { test, assert } from "matchstick-as";
import { CollateralType, User } from "../../../../generated/schema";
import { LogNote } from "../../../../generated/Vat/Vat";
import { handleFold } from "../../../../src/mappings/modules/core/vat";
import { tests } from "../../../../src/mappings/modules/tests";

function createEvent(ilk: string, u: string, rate: string): LogNote {
  let sig = tests.helpers.params.getBytes("sig", Bytes.fromHexString("0xa1a2a3a4"));
  let arg1 = tests.helpers.params.getBytes("arg1", Bytes.fromUTF8(ilk));
  let arg2 = tests.helpers.params.getBytes("arg2", Bytes.fromHexString(u));

  let pepe = Bytes.fromUint8Array(Bytes.fromBigInt(BigInt.fromString(rate)).reverse());

  let arg3 = tests.helpers.params.getBytes("arg3", pepe);

  let event = changetype<LogNote>(tests.helpers.events.getNewEvent([
    sig,
    arg1,
    arg2,
    arg3,
  ]));

  return event
}

test("Vat#handleFold",
  () => {
    let collateralTypeId = "c1"
    let a = "0x3d962e5542315d258c988ae29981b19e92398ee9"
    let rate = "500000000000000000000000000000000000000000000"

    let collateralType = new CollateralType(collateralTypeId)
    collateralType.rate = BigDecimal.fromString("0.10")
    collateralType.totalDebt = BigDecimal.fromString("500")
    collateralType.save()

    let user = new User(a)
    user.dai = BigDecimal.fromString("1000")
    user.save()

    let event = createEvent(
      collateralTypeId,
      a,
      rate,
    )

    handleFold(event)

    assert.fieldEquals("CollateralType", collateralTypeId, "rate", "0.6");
    assert.fieldEquals("User", a, "dai", "1250");
    assert.fieldEquals("SystemState", "current", "totalDebt", "250");
  }
)