import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { knex } from '../database'
import { checkSessionIdExists } from '../middleware/check-session-id-exists'

export async function mealsRoutes(app: FastifyInstance) {
  app.get(
    '/metrics',
    { preHandler: [checkSessionIdExists] },
    async (request) => {
      const meals = await knex('meals')
        .where({ user_id: request.user?.id })
        .orderBy('time', 'asc')

      const mealsCount = meals.length
      let mealsOnDiet = 0
      meals.forEach((meal) => {
        if (meal.its_on_diet) mealsOnDiet++
      })
      const mealsOffDiet = mealsCount - mealsOnDiet

      let bestSequence = 0
      let bestSequenceAux = 0
      meals.forEach((meal) => {
        if (meal.its_on_diet) {
          bestSequenceAux++
        } else {
          if (bestSequenceAux > bestSequence) {
            bestSequence = bestSequenceAux
          }
          bestSequenceAux = 0
        }
        if (bestSequenceAux > bestSequence) {
          bestSequence = bestSequenceAux
        }
      })

      return {
        metrics: { mealsCount, mealsOnDiet, mealsOffDiet, bestSequence },
      }
    },
  )

  app.get('/:id', { preHandler: [checkSessionIdExists] }, async (request) => {
    const getMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getMealParamsSchema.parse(request.params)

    const meal = await knex('meals')
      .where({ user_id: request.user?.id, id })
      .first()

    return { meal }
  })

  app.get('/', { preHandler: [checkSessionIdExists] }, async (request) => {
    const meals = await knex('meals').where({ user_id: request.user?.id })

    return { meals }
  })

  app.delete(
    '/:id',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getMealParamsSchema.parse(request.params)

      await knex('meals')
        .where({ user_id: request.user?.id, id })
        .first()
        .delete()

      return reply.status(204).send()
    },
  )

  app.patch('/:id', { preHandler: [checkSessionIdExists] }, async (request) => {
    const getMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getMealParamsSchema.parse(request.params)

    const editMealBodySchema = z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      itsOnDiet: z.boolean().optional(),
      time: z.string().datetime().optional(),
    })

    const { name, description, itsOnDiet, time } = editMealBodySchema.parse(
      request.body,
    )

    const meal = await knex('meals')
      .where({ user_id: request.user?.id, id })
      .first()
      .update(
        {
          name,
          description,
          its_on_diet: itsOnDiet,
          time,
        },
        ['*'],
      )

    return { meal }
  })

  app.post(
    '/',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const createMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        itsOnDiet: z.boolean(),
        time: z.string().datetime(),
      })

      const { name, description, itsOnDiet, time } = createMealBodySchema.parse(
        request.body,
      )

      await knex('meals').insert({
        id: randomUUID(),
        name,
        description,
        its_on_diet: itsOnDiet,
        user_id: request.user?.id,
        time,
      })

      return reply.status(201).send()
    },
  )
}
