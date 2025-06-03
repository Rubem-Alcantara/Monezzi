// src/App.js

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

// Importe a instância de autenticação do Firebase e onAuthStateChanged da API modular
import { auth } from './src/config/firebase'; // <--- CORREÇÃO AQUI
import { onAuthStateChanged } from 'firebase/auth'; // <--- CORREÇÃO AQUI

// Telas principais (após login)
import HomeStack from './src/navigation/HomeStack';
import ProfileStack from './src/navigation/ProfileStack';
import CustomDrawerContent from './src/components/customDrawerContent'; // Certifique-se de que o caminho está correto para o componente

// Telas de autenticação
import LoginScreen from './src/Screens/LoginScreen';
import RegisterScreen from './src/Screens/RegisterScreen';

// Navegadores
const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

// Navegação do App principal (Drawer Navigator)
function AppDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: '#3B5323',
        drawerInactiveTintColor: '#555',
        drawerStyle: {
          backgroundColor: '#F5F5F0',
        },
      }}
    >
      <Drawer.Screen
        name="Início"
        component={HomeStack}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Perfil"
        component={ProfileStack}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

// Navegação para Login e Registro (Stack Navigator para telas públicas)
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Registro" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Usa onAuthStateChanged da API modular
    const unsubscribe = onAuthStateChanged(auth, (authUser) => { // <--- CORREÇÃO AQUI
      setUser(authUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B5323" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AppDrawer /> : <AuthStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
  },
});