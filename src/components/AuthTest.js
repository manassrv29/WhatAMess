import React from 'react';
import { useAuth } from '../utils/AuthContext';
import { useWebSocket } from '../hooks/UseWebSocket';
import { Paper, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';

const AuthTest = () => {
  const { currentUser } = useAuth();
  const { socket, messages, isConnected, socketId } = useWebSocket();

  return (
    <div style={{ padding: '20px' }}>
      <Paper elevation={3} style={{ padding: '20px', marginBottom: '20px' }}>
        <Typography variant="h5" gutterBottom>
          Authentication Status
        </Typography>
        {currentUser ? (
          <>
            <Typography>Logged in as: {currentUser.email}</Typography>
            <Typography>User ID: {currentUser.uid}</Typography>
          </>
        ) : (
          <Typography>Not logged in</Typography>
        )}
      </Paper>

      <Paper elevation={3} style={{ padding: '20px', marginBottom: '20px' }}>
        <Typography variant="h5" gutterBottom>
          WebSocket Status
        </Typography>
        <Typography>Connected: {isConnected ? 'Yes' : 'No'}</Typography>
        <Typography>Socket ID: {socketId || 'Not connected'}</Typography>
      </Paper>

      <Paper elevation={3} style={{ padding: '20px' }}>
        <Typography variant="h5" gutterBottom>
          Messages
        </Typography>
        <List>
          {messages.map((message, index) => (
            <React.Fragment key={index}>
              <ListItem>
                <ListItemText
                  primary={message.type}
                  secondary={JSON.stringify(message.data)}
                />
              </ListItem>
              {index < messages.length - 1 && <Divider />}
            </React.Fragment>
          ))}
          {messages.length === 0 && (
            <ListItem>
              <ListItemText primary="No messages received" />
            </ListItem>
          )}
        </List>
      </Paper>
    </div>
  );
};

export default AuthTest; 