import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import connectDB from './db';
import globalRouter from './global-router';
import { logger } from './logger';
import { authMiddleware } from './middlewares/auth-middleware';
import UserModel, { IUser } from './auth/models/User';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;

connectDB();

app.use(logger);
app.use(express.json());
app.use('/api/v1/', globalRouter);

app.get('/helloworld', (request, response) => {
  response.send("Hello World!");
});

io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  const user = await authMiddleware(token);
  if (user) {
    socket.data.user = user;
    next();
  } else {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  const user = socket.data.user as IUser;
  console.log('a user connected', user);

  socket.broadcast.emit('online', { userId: user._id, online: true });

  socket.on('message', ({ to, message }) => {
    io.to(to).emit('message', {
      from: user._id,
      message
    });
  });

  socket.on('typing', ({ to, typing }) => {
    io.to(to).emit('typing', {
      from: user._id,
      typing
    });
  });

  socket.on('disconnect', () => {
    io.emit('offline', { userId: user._id });
    console.log('user disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server runs at http://localhost:${PORT}`);
});
