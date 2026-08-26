import { createSafePageServerComponent } from '@sugardarius/anzen/server-components'
import { redirect } from 'next/navigation'

export default createSafePageServerComponent(
  {
    debug: true,
    id: 'playground/notfound/page',
  },
  async () => {
    redirect('/')
  },
)
