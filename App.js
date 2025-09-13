import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { auth } from './src/config/firebase'; 
import { onAuthStateChanged } from 'firebase/auth'; 
import * as Notifications from 'expo-notifications';
import HomeStack from './src/navigation/HomeStack';
import ProfileStack from './src/navigation/ProfileStack';
import CustomDrawerContent from './src/components/customDrawerContent'; 
import LoginScreen from './src/Screens/LoginScreen';
import RegisterScreen from './src/Screens/RegisterScreen';
import GoalsScreen from './src/Screens/GoalsScreen'; 
import AddGoalScreen from './src/Screens/AddGoalScreen';
import UpdateGoalScreen from './src/Screens/UpdateGoalScreen'; 
import RemindersScreen from './src/Screens/ReminderScreen'; 
import ForgotPasswordScreen from './src/Screens/ForgotPasswordScreen';


const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false, 
  }),
});

function GoalsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="GoalsList" 
        component={GoalsScreen} 
        options={{ 
          title: 'Minhas Metas',
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="AddGoal" 
        component={AddGoalScreen} 
        options={{ 
          title: 'Adicionar Nova Meta', 
          headerShown: false 
        }} 
      />
      <Stack.Screen
        name="UpdateGoalProgress" 
        component={UpdateGoalScreen}
        options={{
          title: 'Editar Meta', 
          headerShown: false 
        }}
      />
    </Stack.Navigator>
  );
}

function AppDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: '#3B5323',
        drawerInactiveTintColor: '#555',
        drawerLabelStyle: { marginLeft: -20, fontFamily: 'Montserrat_400Regular' }, 
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
      <Drawer.Screen
        name="Metas" 
        component={GoalsStack}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="flag" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Lembretes" 
        component={RemindersScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="alarm" size={size} color={color} /> 
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Registro" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => { 
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