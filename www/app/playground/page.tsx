import { createSafePageServerComponent } from '@sugardarius/anzen/server-components'
import Link from 'next/link'

export default createSafePageServerComponent(
  {
    id: 'playground/page',
  },
  async () => (
    <div className='flex flex-col items-center justify-center w-full gap-4 p-8'>
      <div className='text-xl'>Hello Playground 👋🏻</div>
      <div className='flex flex-col gap-2'>
        <Link
          href='/playground/server-actions'
          className='text-blue-600 hover:underline'
        >
          → Safe server actions
        </Link>
        <Link
          href='/playground/parallel'
          className='text-blue-600 hover:underline'
        >
          → Parallel Routes Example
        </Link>
      </div>
    </div>
  ),
)
