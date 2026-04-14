import { createSafePageServerComponent } from '@sugardarius/anzen/server-components'

import { ServerActionPlayground } from './server-action-playground'

export default createSafePageServerComponent(
  { id: 'playground/server-actions' },
  async () => {
    return <ServerActionPlayground />
  }
)
