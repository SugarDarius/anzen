import { createSafePageServerComponent } from '@sugardarius/anzen/server-components'

export default createSafePageServerComponent(
  {
    id: 'playground/parallel/@team/page',
  },
  async () => {
    return (
      <div className='flex flex-col gap-2'>
        <div className='text-sm text-gray-500'>Team Overview</div>
        <div className='space-y-2'>
          <div className='flex items-center gap-2 p-2 bg-gray-50 rounded'>
            <div className='w-8 h-8 bg-blue-500 rounded-full'></div>
            <div>
              <div className='font-medium'>John Doe</div>
              <div className='text-xs text-gray-500'>Developer</div>
            </div>
          </div>
          <div className='flex items-center gap-2 p-2 bg-gray-50 rounded'>
            <div className='w-8 h-8 bg-green-500 rounded-full'></div>
            <div>
              <div className='font-medium'>Jane Smith</div>
              <div className='text-xs text-gray-500'>Designer</div>
            </div>
          </div>
        </div>
      </div>
    )
  }
)
