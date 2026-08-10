import { createSafeLayoutServerComponent } from '@sugardarius/anzen/server-components'

export default createSafeLayoutServerComponent(
  {
    // as const required
    experimental_slots: ['analytics', 'team'] as const,
    id: 'playground/parallel/layout',
  },
  async ({ children, experimental_slots }) => (
    <div className='flex flex-col gap-4 p-8'>
      <h1 className='text-2xl font-bold'>Parallel Routes Example</h1>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='rounded-lg border bg-blue-50 p-4'>
          <h2 className='mb-2 text-lg font-semibold'>Analytics Slot</h2>
          {experimental_slots.analytics ?? (
            <div className='text-sm text-gray-400 italic'>
              Analytics slot: No matching route
            </div>
          )}
        </div>
        <div className='rounded-lg border bg-green-50 p-4'>
          <h2 className='mb-2 text-lg font-semibold'>Team Slot</h2>
          {experimental_slots.team ?? (
            <div className='text-sm text-gray-400 italic'>
              Team slot: No matching route
            </div>
          )}
        </div>
      </div>
      <div className='rounded-lg border bg-gray-50 p-4'>
        <h2 className='mb-2 text-lg font-semibold'>Main Content</h2>
        {children}
      </div>
    </div>
  ),
)
