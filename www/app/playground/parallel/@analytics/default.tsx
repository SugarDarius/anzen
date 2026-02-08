import { createSafePageServerComponent } from '@sugardarius/anzen/server-components'

export default createSafePageServerComponent(
  {
    id: 'playground/parallel/@analytics/default',
  },
  async () => {
    return (
      <div className='text-sm text-gray-400 italic'>
        Analytics slot: No matching route (showing default)
      </div>
    )
  }
)
