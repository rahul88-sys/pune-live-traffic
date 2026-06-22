import 'dotenv/config'
import http from 'http'
import { Server } from 'socket.io'
import app from './server'
import { setSocketServer } from './lib/socket'

const PORT = Number(process.env.PORT) || 3001
const httpServer = http.createServer(app)

const io = new Server(httpServer, {
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000', methods: ['GET', 'POST'] },
})

setSocketServer(io)

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`)

  socket.on('subscribe:area', ({ lat, lng, radius }: { lat: number; lng: number; radius: number }) => {
    const room = `area:${Math.round(lat * 10)}_${Math.round(lng * 10)}_${radius}`
    socket.join(room)
  })

  socket.on('unsubscribe:area', () => {
    socket.rooms.forEach(room => { if (room !== socket.id) socket.leave(room) })
  })

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`)
  })
})

httpServer.listen(PORT, () => {
  console.log(`🚦 Pune Live Traffic API running on http://localhost:${PORT}`)
})
