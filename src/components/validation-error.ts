export class ValidationError extends Error {
  constructor(type: 'segments' | 'searchParams', id?: string) {
    super(
      `${type === 'searchParams' ? 'Search params' : 'Segments'} validation error for file component '${id}`
    )
    this.name = 'ValidationError'
  }
}
