import { Text, View, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Badminton Score</Text>
      
      <View style={styles.buttonContainer}>
        <Link href="/score" asChild>
          <View style={styles.button}>
            <Text style={styles.buttonText}>Score</Text>
          </View>
        </Link>

        <Link href="/toss" asChild>
          <View style={styles.button}>
            <Text style={styles.buttonText}>Toss</Text>
          </View>
        </Link>

        <Link href="/create-room" asChild>
          <View style={styles.button}>
            <Text style={styles.buttonText}>Create Room</Text>
          </View>
        </Link>

        <Link href="/join-room" asChild>
          <View style={styles.button}>
            <Text style={styles.buttonText}>Join Room</Text>
          </View>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    color: '#fff',
    marginBottom: 40,
    fontWeight: 'bold',
  },
  buttonContainer: {
    width: '80%',
    gap: 20,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});