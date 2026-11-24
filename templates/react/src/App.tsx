import { useState, type FormEvent } from 'react'
import { useCollection, useUser } from 'dgclient/react'
import { notes } from './dg'
import { errorText } from './errors'

export default function App() {
  // `ready` is false until the client has finished a sign-in redirect or restored the saved session.
  const { user, ready, signIn, signOut } = useUser()
  // A list that stays fresh (live updates over a WebSocket, a poll when there is none) with writes that refresh it.
  // It only loads while somebody is signed in, and starts over when the user changes.
  const { items, error: listError, put, remove } = useCollection(notes, { orderBy: 'createdAt', desc: true })
  const [text, setText] = useState('')
  const [actionError, setActionError] = useState('')
  const error = actionError || (listError ? errorText(listError) : '')

  async function add(e: FormEvent) {
    e.preventDefault()
    const value = text.trim()
    if (!value) return
    setText('')
    setActionError('')
    try { await put({ text: value }) } catch (err) { setActionError(errorText(err)) }
  }

  async function del(key: string) {
    setActionError('')
    try { await remove(key) } catch (err) { setActionError(errorText(err)) }
  }

  return (
    <main>
      <h1>My dg.run app</h1>
      <p className="sub">React + dgclient: sign in and keep private notes, with no server of your own.</p>

      {!ready ? (
        <p className="status">Loading…</p>
      ) : !user ? (
        <div className="bar">
          <span>Sign in to keep notes.</span>
          <button className="primary" onClick={() => signIn().catch((e) => setActionError(errorText(e)))}>Sign in with dg</button>
        </div>
      ) : (
        <>
          <div className="bar">
            <span>Signed in as {user.email}</span>
            <button onClick={() => void signOut()}>Sign out</button>
          </div>

          <form onSubmit={add}>
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a note" aria-label="New note" />
            <button className="primary" disabled={!text.trim()}>Add</button>
          </form>

          {items.length === 0 ? (
            <p className="empty">No notes yet.</p>
          ) : (
            <ul>
              {items.map((n) => (
                <li key={n.key}>
                  <span>{n.data.text}</span>
                  <button onClick={() => void del(n.key)} aria-label={`Delete note: ${n.data.text}`}>Delete</button>
                </li>
              ))}
            </ul>
          )}
          <p className="live">Open this page in two tabs: a note added in one shows up in the other.</p>
        </>
      )}
      {error && <p className="error" role="alert">{error}</p>}
    </main>
  )
}
