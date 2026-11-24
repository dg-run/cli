<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCollection, useUser } from 'dgclient/vue'
import { notes } from './dg'
import { errorText } from './errors'

// `ready` is false until the client has finished a sign-in redirect or restored the saved session.
const { user, ready, signIn, signOut } = useUser()
// A list that stays fresh (live updates over a WebSocket, a poll when there is none) with writes that refresh it.
// It only loads while somebody is signed in, and starts over when the user changes.
const { items, error: listError, put, remove } = useCollection(notes, { orderBy: 'createdAt', desc: true })
const text = ref('')
const actionError = ref('')
const error = computed(() => actionError.value || (listError.value ? errorText(listError.value) : ''))

async function add() {
  const value = text.value.trim()
  if (!value) return
  text.value = ''
  actionError.value = ''
  try { await put({ text: value }) } catch (e) { actionError.value = errorText(e) }
}

async function del(key: string) {
  actionError.value = ''
  try { await remove(key) } catch (e) { actionError.value = errorText(e) }
}

function logIn() {
  signIn().catch((e) => { actionError.value = errorText(e) })
}
</script>

<template>
  <main>
    <h1>My dg.run app</h1>
    <p class="sub">Vue + dgclient: sign in and keep private notes, with no server of your own.</p>

    <p v-if="!ready" class="status">Loading…</p>

    <div v-else-if="!user" class="bar">
      <span>Sign in to keep notes.</span>
      <button class="primary" @click="logIn">Sign in with dg</button>
    </div>

    <template v-else>
      <div class="bar">
        <span>Signed in as {{ user.email }}</span>
        <button @click="signOut()">Sign out</button>
      </div>

      <form @submit.prevent="add">
        <input v-model="text" placeholder="Write a note" aria-label="New note" />
        <button class="primary" :disabled="!text.trim()">Add</button>
      </form>

      <p v-if="items.length === 0" class="empty">No notes yet.</p>
      <ul v-else>
        <li v-for="n in items" :key="n.key">
          <span>{{ n.data.text }}</span>
          <button :aria-label="`Delete note: ${n.data.text}`" @click="del(n.key)">Delete</button>
        </li>
      </ul>
      <p class="live">Open this page in two tabs: a note added in one shows up in the other.</p>
    </template>

    <p v-if="error" class="error" role="alert">{{ error }}</p>
  </main>
</template>
