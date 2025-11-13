export class ValidationError extends Error {
  constructor(
    validationType: 'segments' | 'searchParams',
    id: string,
    serverComponentType: 'page' | 'layout'
  ) {
    super(
      `${validationType === 'searchParams' ? 'Search params' : 'Segments'} validation error for ${serverComponentType} server component '${id}`
    )
    this.name = 'ValidationError'
  }
}

export class NoSegmentsProvidedError extends Error {
  constructor(id: string, serverComponentType: 'page' | 'layout') {
    super(
      `No segments provided for ${serverComponentType} server component '${id}'`
    )
    this.name = 'NoSegmentsProvidedError'
  }
}

export class NoSearchParamsProvidedError extends Error {
  constructor(id: string, serverComponentType: 'page' | 'layout') {
    super(
      `No search params provided for ${serverComponentType} server component '${id}'`
    )
    this.name = 'NoSearchParamsProvidedError'
  }
}
