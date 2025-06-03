// src/navigation/AppStack.js

import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { MaterialIcons } from '@expo/vector-icons';

// Pilhas de navegação internas (cada uma com um Stack Navigator próprio)
import HomeStack from './HomeStack';
import ProfileStack from './ProfileStack';

// Drawer customizado com avatar e botão de logout
import CustomDrawerContent from '../customDrawerContent';

const Drawer = createDrawerNavigator();

// Stack com o Drawer principal do app, visível apenas após login
export default function AppStack() {
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
      {/* Tela Home */}
      <Drawer.Screen
        name="Início"
        component={HomeStack}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />

      {/* Tela de Perfil */}
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
