import { createSafeLayoutServerComponent } from '@sugardarius/anzen/server-components'

export default createSafeLayoutServerComponent(
  {
    id: 'playground/layout',
  },
  async ({ children }) => (
    <div className='flex w-full flex-col items-center py-8 px-8'>
      {children}
    </div>
  ),
)
