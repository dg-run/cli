import type { DgError } from 'dgclient'

/** A readable message for any error the client throws (every failed call is a `DgError` with a typed `code`). */
export function errorText(e: unknown): string {
  const { code } = (e ?? {}) as Partial<DgError>
  if (code === 'unauthorized') return 'Your session ended. Sign in again.'
  if (code === 'forbidden') return 'You are not allowed to do that.'
  if (code === 'quota_exceeded') return 'You have reached the limit.'
  return `Something went wrong (${code ?? 'unknown'}). The backend only exists on dg.run: upload your build to try it.`
}
