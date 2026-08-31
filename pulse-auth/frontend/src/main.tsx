import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/contexts/AuthContext'
import { MusicPlayerProvider } from '@/contexts/MusicPlayerContext'
import { FavoriteProvider } from '@/contexts/FavoriteContext'
import { ListenRoomProvider } from '@/contexts/ListenRoomContext'
import './index.css'
import App from './app/App.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      retry: false,
    },
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FavoriteProvider>
          <MusicPlayerProvider>
            <ListenRoomProvider>
              <App />
            </ListenRoomProvider>
          </MusicPlayerProvider>
        </FavoriteProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1a1a1a',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '500',
            },
            success: {
              iconTheme: { primary: '#3FD6FF', secondary: '#090909' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#090909' },
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
