import React, { useEffect, useState, useCallback } from 'react'; // Adicionado useCallback
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'; // Adicionado ActivityIndicator
import { LinearGradient } from 'expo-linear-gradient';
import { Entypo } from '@expo/vector-icons'; 
import { useNavigation, useFocusEffect } from '@react-navigation/native'; // Adicionado useFocusEffect
import { auth, db } from '../config/firebase'; // Adicionado db para Firestore
import { doc, getDoc } from 'firebase/firestore'; // Adicionado getDoc para buscar o documento

export default function ProfileScreen() {
  const navigation = useNavigation(); 
  const [userData, setUserData] = useState(null); // Renomeado para maior clareza
  const [loading, setLoading] = useState(true); // Novo estado de carregamento

  // useFocusEffect é executado toda vez que a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      const fetchUserData = async () => {
        setLoading(true);
        const user = auth.currentUser;
        
        if (user) {
          // Dados base do Firebase Auth (para email, data de criação, etc.)
          let finalUserData = {
            email: user.email,
            photoURL: user.photoURL,
            creationTime: user.metadata.creationTime,
            name: user.displayName || 'Não informado', // Fallback inicial
          };

          // Agora, busca os dados mais recentes do Firestore (onde o nome é atualizado)
          const userDocRef = doc(db, 'users', user.uid);
          try {
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists()) {
              // Se o documento existe no Firestore, usa os dados de lá, pois são mais atuais
              const firestoreData = docSnap.data();
              finalUserData.name = firestoreData.name || finalUserData.name; // Prioriza o nome do Firestore
              finalUserData.photoURL = firestoreData.photoURL || finalUserData.photoURL; // Prioriza a foto do Firestore
            }
          } catch (error) {
            console.error("Erro ao buscar dados do perfil no Firestore:", error);
          }
          
          setUserData(finalUserData);
        } else {
          setUserData(null);
        }
        setLoading(false);
      };

      fetchUserData();
    }, [])
  );

  const handleEditProfile = () => {
    navigation.navigate('EditProfile'); 
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigation.navigate('Login'); // Redireciona para a tela de login após logout
      console.log('Usuário saiu com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      Alert.alert('Erro', 'Não foi possível desconectar. Tente novamente.');
    }
  };

  // Exibe o indicador de carregamento enquanto os dados são buscados
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B5323" />
      </View>
    );
  }

  // Exibe mensagem se, após o carregamento, não houver dados do usuário
  if (!userData) {
    return (
      <View style={styles.container}>
        <Text>Não foi possível carregar os dados do usuário.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#3B5323', '#A9BA9D']}
        style={styles.header}
      >
        {/* Ícone de menu para abrir o drawer */}
        <TouchableOpacity 
          onPress={() => navigation.openDrawer()}
          style={styles.menuButton}
          activeOpacity={0.7}
        >
          <Entypo name="menu" size={28} color="white" />
        </TouchableOpacity>

        <Image
          source={
            userData.photoURL 
              ? { uri: userData.photoURL } 
              : require('../assets/default-avatar.png') 
          }
          style={styles.avatar}
        />
        <Text style={styles.name}>{userData.name || 'Usuário'}</Text>
        <Text style={styles.email}>{userData.email}</Text>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Informações</Text>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Nome:</Text>
          <Text style={styles.infoText}>{userData.name || 'Não informado'}</Text>

          <Text style={styles.infoLabel}>E-mail:</Text>
          <Text style={styles.infoText}>{userData.email}</Text>

          <Text style={styles.infoLabel}>Conta criada em:</Text>
          <Text style={styles.infoText}>
            {new Date(userData.creationTime).toLocaleDateString('pt-BR')}
          </Text>
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
  loadingContainer: { 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingTop: 60, // Aumentado para dar espaço ao botão de menu
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    position: 'relative', 
  },
  menuButton: {
    position: 'absolute',
    top: 40,  
    left: 20,  
    padding: 5,
    zIndex: 10,
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
    backgroundColor: '#A9BA9D', // Cor alterada para diferenciar do botão de editar
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});