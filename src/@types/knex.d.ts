// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/result' {
  interface Registry {
    Count: number
  }
}

declare module 'knex/types/Tables' {
  export interface Tables {
    meals: {
      id: string
      user_id: string
      name: string
      description: string
      its_on_diet: boolean
      time: string
    }

    users: {
      id: string
      session_id: string
      name: string
      email: string
      created_at: string
    }
  }
}
