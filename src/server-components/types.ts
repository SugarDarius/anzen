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

export type ArrayToUnion<T extends readonly (string | number)[]> = T[number]

export type TSegmentsDict = StandardSchemaDictionary
export type TSearchParamsDict = StandardSchemaDictionary

export type OnValidationError = (
  issues: readonly StandardSchemaV1.Issue[]
) => Awaitable<never>

export type BaseOptions<TSegments extends TSegmentsDict | undefined> = {
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

  /**
   * Dynamic route segments used for the server component route path.
   * By design it will handle if the segments are a `Promise` or not.
   *
   * Please note the expected input is a `StandardSchemaDictionary`.
   */
  segments?: TSegments
  /**
   * Callback triggered when dynamic segments validations returned issues.
   * By default it throws a Validation error and issues are logged into the console.
   */
  onSegmentsValidationError?: OnValidationError
}

// TODO: find better way to type it 👇🏻
export type PageAuthFunctionParams<
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

export type LayoutAuthFunctionParams<
  TSegments extends TSegmentsDict | undefined,
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
  : EmptyObjectType)

export type PageAuthFunction<
  AC extends AuthContext | undefined,
  TSegments extends TSegmentsDict | undefined,
  TSearchParams extends TSearchParamsDict | undefined,
> = (
  params: PageAuthFunctionParams<TSegments, TSearchParams>
) => Awaitable<AC | never>

export type LayoutAuthFunction<
  AC extends AuthContext | undefined,
  TSegments extends TSegmentsDict | undefined,
> = (params: LayoutAuthFunctionParams<TSegments>) => Awaitable<AC | never>

export type CreateSafePageServerComponentOptions<
  AC extends AuthContext | undefined,
  TSegments extends TSegmentsDict | undefined,
  TSearchParams extends TSearchParamsDict | undefined,
> = BaseOptions<TSegments> & {
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
  authorize?: PageAuthFunction<AC, TSegments, TSearchParams>
}

export type CreateSafeLayoutServerComponentOptions<
  AC extends AuthContext | undefined,
  TSegments extends TSegmentsDict | undefined,
  TSlots extends readonly string[] | undefined,
> = BaseOptions<TSegments> & {
  /**
   * Function to use to authorize the server component.
   * By default it always authorize the server component.
   *
   * Return never (throws an error, `notFound`, `forbidden`, `unauthorized`, or `redirect`)
   * when the request to the server component is not authorized.
   */
  authorize?: LayoutAuthFunction<AC, TSegments>

  /**
   * Slots used in the layout when using parallel routes (experimental).
   */
  experimental_slots?: TSlots
}

// Sticking to Next.js typing requirements for build time
export type PageProvidedProps = {
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
}

// Sticking to Next.js typing requirements for build time
export type LayoutProvidedProps<TSlots extends readonly string[] | undefined> =
  {
    /**
     * Route dynamic segments as params
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params: Awaitable<any> | undefined

    /**
     * Incoming children when `createSafeServerComponent` is used for `layout.js` file.
     */
    children: React.ReactNode
  } & (TSlots extends readonly string[]
    ? {
        /**
         * Incoming slots when `createSafeServerComponent` is used for `layout.js` file
         * with parallel routes. Set to an empty object when they don't exists.
         */
        [K in ArrayToUnion<TSlots>]: React.ReactNode
      }
    : EmptyObjectType)

export type CreateSafePageServerComponentReturnType = (
  /**
   * Provided props added by Next.js itself
   */
  props: PageProvidedProps
) => Promise<React.ReactElement | never>

export type CreateSafeLayoutServerComponentReturnType<
  TSlots extends readonly string[] | undefined,
> = (
  /**
   * Provided props added by Next.js itself
   */
  props: LayoutProvidedProps<TSlots>
) => Promise<React.ReactElement | never>

// TODO: find better way to type it 👇🏻
export type SafePageServerComponentContext<
  AC extends AuthContext | undefined,
  TSegments extends TSegmentsDict | undefined,
  TSearchParams extends TSearchParamsDict | undefined,
> = {
  /**
   * Server component ID
   */
  readonly id: string
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

export type SafeLayoutServerComponentContext<
  AC extends AuthContext | undefined,
  TSegments extends TSegmentsDict | undefined,
  TSlots extends readonly string[] | undefined,
> = {
  /**
   * Server component ID
   */
  readonly id: string

  /**
   * Incoming children when `createSafeServerComponent` is used for `layout.js` file.
   * They are set to a fragment when they don't exists in a `page.js` file.
   */
  readonly children: React.ReactNode
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
  (TSlots extends readonly string[]
    ? {
        /**
         * Incoming slots when `createSafeServerComponent` is used for `layout.js` file
         * with parallel routes. Set to an empty object when they don't exists.
         */
        readonly slots: {
          [K in TSlots[number]]: React.ReactNode
        }
      }
    : EmptyObjectType)

export type SafePageServerComponent<
  AC extends AuthContext | undefined,
  TSegments extends TSegmentsDict | undefined,
  TSearchParams extends TSearchParamsDict | undefined,
> = (
  /**
   * Safe page server component context
   */
  ctx: SafePageServerComponentContext<AC, TSegments, TSearchParams>
) => Promise<React.ReactElement | never>

export type SafeLayoutServerComponent<
  AC extends AuthContext | undefined,
  TSegments extends TSegmentsDict | undefined,
  TSlots extends readonly string[] | undefined,
> = (
  /**
   * Safe layout server component context
   */
  ctx: SafeLayoutServerComponentContext<AC, TSegments, TSlots>
) => Promise<React.ReactElement | never>
