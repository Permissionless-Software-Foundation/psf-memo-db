/*
  REST API controller for /posts routes.
*/

import wlogger from '../../../adapters/wlogger.js'

class PostsRESTControllerLib {
  constructor (localConfig = {}) {
    this.adapters = localConfig.adapters
    this.useCases = localConfig.useCases
    if (!this.adapters) {
      throw new Error('Adapters required for Posts REST Controller.')
    }
    if (!this.useCases) {
      throw new Error('Use Cases required for Posts REST Controller.')
    }

    this.getRecentPosts = this.getRecentPosts.bind(this)
    this.handleError = this.handleError.bind(this)
  }

  handleError (ctx, err) {
    if (err.status) {
      ctx.throw(err.status, err.message || err)
    } else {
      wlogger.error('Error in posts controller: ', err)
      ctx.throw(500, err.message || 'Internal server error')
    }
  }

  /**
   * @api {get} /posts/recent List recent posts
   * @apiQuery {Number} [limit=100] Page size (max 100)
   * @apiQuery {Number} [offset=0] Number of posts to skip after sorting
   */
  async getRecentPosts (ctx) {
    try {
      const { limit, offset } = ctx.query
      ctx.body = await this.useCases.listRecentPosts.execute({ limit, offset })
    } catch (err) {
      this.handleError(ctx, err)
    }
  }
}

export default PostsRESTControllerLib
