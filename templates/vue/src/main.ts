import { createApp } from 'vue'
import { createDgPlugin } from 'dgclient/vue'
import App from './App.vue'
import { dg } from './dg'
import './styles.css'

// The plugin hands the one client to every composable (`useUser`, `useCollection`, `useConfig`, `useFlag`, `useBilling`, `useTheme`, `useI18n`).
createApp(App).use(createDgPlugin(dg)).mount('#app')
