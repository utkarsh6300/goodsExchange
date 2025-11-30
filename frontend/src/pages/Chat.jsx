import { useState, useEffect } from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import ConversationList from '../components/ConversationList';
import ChatWindow from '../components/ChatWindow';
import { socketService } from '../services';
import { useNavigate } from 'react-router-dom';

const Chat = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize socket connection
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    socketService.connect(token);

    return () => {
      // Optionally disconnect on unmount
      // socketService.disconnect();
    };
  }, [navigate]);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Messages
      </Typography>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '300px 1fr' },
        gap: 2,
        height: 'calc(100vh - 200px)'
      }}>
        {/* Conversations List */}
        <Paper sx={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          order: { xs: 2, sm: 1 }
        }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Conversations
            </Typography>
          </Box>
          <ConversationList
            onSelectConversation={handleSelectConversation}
            selectedConversationId={selectedConversation?._id}
          />
        </Paper>

        {/* Chat Window */}
        <Box sx={{
          display: 'flex',
          order: { xs: 1, sm: 2 }
        }}>
          <ChatWindow conversation={selectedConversation} />
        </Box>
      </Box>
    </Container>
  );
};

export default Chat;
