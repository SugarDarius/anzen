import { cn } from '~/lib/utils'

export function RetroGrid({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute size-full overflow-hidden opacity-50 perspective-[200px]',
        className,
      )}
      {...props}
    >
      <div className='absolute inset-0 transform-[rotateX(60deg)]'>
        <div className='animate-grid inset-[0%_0px] ml-[-200%] h-[300vh] w-[600vw] origin-[100%_0_0] bg-[linear-gradient(to_right,gray_1px,transparent_0),linear-gradient(to_bottom,gray_1px,transparent_0)] bg-size-[60px_60px] bg-repeat dark:bg-[linear-gradient(to_right,gray_1px,transparent_0),linear-gradient(to_bottom,gray_1px,transparent_0)]' />
      </div>

      <div className='pointer-events-none absolute inset-0 flex items-center justify-center bg-stone-50 mask-[radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-stone-950' />
    </div>
  )
}
