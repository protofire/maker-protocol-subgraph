import { Bytes, Address } from "@graphprotocol/graph-ts";
import { test, clearStore, assert } from "matchstick-as";
import { LogNote } from "../../../../../generated/Flap/Flapper";
import { handleCage } from "../../../../../src/mappings/modules/system-stabilizer/flap";
import { tests } from "../../../../../src/mappings/modules/tests";

test(
    "Flapper#handleCage creates a new LiveChangeLog event", () => {
     
        let signature = "0xa2f91af2"
        let sig = tests.helpers.params.getBytes("sig", Bytes.fromHexString(signature))
        
    
        let event = changetype<LogNote>(tests.helpers.events.getNewEvent([
            sig
        ]))


        let UPDATED_ADDRESS = "0xB16081F360e3847006dB660bae1c6d1b2e17eC2A";
        let address = Address.fromString(UPDATED_ADDRESS);
        let addressString = address.toHexString()
        event.address = address
        
        let id = event.transaction.hash.toHex() + '-' + event.logIndex.toString() + '-0'
    
        handleCage(event)
    
        assert.fieldEquals("LiveChangeLog", id, "contract", addressString)
        
    
        clearStore()
    }
  )
  