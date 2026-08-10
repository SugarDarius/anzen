import { createSafeLayoutServerComponent } from '@sugardarius/anzen/server-components'

export default createSafeLayoutServerComponent(
  {
    id: 'playground/layout',
  },
  async ({ children }) => (
    <div className='flex w-full flex-col items-center px-8 py-8'>
      {children}
    </div>
  ),
)
