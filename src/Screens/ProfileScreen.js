import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Entypo from '@expo/vector-icons/Entypo'; // Importa o ícone do menu
import { useNavigation } from '@react-navigation/native'; // Importa o hook de navegação

export default function ProfileScreen() {
  const navigation = useNavigation(); // Obtém o objeto de navegação

  function handleEditProfile() {
    navigation.navigate('EditProfile'); // Navega para a tela de edição de perfil
  }

  function handleLogout() {
    Alert.alert(
      'Logout',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', onPress: () => console.log('Usuário saiu') }
      ]
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#3B5323', '#A9BA9D']}
        style={styles.header}
      >
        {/* Botão para abrir o drawer */}
        <TouchableOpacity 
          onPress={() => navigation.openDrawer()}
          style={styles.menuButton}
          activeOpacity={0.7}
        >
          <Entypo name="menu" size={28} color="white" />
        </TouchableOpacity>

        <Image
          source={{ uri: 'https://avatars.githubusercontent.com/u/1024101?v=4' }}
          style={styles.avatar}
        />
        <Text style={styles.name}>Usuário</Text>
        <Text style={styles.email}>usuario@usuario.com</Text>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Informações</Text>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Nome:</Text>
          <Text style={styles.infoText}>Usuário</Text>

          <Text style={styles.infoLabel}>E-mail:</Text>
          <Text style={styles.infoText}>usuario@usuario.com</Text>

          <Text style={styles.infoLabel}>Conta criada em:</Text>
          <Text style={styles.infoText}>01/01/2024</Text>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Text style={styles.buttonText}>Editar Perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.buttonText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    position: 'relative', // permite posicionar o botão de menu
  },
  menuButton: {
    position: 'absolute',
    top: 40,   // ajuste conforme necessário para alinhar verticalmente
    left: 20,  // alinhado à esquerda
    padding: 5,
    zIndex: 10, // garante que fique acima da imagem e textos
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: '#fff',
    marginBottom: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  email: {
    color: '#fff',
    fontSize: 14,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B5323',
    marginBottom: 10,
  },
  infoBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    elevation: 3,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3B5323',
    marginTop: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
  },
  buttonsContainer: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  editButton: {
    backgroundColor: '#3B5323',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  logoutButton: {
    backgroundColor: '#A9BA9D',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
