import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import { connectWebSocket } from '../utils/websocket';
import * as ScreenOrientation from 'expo-screen-orientation';

interface GameState {
  score1: number;
  score2: number;
  pset1: number;
  pset2: number;
  roomId: string;
  isAdmin: boolean;
  player1: string;
  player2: string;
}

export default function CreateRoom() {
  const [isEditingPlayer1, setIsEditingPlayer1] = useState(false);
  const [isEditingPlayer2, setIsEditingPlayer2] = useState(false);
  const [editedPlayer1, setEditedPlayer1] = useState('');
  const [editedPlayer2, setEditedPlayer2] = useState('');
  const [roomKey, setRoomKey] = useState('');
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    score1: 0,
    score2: 0,
    pset1: 0,
    pset2: 0,
    roomId: '',
    isAdmin: false,
    player1: '',
    player2: ''
  });
  const [showScores, setShowScores] = useState(false);

  const updateGameState = (state: Partial<GameState>) => {
    setGameState(prev => ({
      ...prev,
      ...state
    }));
  };

  const checkWinningCondition = (score1: number, score2: number): boolean => {
    if ((score1 >= 21 || score2 >= 21) && Math.abs(score1 - score2) >= 2) {
      return true;
    }
    if (score1 === 30 || score2 === 30) {
      return true;
    }
    return false;
  };

  const updateScore = (player: number, increment: number) => {
    if (!gameState.isAdmin) return;
  
    setGameState(prev => {
      const newState = { ...prev };
      const scoreKey = player === 1 ? 'score1' : 'score2';
      const otherScoreKey = player === 1 ? 'score2' : 'score1';
      const setKey = player === 1 ? 'pset1' : 'pset2';
  
      newState[scoreKey] = Math.max(0, prev[scoreKey] + increment);
  
      if (checkWinningCondition(newState[scoreKey], newState[otherScoreKey])) {
        newState[setKey] = prev[setKey] + 1;
        newState.score1 = 0;
        newState.score2 = 0;
        Alert.alert('Set Complete', `${player === 1 ? prev.player1 : prev.player2} wins the set!`);
      }
  
      ws?.send(JSON.stringify({
        type: 'update_score',
        roomId: newState.roomId,
        score1: newState.score1,
        score2: newState.score2,
        pset1: newState.pset1,
        pset2: newState.pset2,
        player1: newState.player1,
        player2: newState.player2
      }));
  
      return newState;
    });
  };
  const reverseBtn = () => {
      if (!gameState.isAdmin) return;
      
      setGameState(prev => ({
        ...prev,
        player1: prev.player2,
        player2: prev.player1,
        score1: prev.score2,
        score2: prev.score1,
        pset1: prev.pset2,
        pset2: prev.pset1
      }));
    };
  const resetScores = () => {
    if (!gameState.isAdmin) return;

    const newState = {
      ...gameState,
      score1: 0,
      score2: 0,
      pset1: 0,
      pset2: 0
    };

    setGameState(newState);
    ws?.send(JSON.stringify({
      type: 'update_score',
      roomId: newState.roomId,
      ...newState
    }));
  };

  const handleEditPlayer = (playerNumber: number) => {
    if (!gameState.isAdmin) return;
    
    if (playerNumber === 1) {
      setEditedPlayer1(gameState.player1);
      setIsEditingPlayer1(true);
    } else {
      setEditedPlayer2(gameState.player2);
      setIsEditingPlayer2(true);
    }
  };

  const handleSavePlayerName = (playerNumber: number) => {
    if (!gameState.isAdmin) return;

    const newName = playerNumber === 1 ? editedPlayer1 : editedPlayer2;
    if (!newName.trim()) return;

    ws?.send(JSON.stringify({
      type: 'update_player',
      roomId: gameState.roomId,
      playerNumber,
      playerName: newName
    }));

    if (playerNumber === 1) {
      setIsEditingPlayer1(false);
    } else {
      setIsEditingPlayer2(false);
    }
  };
  const toggleOrientation = async () => {
    try {
      const currentOrientation = await ScreenOrientation.getOrientationAsync();
      if (currentOrientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT || 
          currentOrientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT) {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
      } else {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      }
    } catch (error) {
      console.error('Error changing orientation:', error);
    }
  };
  const handleCreateRoom = () => {
    const trimmedRoomKey = roomKey.trim();
    const trimmedPlayer1 = player1.trim();
    const trimmedPlayer2 = player2.trim();

    if (!trimmedRoomKey || !trimmedPlayer1 || !trimmedPlayer2) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (trimmedRoomKey.length > 10) {
      Alert.alert('Error', 'Room key must be 10 characters or less');
      return;
    }

    const newState = {
      ...gameState,
      roomId: trimmedRoomKey,
      player1: trimmedPlayer1,
      player2: trimmedPlayer2,
      score1: 0,
      score2: 0,
      pset1: 0,
      pset2: 0
    };
    setGameState(newState);
    setShowScores(true);

    ws?.send(JSON.stringify({
      type: 'create_room',
      roomId: trimmedRoomKey,
      player1: trimmedPlayer1,
      player2: trimmedPlayer2
    }));
  };

  useEffect(() => {
    const websocket = connectWebSocket();
    setWs(websocket);

    websocket.onopen = () => {
      console.log('WebSocket connection established');
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      Alert.alert('Connection Error', 'Unable to connect to the server');
    };

    websocket.onclose = (event) => {
      console.log('WebSocket connection closed:', event);
      Alert.alert('Disconnected', 'Connection to the server was lost');
    };

    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('Received:', message);

      switch(message.type) {
        case 'error':
          Alert.alert('Error', message.error);
          break;
        case 'client_info':
          if (message.isAdmin) {
            setGameState(prev => ({ ...prev, isAdmin: true }));
            setShowScores(true);
          }
          break;
        case 'room_state':
          setGameState(prev => ({
            ...prev,
            score1: message.score1 ?? prev.score1, // Use existing score if not provided
            score2: message.score2 ?? prev.score2,
            pset1: message.pset1 ?? prev.pset1,
            pset2: message.pset2 ?? prev.pset2,
            player1: message.player1 || prev.player1,
            player2: message.player2 || prev.player2,
            roomId: message.roomId || prev.roomId,
          }));
          break;
      }
    };

    return () => {
      if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.close();
      }
    };
  }, []);

  const PlayerSection = ({ playerNumber, name, score, sets }: {
    playerNumber: number;
    name: string;
    score: number;
    sets: number;
  }) => (
    <View style={styles.playerSection}>
      <TouchableOpacity onPress={() => handleEditPlayer(playerNumber)} style={styles.playerNameContainer}>
        {(playerNumber === 1 ? isEditingPlayer1 : isEditingPlayer2) ? (
          <View style={styles.editNameContainer}>
            <TextInput
              style={styles.editNameInput}
              value={playerNumber === 1 ? editedPlayer1 : editedPlayer2}
              onChangeText={playerNumber === 1 ? setEditedPlayer1 : setEditedPlayer2}
              autoFocus
            />
            <TouchableOpacity 
              style={styles.saveNameButton}
              onPress={() => handleSavePlayerName(playerNumber)}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.playerName}>{name}</Text>
        )}
      </TouchableOpacity>
      <View style={styles.scoreBox}>
        <Text style={styles.scoreText}>{score}</Text>
      </View>
      <Text style={styles.setText}>Sets: {sets}</Text>
      <View style={styles.buttonGroup}>
        <TouchableOpacity 
          style={styles.scoreButton} 
          onPress={() => updateScore(playerNumber, 1)}
        >
          <Text style={styles.buttonText}>+1</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.scoreButton, styles.minusButton]} 
          onPress={() => updateScore(playerNumber, -1)}
        >
          <Text style={styles.buttonText}>-1</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (showScores) {
    return (
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TouchableOpacity 
          style={styles.orientationButton}
          onPress={toggleOrientation}
        >
          <Text style={styles.orientationButtonText}>⟳</Text>
        </TouchableOpacity>
        {/* <Text style={styles.roomId}>Room: {gameState.roomId}</Text> */}
        <View style={styles.scoreContainer}>
          <PlayerSection 
            playerNumber={1}
            name={gameState.player1}
            score={gameState.score1}
            sets={gameState.pset1}
          />
          <TouchableOpacity 
            style={styles.reverseButton}
            onPress={reverseBtn}
          >
            <Text style={styles.reverseButtonText}>⇄</Text>
          </TouchableOpacity>
          <PlayerSection 
            playerNumber={2}
            name={gameState.player2}
            score={gameState.score2}
            sets={gameState.pset2}
          />
        </View>
        <TouchableOpacity 
          style={styles.resetButton} 
          onPress={resetScores}
        >
          <Text style={styles.buttonText}>Reset Scores</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Room</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Room Key (max 10 chars)"
        placeholderTextColor="#666"
        value={roomKey}
        onChangeText={setRoomKey}
        maxLength={10}
      />
      <TextInput
        style={styles.input}
        placeholder="Player 1 Name"
        placeholderTextColor="#666"
        value={player1}
        onChangeText={setPlayer1}
      />
      <TextInput
        style={styles.input}
        placeholder="Player 2 Name"
        placeholderTextColor="#666"
        value={player2}
        onChangeText={setPlayer2}
      />
      <TouchableOpacity 
        style={styles.createButton}
        onPress={handleCreateRoom}
      >
        <Text style={styles.buttonText}>Create Room</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // #840f6f #25292e
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    color: '#ffffff',
    marginBottom: 30,
    fontWeight: 'bold',
  },
  roomId: {
    fontSize: 20,
    color: '#ffffff',
    marginBottom: 20,
    marginTop: 20,
  },
  input: {
    width: '100%',
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  createButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  playerSection: {
    backgroundColor: '#000000', // #840f6f #34495e
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    width: '45%',
  },
  playerName: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  scoreBox: {
    backgroundColor: '#840f6f',
    width: 100,
    height: 100,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  scoreText: {
    fontSize: 48,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  setText: {
    fontSize: 18,
    color: '#ffffff',
    marginVertical: 10,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  scoreButton: {
    backgroundColor: '#2ecc71',
    padding: 10,
    borderRadius: 8,
    width: 50,
    alignItems: 'center',
  },
  minusButton: {
    backgroundColor: '#e74c3c',
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#000000',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center', // Add this
    minHeight: '100%', // Add this
  },
  
  resetButton: {
    backgroundColor: '#c0392b',
    padding: 15,
    borderRadius: 10,
    width: '50%',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 20,
    // position: 'absolute',
    bottom: 20,
    // marginLeft:'20%'
    
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  playerNameContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  editNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  editNameInput: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 5,
    width: 150,
    fontSize: 16,
    color: '#000',
  },
  saveNameButton: {
    backgroundColor: '#27ae60',
    padding: 8,
    borderRadius: 5,
  },
  reverseButton: {
      backgroundColor: '#3498db',
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
    },
  reverseButtonText: {
      color: '#ffffff',
      fontSize: 24,
      fontWeight: 'bold',
    },
  orientationButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: '#840f6f',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    elevation: 5,
  },
  orientationButtonText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    transform: [{ rotate: '90deg' }],
  },
});