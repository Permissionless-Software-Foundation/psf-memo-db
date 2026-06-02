/*
  Use cases for psf-memo-db (minimal for v1).
*/

class UseCases {
  constructor (localConfig = {}) {
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error('Adapters required when instantiating UseCases.')
    }
  }

  async start () {
    console.log('Use cases initialized.')
    return true
  }
}

export default UseCases
