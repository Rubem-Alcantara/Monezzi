import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { MaterialIcons } from '@expo/vector-icons';
import { auth } from '../config/firebase'; 

export default function CustomDrawerContent(props) {

  const handleLogout = async () => {
    try {
      await auth.signOut();
      console.log('Usuário deslogado com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      Alert.alert('Erro', 'Não foi possível desconectar. Tente novamente.');
    }
  };

  const currentUser = auth.currentUser;
  const displayName = currentUser ? currentUser.displayName : 'Usuário';
  const userEmail = currentUser ? currentUser.email : '';
  const userAvatar = currentUser && currentUser.photoURL 
    ? { uri: currentUser.photoURL } 
    : { uri: 'https://avatars.githubusercontent.com/u/1024101?v=4' };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      <View style={styles.header}>
        <Image
          source={userAvatar}
          style={styles.avatar}
        />
        <Text style={styles.username}>{displayName || 'Usuário'}</Text>
        {userEmail ? <Text style={styles.userEmail}>{userEmail}</Text> : null}
      </View>

      <View style={styles.menu}>
        <DrawerItemList {...props} />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          onPress={handleLogout}
          style={styles.logoutBtn}
        >
          <MaterialIcons name="logout" size={22} color="#3B5323" />
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#A9BA9D',
    padding: 20,
    alignItems: 'center',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 10,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3B5323',
  },
  userEmail: {
    fontSize: 12,
    color: '#3B5323',
    opacity: 0.8,
  },
  menu: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 10,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#3B5323',
  },
});