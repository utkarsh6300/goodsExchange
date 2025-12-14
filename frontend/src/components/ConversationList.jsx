import { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Box,
  Divider,
  Avatar,
  Chip
} from '@mui/material';
import { chatService } from '../services';
import { useAuth } from '../contexts/AuthContext';

// eslint-disable-next-line react/prop-types
const ConversationList = ({ onSelectConversation, selectedConversationId }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { state } = useAuth();

  const currentUserId = state.user?.id || localStorage.getItem('userId');

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await chatService.getConversations();
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = (conversation) => {
    onSelectConversation(conversation);
  };

  const getOtherParticipant = (conversation) => {
    if (!conversation.participants || conversation.participants.length < 2) return null;
    return conversation.participants.find(p => p._id !== currentUserId);
  };

  const formatLastMessage = (conversation) => {
    if (!conversation.lastMessage) return 'No messages yet';
    return conversation.lastMessage.length > 50 
      ? conversation.lastMessage.substring(0, 50) + '...' 
      : conversation.lastMessage;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return diffInMinutes === 0 ? 'now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return Math.floor(diffInHours) + 'h ago';
    } else if (diffInHours < 168) {
      return Math.floor(diffInHours / 24) + 'd ago';
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="textSecondary">
          Loading conversations...
        </Typography>
      </Box>
    );
  }

  if (conversations.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="textSecondary">
          No conversations yet. Start by contacting a seller!
        </Typography>
      </Box>
    );
  }

  return (
    <List sx={{ width: '100%', height: '100%', overflowY: 'auto' }}>
      {conversations.map((conversation, index) => {
        const otherParticipant = getOtherParticipant(conversation);
        const isSelected = selectedConversationId === conversation._id;

        return (
          <Box key={conversation._id}>
            <ListItem
              disablePadding
              sx={{
                backgroundColor: isSelected ? '#f5f5f5' : 'transparent',
                borderLeft: isSelected ? '4px solid #1976d2' : 'none'
              }}
            >
              <ListItemButton onClick={() => handleSelectConversation(conversation)}>
                <Avatar
                  sx={{ mr: 2 }}
                  alt={otherParticipant?.name}
                  src={otherParticipant?.avatar}
                >
                  {otherParticipant?.name?.charAt(0).toUpperCase()}
                </Avatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography
                        component="span"
                        variant="subtitle2"
                        sx={{ fontWeight: isSelected ? 600 : 500 }}
                      >
                        {otherParticipant?.name}
                      </Typography>
                      <Typography
                        component="span"
                        variant="caption"
                        color="textSecondary"
                      >
                        {formatTime(conversation.lastMessageTimestamp)}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box
                      component="span"
                      sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, width: '100%' }}
                    >
                      <Typography
                        component="span"
                        variant="body2"
                        color="textSecondary"
                        sx={{ flex: 1, minWidth: 0 }}
                      >
                        {formatLastMessage(conversation)}
                      </Typography>
                      {conversation.product && (
                        <Box component="span" sx={{ flexShrink: 0, display: 'inline-flex' }}>
                          <Chip
                            label={conversation.product.name}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      )}
                    </Box>
                  }
                  secondaryTypographyProps={{ component: 'span' }}
                />
              </ListItemButton>
            </ListItem>
            {index < conversations.length - 1 && <Divider />}
          </Box>
        );
      })}
    </List>
  );
};

export default ConversationList;
