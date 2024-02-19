import { execSync } from 'node:child_process'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { app } from '../src/app'

describe('Meals routes', () => {
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

  it('should be able to register a new meal', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'Dahyun',
      email: 'dahyun@gmail.com',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Pipoca da Nayeon',
        description: 'Feita pela própria',
        itsOnDiet: true,
        time: '2024-01-22T18:25:43.511Z',
      })
      .expect(201)
  })

  it('should be able to list all user meal', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'Dahyun',
      email: 'dahyun@gmail.com',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Pipoca da Nayeon',
      description: 'Feita pela própria',
      itsOnDiet: true,
      time: '2024-01-22T18:25:43.511Z',
    })

    const listUserMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    expect(listUserMealsResponse.body.meals).toEqual([
      expect.objectContaining({
        name: 'Pipoca da Nayeon',
      }),
    ])
  })

  it('should be able to get a specific meal', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'Dahyun',
      email: 'dahyun@gmail.com',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Pipoca da Nayeon',
      description: 'Feita pela própria',
      itsOnDiet: true,
      time: '2024-01-22T18:25:43.511Z',
    })

    const listUserMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    const mealId = listUserMealsResponse.body.meals[0].id

    const getMealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(getMealResponse.body.meal).toEqual(
      expect.objectContaining({
        name: 'Pipoca da Nayeon',
      }),
    )
  })

  it('should be able to delete a meal', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'Dahyun',
      email: 'dahyun@gmail.com',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Pipoca da Nayeon',
      description: 'Feita pela própria',
      itsOnDiet: true,
      time: '2024-01-22T18:25:43.511Z',
    })

    const listUserMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    const mealId = listUserMealsResponse.body.meals[0].id

    await request(app.server)
      .delete(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(204)
  })

  it('should be able to edit a meal', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'Dahyun',
      email: 'dahyun@gmail.com',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Pipoca da Nayeon',
      description: 'Feita pela própria',
      itsOnDiet: true,
      time: '2024-01-22T18:25:43.511Z',
    })

    const listUserMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    const mealId = listUserMealsResponse.body.meals[0].id

    const editMealResponse = await request(app.server)
      .patch(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .send({
        name: 'X-burguer da Momo',
        description: 'Feita pela própria',
        itsOnDiet: false,
      })
      .expect(200)

    expect(editMealResponse.body.meal[0]).toEqual(
      expect.objectContaining({
        name: 'X-burguer da Momo',
      }),
    )
  })

  it('should be able to get user metrics', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'Dahyun',
      email: 'dahyun@gmail.com',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Pipoca da Nayeon',
      description: 'Feita pela própria',
      itsOnDiet: true,
      time: '2024-01-22T18:25:43.511Z',
    })

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'X-burguer da Momo',
      description: 'Feita pela própria',
      itsOnDiet: false,
      time: '2024-01-22T18:25:43.511Z',
    })

    const metricsResponse = await request(app.server)
      .get('/meals/metrics')
      .set('Cookie', cookies)
      .expect(200)

    expect(metricsResponse.body.metrics).toEqual({
      mealsCount: 2,
      mealsOnDiet: 1,
      mealsOffDiet: 1,
      bestSequence: 1,
    })
  })
})
