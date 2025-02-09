import { Text, View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Link, useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();

  const handleNavigation = (route: string) => {
    try {
      router.push(route);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/images/icon.png')}
        style={styles.logo}
      />
      <Text style={styles.title}>Badminton Score</Text>
      
      <View style={styles.buttonContainer}>
        <Link href="/score" asChild>
          <TouchableOpacity 
            style={styles.button}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Score</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/toss" asChild>
          <TouchableOpacity 
            style={styles.button}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Toss</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/create-room" asChild>
          <TouchableOpacity 
            style={styles.button}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Create Room</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/join-room" asChild>
          <TouchableOpacity 
            style={styles.button}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Join Room</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    color: '#840f6f',
    marginBottom: 40,
    fontWeight: 'bold',
  },
  buttonContainer: {
    width: '80%',
    gap: 20,
  },
  button: {
    backgroundColor: '#840f6f',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    resizeMode: 'contain',
  },
});
