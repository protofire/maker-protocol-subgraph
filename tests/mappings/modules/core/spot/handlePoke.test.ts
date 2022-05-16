import { Bytes, Address, ethereum, BigInt } from "@graphprotocol/graph-ts";
import { test, clearStore, assert, log } from "matchstick-as";
import { Poke } from "../../../../../generated/Spot/Spotter";
import { handlePoke } from "../../../../../src/mappings/modules/core/spot";
import { tests } from "../../../../../src/mappings/modules/tests";
import { CollateralType, CollateralPrice } from "../../../../../generated/schema";

function createEvent(ilk: string, val: string, spot: i32):Poke{

    let ilkParam = tests.helpers.params.getBytes("ilk", Bytes.fromUTF8(ilk))
    let valParam = tests.helpers.params.getBytes("val", Bytes.fromHexString(val))
    let spotParam = tests.helpers.params.getBigInt("spot", BigInt.fromI32(spot))

    let debug = Bytes.fromHexString(val)


    log.debug(debug.toHexString(), [])
    
    //log.debug(valParam.value, [])
    
    let event = changetype<Poke>(tests.helpers.events.getNewEvent([
        ilkParam,
        valParam,
        spotParam
    ]))
    return event
}


test("Spot#handlePoke updates CollateralPrice",
  () => {
    
    let ilk = "c1"
    let val = "73cf23aaa1cd4a0b32"
    log.debug(val.toString(), [])
    let spot = 300

    let newevent = createEvent(ilk, val, spot)
    
    let collateral = new CollateralType(ilk)
    collateral.save()
    handlePoke(newevent)

    assert.fieldEquals("CollateralPrice", newevent.block.number.toString() + '-' + ilk, "value", "2136.301529678545029938");
    assert.fieldEquals("CollateralPrice", newevent.block.number.toString() + '-' + ilk, "spotPrice", "0.0000000000000000000000003");

    clearStore()
  }
)