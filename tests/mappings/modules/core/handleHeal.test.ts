import { Bytes, BigInt, BigDecimal } from "@graphprotocol/graph-ts";
import { test, assert, clearStore } from "matchstick-as";
import { SystemDebt, SystemState, User } from "../../../../generated/schema";
import { LogNote } from "../../../../generated/Vat/Vat";
import { handleHeal } from "../../../../src/mappings/modules/core/vat";
import { tests } from "../../../../src/mappings/modules/tests";

function createEvent(rad: string): LogNote {
  let sig = tests.helpers.params.getBytes("sig", Bytes.fromHexString("0x1a0b287e"));
  let radBytes = Bytes.fromUint8Array(Bytes.fromBigInt(BigInt.fromString(rad)).reverse())
  let arg1 = tests.helpers.params.getBytes("arg1", radBytes);

  let event = changetype<LogNote>(tests.helpers.events.getNewEvent([
    sig,
    arg1,
  ]));

  return event
}

test("Vat#handleHeal",
  () => {
    let rad = "100500000000000000000000000000000000000000000000"
    let senderAddress = "0xa16081f360e3847006db660bae1c6d1b2e17ec2a"

    let user = new User(senderAddress)
    user.dai = BigDecimal.fromString("1000")
    user.save()

    let systemDebt = new SystemDebt(senderAddress)
    systemDebt.amount = BigDecimal.fromString("200")
    systemDebt.owner = senderAddress
    systemDebt.save()

    let event = createEvent(rad)

    let systemState = new SystemState("current")
    systemState.totalDebt = BigDecimal.fromString("1000")
    systemState.totalSystemDebt = BigDecimal.fromString("2000")
    systemState.save()

    handleHeal(event)

    assert.fieldEquals("User", senderAddress, "dai", "899.5")
    assert.fieldEquals("SystemDebt", senderAddress, "amount", "99.5")

    assert.fieldEquals("SystemState", "current", "totalDebt", "899.5")
    assert.fieldEquals("SystemState", "current", "totalSystemDebt", "1899.5")

    clearStore()
  }
)