'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'

import { siteConfig } from '~/config/site'
import { Button } from '~/components/ui/button'

const GlitchText = ({ children }: { children: string }) => {
  return (
    <motion.span
      className='relative inline-block'
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <span
        className='relative z-10 bg-linear-to-r from-[#c4b5fd] via-[#a78bfa] to-[#8b5cf6] bg-clip-text text-transparent'
        style={{
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        {children}
      </span>
      <motion.span
        className='absolute inset-0 text-[#a78bfa]/40'
        style={{ clipPath: 'inset(10% 0 60% 0)' }}
        animate={{ x: [-2, 2, -2], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden='true'
      >
        {children}
      </motion.span>
      <motion.span
        className='absolute inset-0 text-[#c4b5fd]/40'
        style={{ clipPath: 'inset(60% 0 10% 0)' }}
        animate={{ x: [2, -2, 2], opacity: [0.4, 0.6, 0.4] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.5,
        }}
        aria-hidden='true'
      >
        {children}
      </motion.span>
    </motion.span>
  )
}

const LINE_REVEAL_DURATION_S = 0.3
const TYPING_MS_PER_CHAR = 25

const terminalLines = ({ pathname }: { pathname: string }) => {
  return [
    { text: `$ anzen route ${pathname}`, delay: 0 },
    { text: 'Resolving route...', delay: 0.8, isSystem: true },
    { text: 'ERROR: Route handler not found', delay: 1.6, isError: true },
    { text: '', delay: 2.0 },
    { text: 'Status: 404', delay: 2.2, isStatus: true },
    { text: `Path: ${pathname}`, delay: 2.5 },
    {
      text: 'Suggestion: Navigate to a valid route',
      delay: 2.8,
      isSuggestion: true,
    },
  ]
}

const TypingText = ({
  text,
  className,
  startDelay = 0,
}: {
  text: string
  className?: string
  startDelay?: number
}) => {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (text === '') {
      setDisplayed('')
      setDone(true)
      return
    }

    setDisplayed('')
    setDone(false)

    let intervalId: ReturnType<typeof setInterval> | undefined
    const timeoutId = setTimeout(() => {
      let i = 0
      intervalId = setInterval(() => {
        if (i < text.length) {
          setDisplayed(text.slice(0, i + 1))
          i++
        } else {
          setDone(true)
          if (intervalId !== undefined) clearInterval(intervalId)
        }
      }, TYPING_MS_PER_CHAR)
    }, startDelay * 1000)

    return () => {
      clearTimeout(timeoutId)
      if (intervalId !== undefined) clearInterval(intervalId)
    }
  }, [text, startDelay])

  return (
    <span className={className}>
      {displayed}
      {!done && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        >
          |
        </motion.span>
      )}
    </span>
  )
}

const Terminal = ({ pathname }: { pathname: string }) => {
  const lines = terminalLines({ pathname })
  const lastLine = lines[lines.length - 1]!
  const typingDurationS = (lastLine.text.length * TYPING_MS_PER_CHAR) / 1000
  const afterLastLineS =
    lastLine.delay + Math.max(LINE_REVEAL_DURATION_S, typingDurationS)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShowPrompt(true), afterLastLineS * 1000)
    return () => clearTimeout(t)
  }, [afterLastLineS])

  return (
    <motion.div
      className='w-full max-w-xl'
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className='rounded-lg border border-border overflow-hidden shadow-2xl'>
        <div className='bg-fd-muted px-4 py-3 flex items-center gap-2 border-b border-border'>
          <div className='flex gap-2'>
            <motion.div
              className='w-3 h-3 rounded-full bg-fd-error/80'
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 500 }}
            />
            <motion.div
              className='w-3 h-3 rounded-full bg-fd-warning/80'
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 500 }}
            />
            <motion.div
              className='w-3 h-3 rounded-full bg-fd-success/80'
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 500 }}
            />
          </div>
          <motion.span
            className='ml-3 text-xs text-fd-muted-foreground font-mono'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            @sugardarius/anzen
          </motion.span>
        </div>

        <div className='bg-fd-background p-4 sm:p-6 font-mono text-sm min-h-[280px] text-fd-'>
          <div className='space-y-2'>
            <AnimatePresence>
              {lines.map((line, index) => {
                let textColor = 'text-fd-foreground'
                if (line.isError) {
                  textColor = 'text-fd-error'
                }
                if (line.isSystem) {
                  textColor = 'text-fd-muted-foreground'
                }

                if (line.isStatus) {
                  textColor = 'text-fd-info'
                }
                if (line.isSuggestion) {
                  textColor = 'text-fd-warning'
                }

                return (
                  <motion.div
                    key={`${pathname}-${index}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{
                      duration: LINE_REVEAL_DURATION_S,
                      ease: 'easeOut',
                      delay: line.delay,
                    }}
                  >
                    <TypingText
                      text={line.text}
                      className={textColor}
                      startDelay={line.delay}
                    />
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {showPrompt && (
              <motion.div
                className='mt-4'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className='text-fd-foreground'>$ </span>
                <motion.span
                  className='text-fd-foreground'
                  animate={{ opacity: [1, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    repeatType: 'reverse',
                  }}
                >
                  _
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

export default function NotFound() {
  const pathname = usePathname()
  return (
    <div className='flex flex-col w-full h-full min-h-screen relative'>
      <main className='flex-1 flex flex-col items-center justify-center'>
        <div className='w-full max-w-2xl flex flex-col items-center'>
          <motion.div
            className='mb-8 text-center'
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className='text-7xl sm:text-8xl font-extrabold font-mono mb-2'>
              <GlitchText>404</GlitchText>
            </h1>
            <motion.p
              className='text-fd-muted-foreground text-sm font-mono'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              You&apos;re lost in uncharted territory.
            </motion.p>
          </motion.div>

          <Terminal pathname={pathname} />

          <motion.div
            className='mt-8 flex flex-col sm:flex-row items-center gap-3'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 4.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <Button asChild size='lg' className='group font-medium'>
              <Link href='/docs'>Read the docs</Link>
            </Button>
            <Button
              asChild
              variant='outline'
              size='lg'
              className='group font-medium'
            >
              <a
                href='https://github.com/SugarDarius/anzen'
                className='flex items-center gap-2'
              >
                <svg
                  viewBox='0 0 24 24'
                  className='h-5 w-5 fill-current'
                  aria-hidden='true'
                >
                  <path d='M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z' />
                </svg>
                GitHub
              </a>
            </Button>
          </motion.div>
        </div>
      </main>

      <footer className='py-8 border-t border-border flex-noe'>
        <div className='container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4'>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-fd-muted-foreground'>
              &copy; 2026{' '}
              <a
                href={`${siteConfig.github.url}/blob/main/LICENSE`}
                rel='noreferrer'
                target='_blank'
                className='transition-colors duration-150 ease-out font-semibold text-fd-foreground underline underline-offset-2'
              >
                MIT License
              </a>
            </span>
          </div>
          <p className='text-sm text-fd-muted-foreground'>
            Built with ❤️ by{' '}
            <a
              href='https://github.com/SugarDarius'
              className='text-fd-foreground hover:underline underline-offset-4'
            >
              SugarDarius
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
