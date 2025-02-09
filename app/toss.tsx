import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing, StyleSheet, Platform } from 'react-native';

export default function TossScreen() {
  const [result, setResult] = useState('Flip the coin!');
  const [animKey, setAnimKey] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const spinValue = useRef(new Animated.Value(0)).current;

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '720deg']
  });

  const flipCoin = () => {
    // Prevent multiple clicks during animation
    if (isAnimating) return;
    
    // Clear previous result immediately when starting new flip
    setResult('');
    setIsAnimating(true);
    
    // Reset animation value
    spinValue.setValue(0);
    
    // Generate random result
    const random = Math.random();
    
    Animated.sequence([
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: Platform.OS !== 'web', // Use native driver except on web
      })
    ]).start(() => {
      setResult(random < 0.5 ? 'HEADS' : 'TAILS');
      setAnimKey(prev => prev + 1);
      setIsAnimating(false);
    });
  };

  return (
    <View style={styles.container}>
      <Animated.View 
        key={animKey} 
        style={[
          styles.coin, 
          { 
            transform: [
              { rotate: spin },
              { perspective: 1000 }
            ] 
          }
        ]}
      >
        <Text style={styles.coinText}>🪙</Text>
      </Animated.View>
      <View style={styles.resultContainer}>
        <Text style={styles.result}>{result}</Text>
      </View>
      <TouchableOpacity 
        style={[
          styles.button, 
          isAnimating && styles.buttonDisabled
        ]} 
        onPress={flipCoin}
        activeOpacity={0.7}
        disabled={isAnimating}
      >
        <Text style={styles.buttonText}>
          {isAnimating ? 'Flipping...' : 'Flip Coin'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  coin: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  coinText: {
    fontSize: 60,
  },
  resultContainer: {
    height: 30,
    justifyContent: 'center',
    marginBottom: 20,
  },
  result: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#840f6f',
    padding: 15,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#95c5f0',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});