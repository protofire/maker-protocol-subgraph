import { tests } from "../../src/mappings/modules/tests";
import { Address, ethereum, BigInt } from "@graphprotocol/graph-ts";

export function mockDebt(): void{
  let debtResult = BigInt.fromString("100").toI32()
  tests.helpers.contractCalls.mockFunction(
      Address.fromString("0x35d1b3f3d7966a1dfe207aa4514c12a259a0492b"),
      'debt',
      'debt():(uint256)',
      [],
      [ethereum.Value.fromI32(debtResult)]
    )
}