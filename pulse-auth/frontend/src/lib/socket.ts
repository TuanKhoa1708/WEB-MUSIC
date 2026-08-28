import { io } from 'socket.io-client'

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

export const socket = io(BACKEND_URL, {
  autoConnect: false, // We'll connect manually when user enters a room
  transports: ['websocket', 'polling'],
})

export default socket
