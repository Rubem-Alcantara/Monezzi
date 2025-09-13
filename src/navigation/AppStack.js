import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { MaterialIcons } from '@expo/vector-icons';

import HomeStack from './HomeStack';
import ProfileStack from './ProfileStack';
import CustomDrawerContent from '../components/customDrawerContent';

const Drawer = createDrawerNavigator();

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
        drawerItemStyle: { 
          marginVertical: 4, 
          marginHorizontal: 10, 
          borderRadius: 12, 
        },
        drawerLabelStyle: {
          marginLeft: -10,
          fontSize: 16,
        },
        drawerIconStyle: { 
          marginLeft: 10,
          marginRight: 5,
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
