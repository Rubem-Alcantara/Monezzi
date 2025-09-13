import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../Screens/LoginScreen';
import RegisterScreen from '../Screens/RegisterScreen';

const Stack = createNativeStackNavigator();

// Stack para exibir telas de login e cadastro apenas quando o usuário não estiver autenticado
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
