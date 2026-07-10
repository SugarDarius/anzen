import { createSafePageServerComponent } from '@sugardarius/anzen/server-components'

export default createSafePageServerComponent(
  {
    id: 'playground/parallel/@team/default',
  },
  async () => (
    <div className='text-sm text-gray-400 italic'>
      Team slot: No matching route (showing default)
    </div>
  ),
)
