import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { connectWebSocket } from '../utils/websocket';
import * as ScreenOrientation from 'expo-screen-orientation';

interface ScoreState {
  player1: string;
  player2: string;
  score1: number;
  score2: number;
  pset1: number;
  pset2: number;
}

export default function JoinScoreScreen() {
  const params = useLocalSearchParams();
  const [scoreState, setScoreState] = useState<ScoreState>({
    player1: params.player1 as string || 'Player 1',
    player2: params.player2 as string || 'Player 2',
    score1: Number(params.score1) || 0,
    score2: Number(params.score2) || 0,
    pset1: Number(params.pset1) || 0,
    pset2: Number(params.pset2) || 0,
  });
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    
    const websocket = connectWebSocket();
    setWs(websocket);

    websocket.onopen = () => {
      websocket.send(JSON.stringify({
        type: 'join_room',
        roomId: params.roomId
      }));
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received message:', data); // Debug log
      
      if (data.type === 'room_state') {
        setScoreState({
          player1: data.player1,
          player2: data.player2,
          score1: data.score1,
          score2: data.score2,
          pset1: data.pset1,
          pset2: data.pset2,
        });
      }
    };

    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.close();
      }
    };
  }, [params.roomId]);

  return (
    <View style={styles.container}>
      <Text style={styles.roomId}>Room: {params.roomId}</Text>
      <View style={styles.scoreContainer}>
        <View style={styles.playerSection}>
          <Text style={styles.playerName}>{scoreState.player1}</Text>
          <View style={[styles.scoreBox, styles.elevation]}>
            <Text style={styles.scoreText}>{scoreState.score1}</Text>
          </View>
          <View style={styles.setContainer}>
            <Text style={styles.setText}>Sets: {scoreState.pset1}</Text>
          </View>
        </View>

        <View style={styles.playerSection}>
          <Text style={styles.playerName}>{scoreState.player2}</Text>
          <View style={[styles.scoreBox, styles.elevation]}>
            <Text style={styles.scoreText}>{scoreState.score2}</Text>
          </View>
          <View style={styles.setContainer}>
            <Text style={styles.setText}>Sets: {scoreState.pset2}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  roomId: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  scoreContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  playerSection: {
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '45%',
  },
  playerName: {
    color: '#333',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  scoreBox: {
    width: 180,
    height: 180,
    backgroundColor: '#840f6f',//#840f6f #3498db
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    marginBottom: 15,
  },
  elevation: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  scoreText: {
    color: '#fff',
    fontSize: 86,
    fontWeight: 'bold',
  },
  setContainer: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
    width: '100%',
  },
  setText: {
    color: '#666',
    fontSize: 24,
    textAlign: 'center',
    fontWeight: '600',
  },
});