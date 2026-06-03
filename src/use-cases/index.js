/*
  Use cases for psf-memo-db.
*/

import ListRecentProfiles from './list-recent-profiles.js'
import ListRecentPosts from './list-recent-posts.js'

class UseCases {
  constructor (localConfig = {}) {
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error('Adapters required when instantiating UseCases.')
    }

    this.listRecentProfiles = null
    this.listRecentPosts = null
  }

  async start () {
    this.listRecentProfiles = new ListRecentProfiles({ adapters: this.adapters })
    this.listRecentPosts = new ListRecentPosts({ adapters: this.adapters })
    console.log('Use cases initialized.')
    return true
  }
}

export default UseCases
