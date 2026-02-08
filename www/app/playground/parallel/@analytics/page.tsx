import { createSafePageServerComponent } from '@sugardarius/anzen/server-components'

export default createSafePageServerComponent(
  {
    id: 'playground/parallel/@analytics/page',
  },
  async () => {
    return (
      <div className='flex flex-col gap-2'>
        <div className='text-sm text-gray-500'>Analytics Dashboard</div>
        <div className='grid grid-cols-2 gap-2'>
          <div className='bg-blue-50 p-3 rounded'>
            <div className='text-xs text-gray-600'>Page Views</div>
            <div className='text-2xl font-bold'>1,234</div>
          </div>
          <div className='bg-green-50 p-3 rounded'>
            <div className='text-xs text-gray-600'>Visitors</div>
            <div className='text-2xl font-bold'>567</div>
          </div>
        </div>
      </div>
    )
  }
)
