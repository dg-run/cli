import { createDg, type Collection } from '@dgrun/client'

/** The shape of what this app stores. The client checks every put, patch and query against it. */
export interface Note {
  text: string
}

/**
 * One client for the whole app. It talks to `/_dg/*` on your app's own address (so there are no keys, no CORS and nothing to
 * configure): dg.run knows which app is calling from the address it runs on.
 */
export const dg = createDg()

/** Private collection: every signed-in user only ever sees their own notes. Use `dg.db.collection('x', 'public')` to share with everyone. */
export const notes: Collection<Note> = dg.db.collection<Note>('notes')
