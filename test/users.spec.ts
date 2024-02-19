import { execSync } from 'node:child_process'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'

import { app } from '../src/app'

describe('Users routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npx knex migrate:rollback --all')
    execSync('npx knex migrate:latest')
  })

  it('should be able to register a new user', async () => {
    await request(app.server)
      .post('/users')
      .send({
        name: 'Dahyun',
        email: 'dahyun1@gmail.com',
      })
      .expect(201)
  })
})
