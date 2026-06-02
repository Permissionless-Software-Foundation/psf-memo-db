/*
  REST API Controller for /level routes.
*/

import wlogger from '../../../adapters/wlogger.js'
import { makeCrudHandlers, ENTITY_CONFIG } from './crud-handlers.js'

class LevelRESTControllerLib {
  constructor (localConfig = {}) {
    this.adapters = localConfig.adapters
    this.useCases = localConfig.useCases
    if (!this.adapters) {
      throw new Error('Adapters required for Level REST Controller.')
    }

    this.handleError = this.handleError.bind(this)
    this.getStatus = this.getStatus.bind(this)
    this.createStatus = this.createStatus.bind(this)
    this.updateStatus = this.updateStatus.bind(this)
    this.deleteStatus = this.deleteStatus.bind(this)
    this.backup = this.backup.bind(this)
    this.restore = this.restore.bind(this)

    this.entityHandlers = {}
    for (const cfg of ENTITY_CONFIG) {
      const handlers = makeCrudHandlers(cfg)
      this.entityHandlers[cfg.route] = {
        get: async (ctx) => this._wrap(handlers.get, ctx),
        create: async (ctx) => this._wrap(handlers.create, ctx),
        update: async (ctx) => this._wrap(handlers.update, ctx),
        delete: async (ctx) => this._wrap(handlers.delete, ctx),
        keyParam: cfg.keyParam
      }
    }
  }

  handleError (ctx, err) {
    if (err.status) {
      ctx.throw(err.status, err.message || err)
    } else {
      ctx.throw(422, err.message)
    }
  }

  async _wrap (fn, ctx) {
    try {
      await fn(ctx, this.adapters)
    } catch (err) {
      wlogger.error('Error in level controller: ', err)
      this.handleError(ctx, err)
    }
  }

  async getStatus (ctx) {
    try {
      const { statusKey } = ctx.params
      ctx.body = await this.adapters.level.statusDb.get(statusKey)
    } catch (err) {
      this.handleError(ctx, err)
    }
  }

  async createStatus (ctx) {
    try {
      const { statusKey, statusData } = ctx.request.body
      await this.adapters.level.statusDb.put(statusKey, statusData)
      ctx.body = { statusKey, success: true }
    } catch (err) {
      this.handleError(ctx, err)
    }
  }

  async updateStatus (ctx) {
    try {
      const statusKey = 'status'
      const { statusData } = ctx.request.body
      await this.adapters.level.statusDb.put(statusKey, statusData)
      ctx.body = { statusKey, success: true }
    } catch (err) {
      this.handleError(ctx, err)
    }
  }

  async deleteStatus (ctx) {
    try {
      const { statusKey } = ctx.params
      await this.adapters.level.statusDb.del(statusKey)
      ctx.body = { statusKey, success: true }
    } catch (err) {
      this.handleError(ctx, err)
    }
  }

  async backup (ctx) {
    try {
      const { height, epoch } = ctx.request.body
      await this.adapters.dbBackup.zipDb(height, epoch)
      ctx.body = { success: true }
    } catch (err) {
      this.handleError(ctx, err)
    }
  }

  async restore (ctx) {
    try {
      const { height } = ctx.request.body
      await this.adapters.dbBackup.unzipDb(height)
      console.log('Restore complete. Exiting for process manager restart.')
      process.exit(0)
    } catch (err) {
      this.handleError(ctx, err)
    }
  }
}

export default LevelRESTControllerLib
