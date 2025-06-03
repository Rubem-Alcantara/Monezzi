// src/navigation/AuthStack.js

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Telas de login e cadastro
import LoginScreen from '../Screens/LoginScreen';
import RegisterScreen from '../Screens/RegisterScreen';

const Stack = createNativeStackNavigator();

// Stack que agrupa as telas públicas, exibidas apenas quando o usuário NÃO está autenticado
export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Tela de login */}
      <Stack.Screen name="Login" component={LoginScreen} />
      
      {/* Tela de registro (cadastro de novo usuário) */}
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}
