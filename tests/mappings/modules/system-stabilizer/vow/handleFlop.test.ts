import { BigDecimal } from "@graphprotocol/graph-ts";
import { test, assert, clearStore } from "matchstick-as";
import { LogNote } from "../../../../../generated/Vow/Vow";
import { handleFlop } from "../../../../../src/mappings/modules/system-stabilizer/vow";
import { tests } from "../../../../../src/mappings/modules/tests";
import { mockDebt } from "../../../../helpers/mockedFunctions";
import { system as systemModule } from '../../../../../src/entities'

test("Vow#handleFlop: Creates the entity VowFlopLog and changes system.debtOnAuctionTotalAmount",
  () => {
    let event = changetype<LogNote>(tests.helpers.events.getNewEvent([]))

    mockDebt()
    let system = systemModule.getSystemState(event)
    system.debtAuctionBidSize = BigDecimal.fromString("1.5")
    system.debtAuctionInitialLotSize = BigDecimal.fromString("1.5")
    system.debtOnAuctionTotalAmount = BigDecimal.fromString("1.5")
    system.save()
    handleFlop(event)

    assert.fieldEquals("VowFlopLog",event.transaction.hash.toHexString(), "debtAuctionLotSize", "1.5")
    assert.fieldEquals("VowFlopLog",event.transaction.hash.toHexString(), "debtAuctionBidSize", "1.5")
    assert.fieldEquals("SystemState", system.id, "debtOnAuctionTotalAmount", "3")
    clearStore()
  }
)