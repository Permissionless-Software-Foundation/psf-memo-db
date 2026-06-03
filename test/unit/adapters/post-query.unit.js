import { assert } from 'chai'
import sinon from 'sinon'
import PostQuery from '../../../src/adapters/post-query.js'

describe('#PostQuery', () => {
  let uut
  let sandbox
  let postsDb
  let ptxsDb

  beforeEach(() => {
    sandbox = sinon.createSandbox()
    postsDb = {
      iterator: sandbox.stub()
    }
    ptxsDb = {
      get: sandbox.stub()
    }
    uut = new PostQuery({ postsDb, ptxsDb })
  })

  afterEach(() => sandbox.restore())

  it('should scan posts and attach block height from ptx', async () => {
    async function * mockIterator () {
      yield ['tx1', { addr: 'addr1', text: 'hello', seen: 1000 }]
      yield ['tx2', { addr: 'addr2', text: 'world', seen: 2000 }]
    }
    postsDb.iterator.returns(mockIterator())
    ptxsDb.get.withArgs('tx1').resolves({ blockHeight: 600100 })
    ptxsDb.get.withArgs('tx2').resolves({ blockHeight: 600200 })

    const result = await uut.scanPostsWithBlockHeight()

    assert.equal(result.length, 2)
    assert.equal(result[0].txid, 'tx1')
    assert.equal(result[0].blockHeight, 600100)
    assert.equal(result[1].txid, 'tx2')
    assert.equal(result[1].blockHeight, 600200)
  })

  it('should use block height 0 when ptx is missing', async () => {
    async function * mockIterator () {
      yield ['tx-missing', { addr: 'addr1', text: 'hi', seen: 1000 }]
    }
    postsDb.iterator.returns(mockIterator())
    ptxsDb.get.rejects(new Error('not found'))

    const result = await uut.scanPostsWithBlockHeight()

    assert.equal(result[0].blockHeight, 0)
  })
})
