import type { DgError, Doc, DgUser } from 'dgclient'
import { dg, notes, type Note } from './dg'

/** A readable message for any error the client throws (every failed call is a `DgError` with a typed `code`). */
function errorText(e: unknown): string {
  const { code } = e as DgError
  if (code === 'unauthorized') return 'Your session ended. Sign in again.'
  if (code === 'forbidden') return 'You are not allowed to do that.'
  if (code === 'quota_exceeded') return 'You have reached the limit.'
  return `Something went wrong (${code ?? 'unknown'}). The backend only exists on dg.run: upload your build to try it.`
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, props: Partial<HTMLElementTagNameMap[K]> = {}, ...children: (Node | string)[]): HTMLElementTagNameMap[K] {
  const node = Object.assign(document.createElement(tag), props)
  node.append(...children)
  return node
}

/**
 * The whole app as one class: it builds its DOM once, updates only the parts that changed (so a note arriving from another tab never
 * resets what you are typing), listens to the dg client, and cleans up after itself in `dispose()`.
 */
export class NotesApp {
  private user: DgUser | null = null
  private ready = false
  private items: Doc<Note>[] = []
  private error = ''
  private stopLive: (() => void) | null = null
  private stopUserListener: (() => void) | null = null

  private readonly status = el('p', { className: 'status' }, 'Loading…')
  private readonly bar = el('div', { className: 'bar' })
  private readonly input = el('input', { placeholder: 'Write a note', ariaLabel: 'New note' })
  private readonly addButton = el('button', { className: 'primary', disabled: true }, 'Add')
  private readonly form = el('form', {}, this.input, this.addButton)
  private readonly list = el('ul')
  private readonly empty = el('p', { className: 'empty' }, 'No notes yet.')
  private readonly hint = el('p', { className: 'live' }, 'Open this page in two tabs: a note added in one shows up in the other.')
  private readonly errorBox = el('p', { className: 'error', role: 'alert' })

  constructor(private readonly root: HTMLElement) {
    this.input.oninput = () => { this.addButton.disabled = !this.input.value.trim() }
    this.form.onsubmit = (e) => {
      e.preventDefault()
      const text = this.input.value.trim()
      if (!text) return
      this.input.value = ''
      this.addButton.disabled = true
      void this.add(text)
    }
    this.root.replaceChildren(el('main', {},
      el('h1', {}, 'My dg.run app'),
      el('p', { className: 'sub' }, 'Vite + dgclient: sign in and keep private notes, with no server of your own.'),
      this.status, this.bar, this.form, this.list, this.empty, this.hint, this.errorBox,
    ))
  }

  /** Renders the app and starts listening: wait for the client, then follow the user and keep their notes live. */
  start(): void {
    this.render()
    this.stopUserListener = dg.onChange((u) => this.setUser(u)) // sign-in, sign-out, and when the server ends the session
    void dg.ready.then((u) => { this.ready = true; this.setUser(u) })
  }

  dispose(): void {
    this.stopLive?.()
    this.stopUserListener?.()
  }

  private setUser(u: DgUser | null): void {
    const sameUser = u?.id === this.user?.id
    this.user = u
    if (!sameUser || (u && !this.stopLive)) {
      this.stopLive?.(); this.stopLive = null
      this.items = []
      if (u) {
        // `live` lists now, again after every change (pushed over a WebSocket the client opens by itself) and after a reconnect.
        this.stopLive = notes.live(
          { orderBy: 'createdAt', desc: true },
          (page) => { this.items = page.items; this.error = ''; this.render() },
          { onError: (e) => this.fail(e) },
        )
      }
    }
    this.render()
  }

  private fail(e: unknown): void {
    this.error = errorText(e)
    this.render()
  }

  private async add(text: string): Promise<void> {
    try { await notes.put({ text }); await this.reload() } catch (e) { this.fail(e) }
  }

  private async remove(key: string): Promise<void> {
    try { await notes.delete(key); await this.reload() } catch (e) { this.fail(e) }
  }

  /** For your own writes: show the result at once instead of waiting for the push. */
  private async reload(): Promise<void> {
    this.items = (await notes.list({ orderBy: 'createdAt', desc: true })).items
    this.error = ''
    this.render()
  }

  /** Brings the page in line with the state. The form is never rebuilt, so typing and focus survive every update. */
  private render(): void {
    const signedIn = this.ready && !!this.user
    this.status.hidden = this.ready
    this.bar.hidden = !this.ready
    this.form.hidden = !signedIn
    this.list.hidden = !signedIn || this.items.length === 0
    this.empty.hidden = !signedIn || this.items.length > 0
    this.hint.hidden = !signedIn
    this.errorBox.hidden = !this.error
    this.errorBox.textContent = this.error

    if (this.ready) {
      this.bar.replaceChildren(...(this.user
        ? [el('span', {}, `Signed in as ${this.user.email}`), el('button', { onclick: () => void dg.signOut() }, 'Sign out')]
        : [el('span', {}, 'Sign in to keep notes.'), el('button', { className: 'primary', onclick: () => void dg.signIn().catch((e) => this.fail(e)) }, 'Sign in with dg')]))
    }

    this.list.replaceChildren(...this.items.map((n) =>
      el('li', {},
        el('span', {}, n.data.text),
        el('button', { ariaLabel: `Delete note: ${n.data.text}`, onclick: () => void this.remove(n.key) }, 'Delete'),
      ),
    ))
  }
}
