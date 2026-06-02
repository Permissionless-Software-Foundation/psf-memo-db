import Router from 'koa-router'

class HealthRouter {
  attach (app) {
    const router = new Router({ prefix: '/health' })
    router.get('/', (ctx) => {
      ctx.body = { status: 'ok' }
    })
    app.use(router.routes())
    app.use(router.allowedMethods())
  }
}

export default HealthRouter
