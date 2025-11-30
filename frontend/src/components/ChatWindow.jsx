import { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
  Avatar,
  CircularProgress
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { chatService, socketService } from '../services';
import { useAuth } from '../contexts/AuthContext';

// eslint-disable-next-line react/prop-types
const ChatWindow = ({ conversation }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const { state } = useAuth();

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await chatService.getMessages(conversation._id);
      console.log('ChatWindow.loadMessages() response:', response.data?.length, 'messages for conversation', conversation._id);
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load messages when conversation changes
  useEffect(() => {
    if (conversation) {
      loadMessages();
      socketService.joinRoom(conversation._id);
      socketService.onNewMessage(handleNewMessage);
      
      return () => {
        socketService.leaveRoom(conversation._id);
        socketService.offNewMessage(handleNewMessage);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation]);

  // resolve current user id (from auth state or fallback to localStorage)
  const currentUserId = state.user?.id || localStorage.getItem('userId');

  const handleNewMessage = (message) => {
    console.log('ChatWindow.handleNewMessage():', message);
    setMessages(prev => [...prev, message]);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    const otherParticipant = conversation.participants.find(
      p => p._id !== currentUserId
    );

    try {
      setSending(true);
      const payload = {
        conversationId: conversation._id,
        sender: currentUserId,
        receiver: otherParticipant._id,
        text: newMessage
      };
      console.log('ChatWindow.handleSendMessage() emitting payload:', payload);
      socketService.sendMessage(payload.conversationId, payload.sender, payload.receiver, payload.text);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const getOtherParticipant = () => {
    return conversation?.participants?.find(p => p._id !== currentUserId);
  };

  const isCurrentUserMessage = (message) => {
    return message.sender._id === currentUserId;
  };

  if (!conversation) {
    return (
      <Box sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'textSecondary'
      }}>
        <Typography>Select a conversation to start messaging</Typography>
      </Box>
    );
  }

  const otherParticipant = getOtherParticipant();

  return (
    <Box sx={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#f5f5f5',
      borderRadius: 1
    }}>
      {/* Header */}
      <Box sx={{
        p: 2,
        backgroundColor: 'white',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <Avatar
          alt={otherParticipant?.name}
          src={otherParticipant?.avatar}
        >
          {otherParticipant?.name?.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6">{otherParticipant?.name}</Typography>
          {conversation.product && (
            <Typography variant="caption" color="textSecondary">
              About: {conversation.product.name}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Messages Area */}
      <Box sx={{
        flex: 1,
        overflowY: 'auto',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <CircularProgress />
          </Box>
        ) : messages.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <Typography color="textSecondary">No messages yet. Start the conversation!</Typography>
          </Box>
        ) : (
          <>
            {messages.map((message) => {
              const isCurrent = isCurrentUserMessage(message);
              return (
                <Box
                  key={message._id}
                  sx={{
                    display: 'flex',
                    justifyContent: isCurrent ? 'flex-end' : 'flex-start',
                    mb: 1
                  }}
                >
                  <Paper
                    sx={{
                      maxWidth: '60%',
                      p: 1.5,
                      backgroundColor: isCurrent ? '#1976d2' : 'white',
                      color: isCurrent ? 'white' : 'inherit'
                    }}
                  >
                    <Typography variant="body2">{message.text}</Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        mt: 0.5,
                        opacity: 0.7
                      }}
                    >
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                  </Paper>
                </Box>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </Box>

      {/* Input Area */}
      <Box sx={{
        p: 2,
        backgroundColor: 'white',
        borderTop: '1px solid #e0e0e0'
      }}>
        <Box
          component="form"
          onSubmit={handleSendMessage}
          sx={{
            display: 'flex',
            gap: 1,
            alignItems: 'flex-end'
          }}
        >
          <IconButton size="small" disabled={sending}>
            <AttachFileIcon />
          </IconButton>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={sending}
            size="small"
          />
          <Button
            type="submit"
            variant="contained"
            endIcon={<SendIcon />}
            disabled={sending || !newMessage.trim()}
          >
            Send
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatWindow;
