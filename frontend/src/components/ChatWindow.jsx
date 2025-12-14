import { useState, useEffect, useRef, useCallback } from 'react';
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

const ChatWindow = ({ conversation }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const { state } = useAuth();

  // 1. Resolve current user id (Safety check added)
  const currentUserId = state.user?.id || state.user?._id || localStorage.getItem('userId');

  // Helper: Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Helper: Check if message belongs to current user
  const isCurrentUserMessage = (message) => {
    const senderId = message.sender?._id || message.sender;
    return String(senderId) === String(currentUserId);
  };

  // Helper: safely get other participant
  const getOtherParticipant = () => {
    if (!conversation?.participants) return null;
    return conversation.participants.find(
      p => String(p._id) !== String(currentUserId)
    );
  };

  const handleNewMessage = useCallback((message) => {
    setMessages((prev) => {
      // Prevent duplicates
      if (prev.some(m => m._id === message._id)) return prev;
      return [...prev, message];
    });
  }, []);

  // Load messages and listeners
  useEffect(() => {
    if (!conversation?._id) return;

    const initChat = async () => {
      try {
        setLoading(true);
        const response = await chatService.getMessages(conversation._id);
        setMessages(response.data);
        socketService.joinRoom(conversation._id);
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setLoading(false);
      }
    };

    initChat();
    socketService.onNewMessage(handleNewMessage);
    
    return () => {
      socketService.leaveRoom(conversation._id);
      socketService.offNewMessage(handleNewMessage);
    };
  }, [conversation, handleNewMessage]);

  // --- FIXED SEND FUNCTION ---
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    // Fix 1: Robustly find the recipient
    const otherParticipant = getOtherParticipant();

    // Fix 2: Safety Check - if we can't find who to send to, stop here.
    if (!otherParticipant) {
      console.error("Cannot send message: Recipient not found in participants list.");
      return; 
    }

    try {
      setSending(true);
      
      const payload = {
        conversationId: conversation._id,
        sender: currentUserId,
        receiver: otherParticipant._id, // This is where it was crashing
        text: newMessage
      };

      // Debug log to confirm data is correct before sending
      // console.log('Sending payload:', payload);

      socketService.sendMessage(
        payload.conversationId, 
        payload.sender, 
        payload.receiver, 
        payload.text
      );
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  if (!conversation) {
    return (
      <Box sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'textSecondary',
        height: '100%',
        backgroundColor: '#f5f5f5'
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
      height: '100%'
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
          <Typography variant="h6">{otherParticipant?.name || 'Unknown User'}</Typography>
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
                  key={message._id || Math.random()}
                  sx={{
                    display: 'flex',
                    justifyContent: isCurrent ? 'flex-end' : 'flex-start',
                    mb: 1
                  }}
                >
                  <Paper
                    sx={{
                      maxWidth: '70%',
                      p: 1.5,
                      backgroundColor: isCurrent ? '#1976d2' : 'white',
                      color: isCurrent ? 'white' : 'text.primary',
                      borderRadius: 2
                    }}
                    elevation={1}
                  >
                    <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                      {message.text}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        mt: 0.5,
                        opacity: 0.8,
                        textAlign: 'right',
                        fontSize: '0.7rem'
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
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
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