import { siteConfig } from '~/config/site'

export function OgImage({
  title,
  description,
  date,
  url,
}: {
  title: string
  description: string
  date?: string
  url: string
}) {
  return (
    <div tw='flex h-full w-full text-zinc-100 font-sans'>
      <div tw='flex flex-col h-full w-full bg-linear-to-br from-zinc-900 to-black border border-zinc-800 p-12 shadow-2xl relative overflow-hidden'>
        <div tw='absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl' />
        <div tw='flex items-center mb-12'>
          <div tw='flex items-center justify-center bg-indigo-500/10 px-5 py-2 rounded-full border border-indigo-500/20'>
            <span tw='text-indigo-400 text-xl font-bold uppercase tracking-widest'>
              {siteConfig.title}
            </span>
          </div>
          <div tw='ml-6 w-1.5 h-1.5 rounded-full bg-zinc-700' />
          {date ? (
            <span tw='ml-6 text-zinc-500 text-2xl font-medium'>{date}</span>
          ) : null}
        </div>
        <div tw='flex flex-col flex-1'>
          <h1 tw='text-6xl font-black leading-none tracking-tighter mb-0  block whitespace-pre text-wrap bg-linear-to-r from-[#c4b5fd] via-[#a78bfa] to-[#8b5cf6] bg-clip-text text-transparent'>
            {title}
          </h1>
          <p tw='text-3xl text-zinc-400 leading-relaxed text-pretty'>
            {description}
          </p>
        </div>
        <div tw='flex items-center mt-auto'>
          <div tw='flex items-center bg-white/5 border border-white/10 rounded-2xl p-4 pr-8 backdrop-blur-sm'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='48'
              height='48'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <path d='M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z' />
              <path d='m3.3 7 8.7 5 8.7-5' />
              <path d='M12 22V12' />
            </svg>
            <div tw='flex flex-col ml-4'>
              <span tw='text-zinc-400 text-lg font-medium'>Read more at</span>
              <span tw='text-zinc-100 text-2xl font-bold'>{url}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
