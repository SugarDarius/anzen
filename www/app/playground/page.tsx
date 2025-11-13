import { createSafePageServerComponent } from '@sugardarius/anzen/server-components'

export default createSafePageServerComponent(
  {
    id: 'playground/page',
  },
  async () => {
    return (
      <div className='flex flex-col items-center justify-center w-full h-12'>
        Hello Playground 👋🏻
      </div>
    )
  }
)
