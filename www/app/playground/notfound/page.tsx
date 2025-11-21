import { createSafePageServerComponent } from '@sugardarius/anzen/server-components'
import { redirect } from 'next/navigation'

export default createSafePageServerComponent(
  {
    id: 'playground/notfound/page',
    debug: true,
    onError: async (err: unknown): Promise<never> => {
      throw err
    },
  },
  async () => {
    redirect('/')
  }
)
