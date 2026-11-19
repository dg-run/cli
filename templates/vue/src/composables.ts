import { computed, onScopeDispose, ref, shallowRef, watch } from 'vue'
import type { DgError, Doc } from '@dgrun/client'
import { dg, notes, type Note } from './dg'

/** A readable message for any error the client throws (every failed call is a `DgError` with a typed `code`). */
export function errorText(e: unknown): string {
  const { code } = e as DgError
  if (code === 'unauthorized') return 'Your session ended. Sign in again.'
  if (code === 'forbidden') return 'You are not allowed to do that.'
  if (code === 'quota_exceeded') return 'You have reached the limit.'
  return `Something went wrong (${code ?? 'unknown'}). The backend only exists on dg.run: upload your build to try it.`
}

/**
 * The signed-in user as a ref. `ready` turns true once the client has finished a sign-in redirect or restored the saved session:
 * wait for it before showing "Sign in".
 */
export function useUser() {
  const user = shallowRef(dg.user)
  const ready = ref(false)
  const stop = dg.onChange((u) => { user.value = u }) // sign-in, sign-out, and when the server ends the session
  void dg.ready.then((u) => { user.value = u; ready.value = true })
  onScopeDispose(stop)
  return { user, ready, userId: computed(() => user.value?.id) }
}

/**
 * Keeps the user's notes on screen with `collection.live`: it lists now, again after every change (pushed over a WebSocket the client
 * opens by itself) and after a reconnect, and polls when there is no connection. A new `userId` starts over.
 */
export function useNotes(userId: { value: string | undefined }) {
  const items = shallowRef<Doc<Note>[]>([])
  const error = ref('')
  let stop: (() => void) | null = null

  watch(
    () => userId.value,
    (id) => {
      stop?.(); stop = null
      if (!id) { items.value = []; error.value = ''; return }
      stop = notes.live(
        { orderBy: 'createdAt', desc: true },
        (page) => { items.value = page.items; error.value = '' },
        { onError: (e) => { error.value = errorText(e) } },
      )
    },
    { immediate: true },
  )
  onScopeDispose(() => stop?.())

  /** For your own writes: show the result at once instead of waiting for the push. */
  async function reload() {
    try { items.value = (await notes.list({ orderBy: 'createdAt', desc: true })).items } catch (e) { error.value = errorText(e) }
  }

  return { items, error, reload }
}
