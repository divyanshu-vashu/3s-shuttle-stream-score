import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { connectWebSocket } from '../utils/websocket';

export default function JoinRoom() {
  const [roomKey, setRoomKey] = useState('');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomState, setRoomState] = useState<any>(null);

  useEffect(() => {
    const websocket = connectWebSocket();
    
    websocket.onopen = () => {
      setIsConnected(true);
      setWs(websocket);
    };

    websocket.onclose = () => {
      setIsConnected(false);
      setWs(null);
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      Alert.alert('Connection Error', 'Failed to connect to server');
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received message:', data); // Debug log

      if (data.type === 'room_state') {
        setRoomState(data);
        router.push({
          pathname: '/join-score',
          params: {
            roomId: data.roomId,
            player1: data.player1,
            player2: data.player2,
            score1: data.score1,
            score2: data.score2,
            pset1: data.pset1,
            pset2: data.pset2
          }
        });
      } else if (data.type === 'error') {
        Alert.alert('Error', data.error);
      }
    };

    return () => {
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.close();
      }
    };
  }, []);

  const handleJoinRoom = () => {
    if (!roomKey) {
      Alert.alert('Error', 'Please enter room key');
      return;
    }

    if (!isConnected) {
      Alert.alert('Error', 'Not connected to server');
      return;
    }

    ws?.send(JSON.stringify({
      type: 'join_room',
      roomId: roomKey
    }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Join Room</Text>
      {!isConnected && (
        <Text style={styles.connectionStatus}>Connecting to server...</Text>
      )}
      <TextInput
        style={styles.input}
        placeholder="Enter Room Key"
        placeholderTextColor="#666"
        value={roomKey}
        onChangeText={setRoomKey}
      />
      <TouchableOpacity 
        style={[styles.button, !isConnected && styles.buttonDisabled]}
        onPress={handleJoinRoom}
        disabled={!isConnected}
      >
        <Text style={styles.buttonText}>Join Room</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#840f6f',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  connectionStatus: {
    color: '#ff9900',
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});