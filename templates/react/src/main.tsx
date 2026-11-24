import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { DgProvider } from 'dgclient/react'
import App from './App'
import { dg } from './dg'
import './styles.css'

// `DgProvider` hands the one client to every hook below it (`useUser`, `useCollection`, `useConfig`, `useFlag`, `useBilling`, `useTheme`, `useI18n`).
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DgProvider client={dg}>
      <App />
    </DgProvider>
  </StrictMode>,
)
