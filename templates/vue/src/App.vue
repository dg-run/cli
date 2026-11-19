<script setup lang="ts">
import { ref } from 'vue'
import { dg, notes } from './dg'
import { errorText, useNotes, useUser } from './composables'

const { user, ready, userId } = useUser()
const { items, error, reload } = useNotes(userId)
const text = ref('')

async function add() {
  const value = text.value.trim()
  if (!value) return
  text.value = ''
  try { await notes.put({ text: value }); await reload() } catch (e) { error.value = errorText(e) }
}

async function remove(key: string) {
  try { await notes.delete(key); await reload() } catch (e) { error.value = errorText(e) }
}

function signIn() {
  dg.signIn().catch((e) => { error.value = errorText(e) })
}
</script>

<template>
  <main>
    <h1>My dg.run app</h1>
    <p class="sub">Vue + @dgrun/client: sign in and keep private notes, with no server of your own.</p>

    <p v-if="!ready" class="status">Loading…</p>

    <div v-else-if="!user" class="bar">
      <span>Sign in to keep notes.</span>
      <button class="primary" @click="signIn">Sign in with dg</button>
    </div>

    <template v-else>
      <div class="bar">
        <span>Signed in as {{ user.email }}</span>
        <button @click="dg.signOut()">Sign out</button>
      </div>

      <form @submit.prevent="add">
        <input v-model="text" placeholder="Write a note" aria-label="New note" />
        <button class="primary" :disabled="!text.trim()">Add</button>
      </form>

      <p v-if="items.length === 0" class="empty">No notes yet.</p>
      <ul v-else>
        <li v-for="n in items" :key="n.key">
          <span>{{ n.data.text }}</span>
          <button :aria-label="`Delete note: ${n.data.text}`" @click="remove(n.key)">Delete</button>
        </li>
      </ul>
      <p class="live">Open this page in two tabs: a note added in one shows up in the other.</p>
    </template>

    <p v-if="error" class="error" role="alert">{{ error }}</p>
  </main>
</template>
