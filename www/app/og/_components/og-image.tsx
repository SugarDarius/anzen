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
    <div
      style={{
        display: 'flex',
        height: '100%',
        width: '100%',
        color: '#f4f4f5',
        fontFamily:
          'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          width: '100%',
          backgroundImage: 'linear-gradient(to bottom right, #18181b, #000000)',
          border: '1px solid #27272a',
          padding: '3rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-6rem',
            right: '-6rem',
            width: '24rem',
            height: '24rem',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            borderRadius: '9999px',
            filter: 'blur(64px)',
          }}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '3rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              padding: '0.5rem 1.25rem',
              borderRadius: '9999px',
              border: '1px solid rgba(99, 102, 241, 0.2)',
            }}
          >
            <span
              style={{
                color: '#818cf8',
                fontSize: '1.25rem',
                lineHeight: '1.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              {siteConfig.title}
            </span>
          </div>
          <div
            style={{
              marginLeft: '1.5rem',
              width: '0.375rem',
              height: '0.375rem',
              borderRadius: '9999px',
              backgroundColor: '#3f3f46',
            }}
          />
          {date ? (
            <span
              style={{
                marginLeft: '1.5rem',
                color: '#71717a',
                fontSize: '1.5rem',
                lineHeight: '2rem',
                fontWeight: 500,
              }}
            >
              {date}
            </span>
          ) : null}
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: '1 1 0%',
          }}
        >
          <h1
            style={{
              fontSize: '3.75rem',
              lineHeight: 1,
              fontWeight: 900,
              letterSpacing: '-0.05em',
              marginBottom: 0,
              display: 'block',
              whiteSpace: 'pre',
              textWrap: 'pretty',
              backgroundImage:
                'linear-gradient(to right, #c4b5fd, #a78bfa, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: '1.875rem',
              color: '#a1a1aa',
              lineHeight: 1.625,
              textWrap: 'pretty',
            }}
          >
            {description}
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginTop: 'auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '1rem',
              padding: '1rem 2rem 1rem 1rem',
              backdropFilter: 'blur(4px)',
            }}
          >
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
              style={{ color: '#f4f4f5' }}
            >
              <path d='M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z' />
              <path d='m3.3 7 8.7 5 8.7-5' />
              <path d='M12 22V12' />
            </svg>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                marginLeft: '1rem',
              }}
            >
              <span
                style={{
                  color: '#a1a1aa',
                  fontSize: '1.125rem',
                  lineHeight: '1.75rem',
                  fontWeight: 500,
                }}
              >
                Read more at
              </span>
              <span
                style={{
                  color: '#f4f4f5',
                  fontSize: '1.5rem',
                  lineHeight: '2rem',
                  fontWeight: 700,
                }}
              >
                {url}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
