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
   * ID for the server component.
   * Used when logging in development or when `debug` is enabled.
   *
   * You can also use it to add extra logging or monitoring.
   */
  id?: string

  /**
   * Callback triggered when the server component throws an unhandled error..
   * By default it rethrows as service hatch to Next.js do its job
   * band use error boundaries. The error is logged into the console.
   *
   * Use it if you want to manage unexpected errors properly
   * to log, trace or define behaviors like using `notFound` or `redirect`.
   */
  onError?: (err: unknown) => Awaitable<never>

  /**
   * Use this options to enable debug mode.
   * It will add logs in the handler to help you debug server component..
   *
   * By default it's set to `false` for production builds.
   * In development builds, it will be `true` if `NODE_ENV` is not set to `production`.
   */
  debug?: boolean
}

// TODO: find better way to type it 👇🏻
export type AuthFunctionParams<
  TSegments extends TSegmentsDict | undefined,
  TSearchParams extends TSearchParamsDict | undefined,
> = {
  /**
   * Server component ID
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

export type CreateSafeServerComponentOptions<
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
   * Function to use to authorize the server component.
   * By default it always authorize the server component.
   *
   * Return never (throws an error, `notFound`, `forbidden`, `unauthorized`, or `redirect`)
   * when the request to the server component is not authorized.
   */
  authorize?: AuthFunction<AC, TSegments, TSearchParams>
}

// Sticking to Next.js requirements for building
export type ProvidedProps = {
  /**
   * Route dynamic segments as params
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: Awaitable<any> | undefined

  /**
   * Search params
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  searchParams: Awaitable<any> | undefined
  /**
   * Incoming children when `createSafeServerComponent` is used for `layout.js` file.
   */
  children: React.ReactNode
}

export type CreateSafeServerComponentReturnType = (
  /**
   * Provided props added by Next.js itself
   */
  providedProps: ProvidedProps
) => Promise<React.ReactElement | never>

// TODO: find better way to type it 👇🏻
export type SafeServerComponentContext<
  AC extends AuthContext | undefined,
  TSegments extends TSegmentsDict | undefined,
  TSearchParams extends TSearchParamsDict | undefined,
> = {
  /**
   * Server component ID
   */
  readonly id: string
  /**
   * Incoming children when `createSafeServerComponent` is used for `layout.js` file.
   * They are set to a fragment when they don't exists in a `page.js` file.
   */
  children: React.ReactNode
} & (AC extends AuthContext
  ? {
      /**
       * Auth context
       */
      readonly auth: AC
    }
  : EmptyObjectType) &
  (TSegments extends TSegmentsDict
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

export type SafeServerComponentRoot<
  AC extends AuthContext | undefined,
  TSegments extends TSegmentsDict | undefined,
  TSearchParams extends TSearchParamsDict | undefined,
> = (
  /**
   * Safe server component context
   */
  ctx: SafeServerComponentContext<AC, TSegments, TSearchParams>
) => Promise<React.ReactElement | never>
