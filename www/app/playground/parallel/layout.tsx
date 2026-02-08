import { createSafeLayoutServerComponent } from '@sugardarius/anzen/server-components'
export default createSafeLayoutServerComponent(
  {
    id: 'playground/parallel/layout',
    // as const required
    experimental_slots: ['analytics', 'team'] as const,
  },
  async ({ children, slots }) => {
    return (
      <div className='flex flex-col gap-4 p-8'>
        <h1 className='text-2xl font-bold'>Parallel Routes Example</h1>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='border rounded-lg p-4 bg-blue-50'>
            <h2 className='text-lg font-semibold mb-2'>Analytics Slot</h2>
            {slots.analytics ?? (
              <div className='text-sm text-gray-400 italic'>
                Analytics slot: No matching route
              </div>
            )}
          </div>
          <div className='border rounded-lg p-4 bg-green-50'>
            <h2 className='text-lg font-semibold mb-2'>Team Slot</h2>
            {slots.team ?? (
              <div className='text-sm text-gray-400 italic'>
                Team slot: No matching route
              </div>
            )}
          </div>
        </div>
        <div className='border rounded-lg p-4 bg-gray-50'>
          <h2 className='text-lg font-semibold mb-2'>Main Content</h2>
          {children}
        </div>
      </div>
    )
  }
)
