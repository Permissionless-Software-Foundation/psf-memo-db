/*
  Adapter for scanning profiles and resolving block height from ptx records.
*/

class ProfileQuery {
  constructor (localConfig = {}) {
    const { profilesDb, ptxsDb } = localConfig
    if (!profilesDb) {
      throw new Error('profilesDb required when instantiating ProfileQuery adapter.')
    }
    if (!ptxsDb) {
      throw new Error('ptxsDb required when instantiating ProfileQuery adapter.')
    }
    this.profilesDb = profilesDb
    this.ptxsDb = ptxsDb
    this.scanProfilesWithBlockHeight = this.scanProfilesWithBlockHeight.bind(this)
  }

  async getBlockHeightForTxid (txid) {
    if (!txid) return 0
    try {
      const ptx = await this.ptxsDb.get(txid)
      const height = ptx && ptx.blockHeight
      return typeof height === 'number' ? height : parseInt(height, 10) || 0
    } catch (err) {
      return 0
    }
  }

  async scanProfilesWithBlockHeight () {
    const profiles = []

    for await (const [addr, profile] of this.profilesDb.iterator()) {
      const blockHeight = await this.getBlockHeightForTxid(profile.txid)
      profiles.push({
        addr,
        text: profile.text,
        txid: profile.txid,
        seen: profile.seen,
        blockHeight
      })
    }

    return profiles
  }
}

export default ProfileQuery
