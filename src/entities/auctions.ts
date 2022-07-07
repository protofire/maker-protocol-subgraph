import { SurplusAuction, DebtAuction } from '../../generated/schema'
import { ethereum } from '@graphprotocol/graph-ts'

export namespace auctions {
  /**
   * The function will load or create a Surplus Auction. It will set the metadatas (createdAt, highestBidder, lastUpdate) automatically. A creation should only occur on the Falpper#kick event
   * @param id Flapper#id to load
   * @param event the ethereum event to load
   * @returns the loaded or created auction
   */

  export function loadOrCreateSurplusAuction(id: string, event: ethereum.Event): SurplusAuction {
    let auction = SurplusAuction.load(id)

    if (!auction) {
      auction = new SurplusAuction(id)
      auction.createdAt = event.block.timestamp
      auction.active = true
    }

    auction.updatedAt = event.block.timestamp
    return auction
  }

  /**
   * The function will load or create a Debt Auction. It will set the metadatas (createdAt, highestBidder, lastUpdate) automatically. A creation should only occur on the Falpper#kick event
   * @param id Flopper#id to load
   * @param event the ethereum event to load
   * @returns the loaded or created auction
   */

  export function loadOrCreateDebtAuction(id: string, event: ethereum.Event): DebtAuction {
    let auction = DebtAuction.load(id)

    if (!auction) {
      auction = new DebtAuction(id)
      auction.createdAt = event.block.timestamp
      auction.active = true
    }

    auction.updatedAt = event.block.timestamp
    return auction
  }
}
