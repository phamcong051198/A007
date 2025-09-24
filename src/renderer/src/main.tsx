import ReactDOM from 'react-dom/client'
import App from './App'
import './assets/index.css'
import { SidebarProvider } from '@renderer/context/SidebarContext'
import { CountProvider } from '@renderer/context/CountContext'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <SidebarProvider>
    <CountProvider>
      <App />
    </CountProvider>
  </SidebarProvider>
)
