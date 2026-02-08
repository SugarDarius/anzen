import { createSafePageServerComponent } from '@sugardarius/anzen/server-components'
import Link from 'next/link'

export default createSafePageServerComponent(
  {
    id: 'playground/parallel/page',
  },
  async () => {
    return (
      <div className='flex flex-col gap-4'>
        <p className='text-gray-600'>
          This is the main page for the parallel routes example. Navigate to
          different routes to see how parallel routes work.
        </p>
        <div className='flex flex-col gap-2'>
          <Link
            href='/playground/parallel/settings'
            className='text-blue-600 hover:underline'
          >
            Go to /settings (Team slot will show settings, Analytics stays on
            current page)
          </Link>
          <Link
            href='/playground/parallel'
            className='text-blue-600 hover:underline'
          >
            Back to main parallel route
          </Link>
        </div>
      </div>
    )
  }
)
