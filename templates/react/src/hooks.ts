import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import type { DgError, Doc } from '@dgrun/client'
import { dg, notes, type Note } from './dg'

/** The signed-in user (or null). Re-renders on sign-in, sign-out, and when the server ends the session. */
export function useUser() {
  return useSyncExternalStore(
    (onChange) => dg.onChange(onChange),
    () => dg.user,
    () => null,
  )
}

/** False until the client has finished a sign-in redirect or restored the saved session. Wait for it before showing "Sign in". */
export function useReady() {
  const [ready, setReady] = useState(false)
  useEffect(() => { void dg.ready.then(() => setReady(true)) }, [])
  return ready
}

/** A readable message for any error the client throws (every failed call is a `DgError` with a typed `code`). */
export function errorText(e: unknown): string {
  const { code } = e as DgError
  if (code === 'unauthorized') return 'Your session ended. Sign in again.'
  if (code === 'forbidden') return 'You are not allowed to do that.'
  if (code === 'quota_exceeded') return 'You have reached the limit.'
  return `Something went wrong (${code ?? 'unknown'}). The backend only exists on dg.run: upload your build to try it.`
}

/**
 * Keeps the user's notes on screen with `collection.live`: it lists now, again after every change (pushed over a WebSocket the client
 * opens by itself) and after a reconnect, and polls when there is no connection. Pass the user's id; a new id starts over.
 */
export function useNotes(userId: string | undefined) {
  const [items, setItems] = useState<Doc<Note>[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!userId) { setItems([]); setError(''); return }
    return notes.live(
      { orderBy: 'createdAt', desc: true },
      (page) => { setItems(page.items); setError('') },
      { onError: (e) => setError(errorText(e)) },
    )
  }, [userId])

  /** For your own writes: show the result at once instead of waiting for the push. */
  const reload = useCallback(async () => {
    try { setItems((await notes.list({ orderBy: 'createdAt', desc: true })).items) } catch (e) { setError(errorText(e)) }
  }, [])

  return { items, error, setError, reload }
}
