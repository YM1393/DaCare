const { createServer } = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 3001;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

const httpServer = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('DaCare Socket.IO Server OK');
});
const io = new Server(httpServer, {
  cors: {
    origin: ALLOWED_ORIGIN,
    methods: ['GET', 'POST'],
  },
});

// 채팅방별 연결 수 추적
const roomMembers = {};

io.on('connection', (socket) => {
  console.log(`[연결] 소켓 ID: ${socket.id}`);

  // 채팅방 입장
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    roomMembers[roomId] = (roomMembers[roomId] || 0) + 1;
    console.log(`[입장] ${socket.id} → 방: ${roomId} (현재 인원: ${roomMembers[roomId]})`);
  });

  // 메시지 전송 → 같은 방 전체에 브로드캐스트
  socket.on('send_message', (data) => {
    const { roomId } = data;
    if (!roomId) return;
    io.to(roomId).emit('receive_message', data);
    console.log(`[메시지] 방: ${roomId} | 사용자: ${data.user} | 내용: ${data.text}`);
  });

  // 연결 해제
  socket.on('disconnecting', () => {
    for (const roomId of socket.rooms) {
      if (roomId !== socket.id && roomMembers[roomId]) {
        roomMembers[roomId] = Math.max(0, roomMembers[roomId] - 1);
      }
    }
  });

  socket.on('disconnect', () => {
    console.log(`[해제] 소켓 ID: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`✅ 다케어 Socket.IO 서버 실행 중: 포트 ${PORT}`);
});
