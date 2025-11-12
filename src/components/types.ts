import type {
  StandardSchemaDictionary,
  StandardSchemaV1,
} from '../standard-schema'
import type { Awaitable } from '../types'

export type TSegmentsDict = StandardSchemaDictionary
export type TSearchParamsDict = StandardSchemaDictionary

export type OnValidationError = (
  issues: readonly StandardSchemaV1.Issue[]
) => Awaitable<never>

export type BaseOptions = {
  /**
   * ID for the file component.
   * Used when logging in development or when `debug` is enabled.
   *
   * You can also use it to add extra logging or monitoring.
   */
  id?: string

  /**
   * Use this options to enable debug mode.
   * It will add logs in the handler to help you debug file component..
   *
   * By default it's set to `false` for production builds.
   * In development builds, it will be `true` if `NODE_ENV` is not set to `production`.
   */
  debug?: boolean
}

export type CreateSafeFileComponentOptions<
  TSegments extends TSegmentsDict | undefined,
  TSearchParams extends TSearchParamsDict | undefined,
> = BaseOptions & {
  /**
   * Dynamic route segments used for the route handler path.
   * By design it will handler if the segments are a `Promise` or not.
   *
   * Please note the expected input is a `StandardSchemaDictionary`.
   */
  segments?: TSegments
  /**
   * Callback triggered when dynamic segments validations returned issues.
   * By default it throws a Validation error and issues are logged into the console.
   */
  onSegmentsValidationError?: OnValidationError

  /**
   * Search params used in the route.
   *
   * Please note the expected input is a `StandardSchemaDictionary`.
   */
  searchParams?: TSearchParams
  /**
   * Callback triggered when search params validations returned issues.
   * By default it throws a Validation error and issues are logged into the console.
   */
  onSearchParamsValidationError?: OnValidationError
}
