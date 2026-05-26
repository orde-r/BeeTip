import 'dotenv/config';
import { serve } from '@hono/node-server'
import { swaggerUI } from '@hono/swagger-ui'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { AppError } from './errors/app-error.js'
import { authApp } from './routes/auth.routes.js'
import { orderApp } from './routes/order.routes.js'
import type { UserPayload } from './middlewares/auth.middleware.js'

type AppVariables = { Variables: { user: UserPayload } };

const app = new OpenAPIHono<AppVariables>({
  defaultHook: (result, c) => {
    if (!result.success) {
      const firstError = result.error.issues[0];
      return c.json({ message: firstError?.message ?? 'Validation error' }, 400);
    }
  },
})

app.onError((err, c) => {
  if (err instanceof AppError) {
    return c.json({ message: err.message }, err.statusCode as any);
  }

  console.error('Unhandled error:', err);
  return c.json({ message: 'Internal Server Error' }, 500);
});

const healthRoute = createRoute({
  method: 'get',
  path: '/health',
  tags: ['System'],
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

app.openapi(healthRoute, (c) => {
  return c.json({
    status: 'ok',
  })
})

app.route('/', authApp)
app.route('/', orderApp)

app.openAPIRegistry.registerComponent('securitySchemes', 'Bearer', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
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
