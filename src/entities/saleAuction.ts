import { SaleAuction } from '../../generated/schema'
import { ethereum } from '@graphprotocol/graph-ts'

export namespace SaleAuctions {
  export function loadOrCreateSaleAuction(id: string, event: ethereum.Event): SaleAuction {
    let saleAuction = SaleAuction.load(id)
    if (!saleAuction) {
      saleAuction = new SaleAuction(id)
      saleAuction.startedAt = event.block.timestamp
    }
    saleAuction.updatedAt = event.block.timestamp
    return saleAuction
  }
}
