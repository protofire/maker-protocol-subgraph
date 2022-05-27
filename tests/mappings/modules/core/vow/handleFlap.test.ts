import { Bytes, BigInt, BigDecimal } from "@graphprotocol/graph-ts";
import { test, assert, clearStore } from "matchstick-as";
import { User } from "../../../../../generated/schema";
import { LogNote } from "../../../../../generated/Vat/Vat";
import { system } from "../../../../../src/entities";
import { handleFlap } from "../../../../../src/mappings/modules/system-stabilizer/vow";
import { tests } from "../../../../../src/mappings/modules/tests";
import { mockDebt } from "../../../../helpers/mockedFunctions";
import { system as systemModule } from '../../../../../src/entities/'


test("Vow#handleFlap: Creates the entity VowFlapLog",
  () => {
    let event = changetype<LogNote>(tests.helpers.events.getNewEvent([]))

    mockDebt()
    let system = systemModule.getSystemState(event)
    system.surplusAuctionLotSize = BigDecimal.fromString("1.5")
    system.save()
    handleFlap(event)

    assert.fieldEquals("VowFlapLog",event.transaction.hash.toHexString(), "surplusAuctionLotSize", "1.5")
    clearStore()
  }
)