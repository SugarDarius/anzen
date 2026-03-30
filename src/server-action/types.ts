import type { StandardSchemaV1 } from '../standard-schema'
import type { AuthContext } from '../types'

export type TInputSchema = StandardSchemaV1<object>

export type BaseOptions = {
  /**
   * ID for the server action.
   * Used when logging in development or when `debug` is enabled.
   *
   * You can also use it to add extra logging or monitoring.
   */
  id?: string

  /**
   * Use this options to enable debug mode.
   * It will add logs in the handler to help you debug server action.
   *
   * By default it's set to `false` for production builds.
   * In development builds, it will be `true` if `NODE_ENV` is not set to `production`.
   */
  debug?: boolean
}

export type CreateSafeServerActionOptions<AC extends AuthContext | undefined> =
  BaseOptions & {}
