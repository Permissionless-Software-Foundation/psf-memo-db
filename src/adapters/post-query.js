/*
  Adapter for scanning posts with stored block height.
*/

class PostQuery {
  constructor (localConfig = {}) {
    const { postsDb } = localConfig
    if (!postsDb) {
      throw new Error('postsDb required when instantiating PostQuery adapter.')
    }
    this.postsDb = postsDb
    this.scanPostsWithBlockHeight = this.scanPostsWithBlockHeight.bind(this)
  }

  async scanPostsWithBlockHeight () {
    const posts = []

    for await (const [txid, post] of this.postsDb.iterator()) {
      posts.push({
        txid,
        addr: post.addr,
        text: post.text,
        seen: post.seen,
        blockHeight: post.blockHeight ?? 0
      })
    }

    return posts
  }

  async scanPostsByAddr (addr) {
    const posts = []

    for await (const [txid, post] of this.postsDb.iterator()) {
      if (post.addr !== addr) continue
      posts.push({
        txid,
        addr: post.addr,
        text: post.text,
        seen: post.seen,
        blockHeight: post.blockHeight ?? 0
      })
    }

    return posts
  }
}

export default PostQuery
