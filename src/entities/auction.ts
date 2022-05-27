import { Auction } from "../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"


export namespace Auctions {
    /**
     * The function will load or create an auction. It will set the metadatas (createdAt, highestBidder, lastUpdate) automatically. A creation should only occur on the Falpper#kick event
     * @param id Flapper#id to load
     * @param event the ethereum event to load
     * @returns the loaded or created auction
     */
    export function loadOrCreateAuction(id: string, event: ethereum.Event): Auction{
        let auction = Auction.load(id)
        if (!auction){
            auction = new Auction(id)
            auction.createdAt = event.block.timestamp
            // this might be wrong since the msg.sender does not always equal to transaction.from
            auction.highestBidder = event.transaction.from
        }
        auction.lastUpdate = event.block.timestamp
        return auction
    }
}