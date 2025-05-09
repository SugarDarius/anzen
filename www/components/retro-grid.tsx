import { cn } from '~/lib/utils'

export function RetroGrid({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute size-full overflow-hidden [perspective:200px] opacity-50',
        className
      )}
      {...props}
    >
      <div className='absolute inset-0 [transform:rotateX(60deg)]'>
        <div className='animate-grid [background-image:linear-gradient(to_right,gray_1px,transparent_0),linear-gradient(to_bottom,gray_1px,transparent_0)] [background-repeat:repeat] [background-size:60px_60px] [height:300vh] [inset:0%_0px] [margin-left:-200%] [transform-origin:100%_0_0] [width:600vw] dark:[background-image:linear-gradient(to_right,gray_1px,transparent_0),linear-gradient(to_bottom,gray_1px,transparent_0)]' />
      </div>

      <div className='absolute inset-0 bg-gradient-to-t from-white to-transparent to-90% dark:from-black' />
    </div>
  )
}
