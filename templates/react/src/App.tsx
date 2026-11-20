import { useState, type FormEvent } from 'react'
import { dg, notes } from './dg'
import { errorText, useNotes, useReady, useUser } from './hooks'

export default function App() {
  const ready = useReady()
  const user = useUser()
  const { items, error, setError, reload } = useNotes(user?.id)
  const [text, setText] = useState('')

  async function add(e: FormEvent) {
    e.preventDefault()
    const value = text.trim()
    if (!value) return
    setText('')
    try { await notes.put({ text: value }); await reload() } catch (err) { setError(errorText(err)) }
  }

  async function remove(key: string) {
    try { await notes.delete(key); await reload() } catch (err) { setError(errorText(err)) }
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
          <button className="primary" onClick={() => dg.signIn().catch((e) => setError(errorText(e)))}>Sign in with dg</button>
        </div>
      ) : (
        <>
          <div className="bar">
            <span>Signed in as {user.email}</span>
            <button onClick={() => void dg.signOut()}>Sign out</button>
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
                  <button onClick={() => void remove(n.key)} aria-label={`Delete note: ${n.data.text}`}>Delete</button>
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
