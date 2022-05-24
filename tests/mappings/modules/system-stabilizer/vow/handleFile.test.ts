import { Bytes, Address, BigInt, BigDecimal } from "@graphprotocol/graph-ts";
import { units } from "@protofire/subgraph-toolkit";
import { test, clearStore, assert } from "matchstick-as";
import { LogNote } from "../../../../../generated/Vow/Vow";
import { handleCage, handleFile } from "../../../../../src/mappings/modules/system-stabilizer/vow";
import { tests } from "../../../../../src/mappings/modules/tests";
import { mockDebt } from "../../../../helpers/mockedFunctions";

let amount = "100500000000000000000000000000000000000000000000" // 100.5 (rad) 100500000000000000000000000000 (wad)
let sig = "0x29ae8114"

type TransformAmount = (n: BigInt) => BigDecimal

function checkHandleFile(what: string, field: string, transformAmount: TransformAmount): void{
    let event = changetype<LogNote>(tests.helpers.events.getNewEvent([
        tests.helpers.params.getBytes("sig", Bytes.fromHexString(sig)),
        tests.helpers.params.getBytes("usr", Bytes.fromUTF8("")),
        tests.helpers.params.getBytes("arg1", Bytes.fromUTF8(what)),
        tests.helpers.params.getBytes("arg2", Bytes.fromUint8Array(Bytes.fromBigInt(BigInt.fromString(amount)).reverse())),
    ]))

    handleFile(event)

    assert.fieldEquals("SystemState", "current", field, transformAmount(BigInt.fromString(amount)).toString());
    clearStore()  
}

function returnPlainAmount(amount: BigInt): BigDecimal{
    return amount.toBigDecimal()
}

test("Vow#handleFile for what=wait.", () => {
    mockDebt()
    checkHandleFile("wait", "debtAuctionDelay", returnPlainAmount)
})

test("Vow#handleFile for what=bump",() => {
    checkHandleFile("bump", "surplusAuctionLotSize", units.fromRad)
})

test("Vow#handleFile for what=sump",() => {
    checkHandleFile("sump", "debtAuctionBidSize", units.fromRad)
})

test("Vow#handleFile for what=dump",() => {
    checkHandleFile("dump", "debtAuctionInitialLotSize", units.fromWad)
})

test("Vow#handleFile for what=hump",() => {
    checkHandleFile("hump", "surplusAuctionBuffer", units.fromRad)
})
