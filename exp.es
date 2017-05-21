import { readJsonSync } from 'fs-extra'
import { join } from 'path-extra'

const rawTable1 = readJsonSync(join(__dirname, 'assets', 'exp_1_99.json'))
const rawTable2 = readJsonSync(join(__dirname, 'assets', 'exp_100_155.json'))

// verify that data is consistent in both rawTable1 and rawTable2
// and properly sorted by level (Level 1~99 for rawTable1 and Level 100~155 for rawTable2)
const verifyData = assert => {
  const verifyRawTable = (rawTable,initRow,finalRow) => {
    assert( Array.isArray( rawTable ) && rawTable.length > 0, "type & length sanity check")
    assert.deepEqual(rawTable[0], initRow)
    const go = (expected,row) => {
      assert(row.length === 3, `Incorrect col count`)
      const [lvl,diff,total] = row
      assert(expected.lvl === lvl, `Level out of order`)
      assert(expected.total === total - diff, `Data inconsistent at level ${lvl}`)
      return { lvl: expected.lvl+1, total: expected.total+diff }
    }
    rawTable.reduce(go,{lvl: initRow[0], total: 0})
    assert.deepEqual(rawTable[rawTable.length-1],finalRow)
  }
  verifyRawTable(
    rawTable1,
    [1,0,0], [99,148500,1000000])
  verifyRawTable(
    rawTable2,
    [100,0,0], [155,240000,4470000])
}

export {
  verifyData,
}