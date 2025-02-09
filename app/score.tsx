import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Dimensions, Alert } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { MaterialIcons } from '@expo/vector-icons';

export default function ScoreScreen() {
  const [scores, setScores] = useState({ left: 0, right: 0 });
  const [sets, setSets] = useState({ left: 0, right: 0 });
  const [names, setNames] = useState({ left: 'Player 1', right: 'Player 2' });
  const [menuVisible, setMenuVisible] = useState(false);
  const [editingName, setEditingName] = useState<'left' | 'right' | null>(null);
  const [tempName, setTempName] = useState('');
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    };
  }, []);

  const checkWinningCondition = (score1: number, score2: number): boolean => {
    // Regular win condition (21 points with 2-point lead)
    if ((score1 >= 21 || score2 >= 21) && Math.abs(score1 - score2) >= 2) {
      return true;
    }
    // Maximum score rule (30 points)
    if (score1 === 30 || score2 === 30) {
      return true;
    }
    return false;
  };

  const checkMatchWinner = (sets: { left: number, right: number }) => {
    // Best of 3 sets
    if (sets.left === 2 || sets.right === 2) {
      const winner = sets.left === 2 ? names.left : names.right;
      Alert.alert('Match Complete', `${winner} wins the match!`);
      setGameOver(true);
    }
  };

  const updateScore = (side: 'left' | 'right') => {
    if (gameOver) {
      Alert.alert('Game Over', 'Please reset the game to start a new match');
      return;
    }

    setScores(prev => {
      const newScores = { ...prev, [side]: prev[side] + 1 };
      const otherSide = side === 'left' ? 'right' : 'left';
      
      // Remove deuce alert and just continue the game
      // Check if the set is won
      if (checkWinningCondition(newScores[side], newScores[otherSide])) {
        setSets(prev => {
          const newSets = { ...prev, [side]: prev[side] + 1 };
          checkMatchWinner(newSets);
          return newSets;
        });
        // Reset scores for next set
        return { left: 0, right: 0 };
      }

      return newScores;
    });
  };

  const resetGame = () => {
    setScores({ left: 0, right: 0 });
    setSets({ left: 0, right: 0 });
    setGameOver(false);
  };

  const isDeuce = (score: number) => score >= 20;

  const handleNameEdit = (side: 'left' | 'right') => {
    setTempName(names[side]);
    setEditingName(side);
  };

  const handleNameSave = () => {
    if (editingName && tempName.trim()) {
      setNames(prev => ({ ...prev, [editingName]: tempName.trim() }));
    }
    setEditingName(null);
  };

  const switchSides = () => {
    setScores(prev => ({ left: prev.right, right: prev.left }));
    setSets(prev => ({ left: prev.right, right: prev.left }));
    setNames(prev => ({ left: prev.right, right: prev.left }));
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.menuButton} onPress={() => setMenuVisible(true)}>
        <MaterialIcons name="menu" size={30} color="#fff" />
      </TouchableOpacity>

      <View style={styles.scoreContainer}>
        <View style={styles.playerSection}>
          {editingName === 'left' ? (
            <View style={styles.nameEditContainer}>
              <TextInput
                style={styles.nameInput}
                value={tempName}
                onChangeText={setTempName}
                onBlur={handleNameSave}
                autoFocus
              />
            </View>
          ) : (
            <TouchableOpacity onPress={() => handleNameEdit('left')}>
              <Text style={styles.playerName}>{names.left}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={[styles.scoreBox, isDeuce(scores.left) && styles.deuceScore]} 
            onPress={() => updateScore('left')}
          >
            <Text style={styles.scoreText}>{scores.left}</Text>
          </TouchableOpacity>
          <Text style={styles.setScore}>Sets: {sets.left}</Text>
        </View>

        <View style={styles.controlsSection}>
          <TouchableOpacity style={styles.controlButton} onPress={switchSides}>
            <MaterialIcons name="swap-horiz" size={24} color="#fff" />
            <Text style={styles.controlText}>Switch</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.controlButton, styles.resetButton]} onPress={resetGame}>
            <MaterialIcons name="refresh" size={24} color="#fff" />
            <Text style={styles.controlText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.playerSection}>
          {editingName === 'right' ? (
            <View style={styles.nameEditContainer}>
              <TextInput
                style={styles.nameInput}
                value={tempName}
                onChangeText={setTempName}
                onBlur={handleNameSave}
                autoFocus
              />
            </View>
          ) : (
            <TouchableOpacity onPress={() => handleNameEdit('right')}>
              <Text style={styles.playerName}>{names.right}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={[styles.scoreBox, isDeuce(scores.right) && styles.deuceScore]} 
            onPress={() => updateScore('right')}
          >
            <Text style={styles.scoreText}>{scores.right}</Text>
          </TouchableOpacity>
          <Text style={styles.setScore}>Sets: {sets.right}</Text>
        </View>
      </View>

      <Modal visible={menuVisible} transparent animationType="slide">
        {/* Menu Modal Content */}
        <View style={styles.modalView}>
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => {
              setScores({ left: 0, right: 0 });
              setSets({ left: 0, right: 0 });
              setMenuVisible(false);
            }}
          >
            <Text style={styles.menuText}>Reset Game</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => {
              setScores(prev => ({ left: prev.right, right: prev.left }));
              setSets(prev => ({ left: prev.right, right: prev.left }));
              setNames(prev => ({ left: prev.right, right: prev.left }));
              setMenuVisible(false);
            }}
          >
            <Text style={styles.menuText}>Switch Sides</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => {
              setEditingNames(true);
              setMenuVisible(false);
            }}
          >
            <Text style={styles.menuText}>Edit Names</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => setMenuVisible(false)}
          >
            <Text style={styles.menuText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

// Add these new styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  menuButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
  },
  scoreContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  playerSection: {
    alignItems: 'center',
  },
  playerName: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 10,
  },
  scoreBox: {
    width: 150,
    height: 150,
    backgroundColor: '#840f6f',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 10,
  },
  deuceScore: {
    backgroundColor: '#e74c3c',
  },
  scoreText: {
    color: '#fff',
    fontSize: 72,
    fontWeight: 'bold',
  },
  setScore: {
    color: '#fff',
    fontSize: 20,
  },
  modalView: {
    margin: 20,
    backgroundColor: '#34495e',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  menuItem: {
    padding: 15,
    width: '100%',
    alignItems: 'center',
  },
  menuText: {
    color: '#fff',
    fontSize: 18,
  },
  controlsSection: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 20,
  },
  controlButton: {
    backgroundColor: '#2980b9', //#840f6f #2980b9
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    width: 80,
  },
  resetButton: {
    backgroundColor: '#c0392b',
  },
  controlText: {
    color: '#fff', //#fff
    fontSize: 14,
    marginTop: 4,
  },
  nameEditContainer: {
    marginBottom: 10,
  },
  nameInput: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 5,
    width: 150,
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
  },
});