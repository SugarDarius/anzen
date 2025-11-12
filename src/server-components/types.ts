import type {
  StandardSchemaDictionary,
  StandardSchemaV1,
} from '../standard-schema'
import type {
  Awaitable,
  AuthContext,
  UnwrapReadonlyObject,
  EmptyObjectType,
} from '../types'

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
   * Callback triggered when the file component throws an unhandled error..
   * By default it rethrows as service hatch to Next.js do its job
   * band use error boundaries. The error is logged into the console.
   *
   * Use it if you want to manage unexpected errors properly
   * to log, trace or define behaviors like using `notFound` or `redirect`.
   */
  onError?: (err: unknown) => Awaitable<never>

  /**
   * Use this options to enable debug mode.
   * It will add logs in the handler to help you debug file component..
   *
   * By default it's set to `false` for production builds.
   * In development builds, it will be `true` if `NODE_ENV` is not set to `production`.
   */
  debug?: boolean
}

export type AuthFunctionParams<
  TSegments extends TSegmentsDict | undefined,
  TSearchParams extends TSearchParamsDict | undefined,
> = {
  /**
   * File component ID
   */
  readonly id: string
} & (TSegments extends TSegmentsDict
  ? {
      /**
       * Validated route dynamic segments
       */
      readonly segments: UnwrapReadonlyObject<
        StandardSchemaDictionary.InferOutput<TSegments>
      >
    }
  : EmptyObjectType) &
  (TSearchParams extends TSearchParamsDict
    ? {
        /**
         * Validated search params
         */
        readonly searchParams: UnwrapReadonlyObject<
          StandardSchemaDictionary.InferOutput<TSearchParams>
        >
      }
    : EmptyObjectType)

export type AuthFunction<
  AC extends AuthContext | undefined,
  TSegments extends TSegmentsDict | undefined,
  TSearchParams extends TSearchParamsDict | undefined,
> = (
  params: AuthFunctionParams<TSegments, TSearchParams>
) => Awaitable<AC | never>

export type CreateSafeFileComponentOptions<
  AC extends AuthContext | undefined,
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

  /**
   * Function to use to authorize the file component.
   * By default it always authorize the file component.
   *
   * Return never (throws and error, `notFound`, or `redirect`) when the request to the file component is not authorized.
   */
  authorize?: AuthFunction<AC, TSegments, TSearchParams>
}

// Sticking to Next.js requirements for building
export type ProvidedProps = {
  /**
   * Route dynamic segments as params
   */
  params: // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Awaitable<any> | undefined

  /**
   * Search params
   */
  searchParams:
    | Awaitable<{ [key: string]: string | string[] | undefined }>
    | undefined
}
