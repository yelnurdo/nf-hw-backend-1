import React, { useState, useEffect } from 'react';
import io, { Socket } from 'socket.io-client';

interface IMessage {
  from: string;
  message: string;
}

interface ITyping {
  from: string;
  typing: boolean;
}

interface IUserStatus {
  userId: string;
  online: boolean;
}

const socket: Socket = io('http://localhost:3000', {
  auth: {
    token: 'your_jwt_token_here' // Replace with the actual JWT token
  }
});

const ChatApp: React.FC = () => {
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [onlineUsers, setOnlineUsers] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    socket.on('message', ({ from, message }: IMessage) => {
      setMessages(prev => [...prev, { from, message }]);
    });

    socket.on('typing', ({ from, typing }: ITyping) => {
      setIsTyping(typing);
    });

    socket.on('online', ({ userId, online }: IUserStatus) => {
      setOnlineUsers(prev => ({ ...prev, [userId]: online }));
    });

    socket.on('offline', ({ userId }: { userId: string }) => {
      setOnlineUsers(prev => ({ ...prev, [userId]: false }));
    });

    return () => {
      socket.off('message');
      socket.off('typing');
      socket.off('online');
      socket.off('offline');
    };
  }, []);

  const sendMessage = async () => {
    socket.emit('message', { to: 'receiver_user_id', message });
    setMessages(prev => [...prev, { from: 'me', message }]);
    setMessage('');
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    socket.emit('typing', { to: 'receiver_user_id', typing: true });
  };

  return (
    <div>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.from}: </strong>{msg.message}
          </div>
        ))}
      </div>
      {isTyping && <p>User is typing...</p>}
      <input
        type="text"
        value={message}
        onChange={handleTyping}
        onBlur={() => socket.emit('typing', { to: 'receiver_user_id', typing: false })}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default ChatApp;
