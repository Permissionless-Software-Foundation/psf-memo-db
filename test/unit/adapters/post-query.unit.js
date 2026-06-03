import { assert } from 'chai'
import sinon from 'sinon'
import PostQuery from '../../../src/adapters/post-query.js'

describe('#PostQuery', () => {
  let uut
  let sandbox
  let postsDb

  beforeEach(() => {
    sandbox = sinon.createSandbox()
    postsDb = {
      iterator: sandbox.stub()
    }
    uut = new PostQuery({ postsDb })
  })

  afterEach(() => sandbox.restore())

  it('should scan posts and read block height from stored document', async () => {
    async function * mockIterator () {
      yield ['tx1', { addr: 'addr1', text: 'hello', seen: 1000, blockHeight: 600100 }]
      yield ['tx2', { addr: 'addr2', text: 'world', seen: 2000, blockHeight: 600200 }]
    }
    postsDb.iterator.returns(mockIterator())

    const result = await uut.scanPostsWithBlockHeight()

    assert.equal(result.length, 2)
    assert.equal(result[0].txid, 'tx1')
    assert.equal(result[0].blockHeight, 600100)
    assert.equal(result[1].txid, 'tx2')
    assert.equal(result[1].blockHeight, 600200)
  })

  it('should use block height 0 when field is missing', async () => {
    async function * mockIterator () {
      yield ['tx-missing', { addr: 'addr1', text: 'hi', seen: 1000 }]
    }
    postsDb.iterator.returns(mockIterator())

    const result = await uut.scanPostsWithBlockHeight()

    assert.equal(result[0].blockHeight, 0)
  })
})
