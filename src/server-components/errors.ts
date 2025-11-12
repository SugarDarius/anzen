export class ValidationError extends Error {
  constructor(type: 'segments' | 'searchParams', id: string) {
    super(
      `${type === 'searchParams' ? 'Search params' : 'Segments'} validation error for file component '${id}`
    )
    this.name = 'ValidationError'
  }
}

export class NoSegmentsProvidedError extends Error {
  constructor(id: string) {
    super(`No segments provided for server component '${id}'`)
    this.name = 'NoSegmentsProvidedError'
  }
}

export class NoSearchParamsProvidedError extends Error {
  constructor(id: string) {
    super(`No search params provided for server component '${id}'`)
    this.name = 'NoSearchParamsProvidedError'
  }
}
