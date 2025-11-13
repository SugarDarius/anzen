import { createSafeLayoutServerComponent } from '@sugardarius/anzen/server-components'

export default createSafeLayoutServerComponent(
  {
    id: 'playground/layout',
  },
  async ({ children }) => {
    return (
      <div className='flex flex-col items-center justify-center w-full h-12'>
        {children}
      </div>
    )
  }
)
