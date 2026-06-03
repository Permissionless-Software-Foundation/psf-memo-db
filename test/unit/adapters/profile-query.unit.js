import { assert } from 'chai'
import sinon from 'sinon'
import ProfileQuery from '../../../src/adapters/profile-query.js'

describe('#ProfileQuery', () => {
  let uut
  let sandbox
  let profilesDb
  let ptxsDb

  beforeEach(() => {
    sandbox = sinon.createSandbox()
    profilesDb = {
      iterator: sandbox.stub()
    }
    ptxsDb = {
      get: sandbox.stub()
    }
    uut = new ProfileQuery({ profilesDb, ptxsDb })
  })

  afterEach(() => sandbox.restore())

  it('should scan profiles and attach block height from ptx', async () => {
    async function * mockIterator () {
      yield ['addr1', { text: 'hi', txid: 'tx1', seen: 1000 }]
      yield ['addr2', { text: 'bye', txid: 'tx2', seen: 2000 }]
    }
    profilesDb.iterator.returns(mockIterator())
    ptxsDb.get.withArgs('tx1').resolves({ blockHeight: 600100 })
    ptxsDb.get.withArgs('tx2').resolves({ blockHeight: 600200 })

    const result = await uut.scanProfilesWithBlockHeight()

    assert.equal(result.length, 2)
    assert.equal(result[0].blockHeight, 600100)
    assert.equal(result[1].blockHeight, 600200)
  })

  it('should use block height 0 when ptx is missing', async () => {
    async function * mockIterator () {
      yield ['addr1', { text: 'hi', txid: 'tx-missing', seen: 1000 }]
    }
    profilesDb.iterator.returns(mockIterator())
    ptxsDb.get.rejects(new Error('not found'))

    const result = await uut.scanProfilesWithBlockHeight()

    assert.equal(result[0].blockHeight, 0)
  })
})
