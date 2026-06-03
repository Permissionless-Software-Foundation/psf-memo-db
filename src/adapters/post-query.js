/*
  Adapter for scanning posts and resolving block height from ptx records.
*/

class PostQuery {
  constructor (localConfig = {}) {
    const { postsDb, ptxsDb } = localConfig
    if (!postsDb) {
      throw new Error('postsDb required when instantiating PostQuery adapter.')
    }
    if (!ptxsDb) {
      throw new Error('ptxsDb required when instantiating PostQuery adapter.')
    }
    this.postsDb = postsDb
    this.ptxsDb = ptxsDb
    this.scanPostsWithBlockHeight = this.scanPostsWithBlockHeight.bind(this)
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

  async scanPostsWithBlockHeight () {
    const posts = []

    for await (const [txid, post] of this.postsDb.iterator()) {
      const blockHeight = await this.getBlockHeightForTxid(txid)
      posts.push({
        txid,
        addr: post.addr,
        text: post.text,
        seen: post.seen,
        blockHeight
      })
    }

    return posts
  }
}

export default PostQuery
