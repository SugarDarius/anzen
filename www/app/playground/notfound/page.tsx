import { createSafePageServerComponent } from '@sugardarius/anzen/server-components'
import { redirect } from 'next/navigation'

export default createSafePageServerComponent(
  {
    debug: true,
    id: 'playground/notfound/page',
    onError: async (err: unknown): Promise<never> => {
      throw err
    },
  },
  async () => {
    redirect('/')
  },
)
