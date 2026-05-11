import { serve } from '@hono/node-server'
import { swaggerUI } from '@hono/swagger-ui'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'

const app = new OpenAPIHono()

const healthSchema = createRoute({
  method: 'get',
  path: '/health',
  responses: {
    200: {
      description: 'Respond a health check',
      content: {
        'application/json': {
          schema: z.object({
            status: z.string().openapi({
              example: 'ok',
            }),
          }),
        },
      },
    },
  },

})

app.openapi(healthSchema, (c) => {
  return c.json({
    status: 'ok',
  })
})


app.doc('/openapi.json', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'BeeTip API',
  },
})

app.get('/doc', swaggerUI({ url: '/openapi.json' }))

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
