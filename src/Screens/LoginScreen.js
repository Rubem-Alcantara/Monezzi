// src/screens/LoginScreen.js

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useNavigation } from '@react-navigation/native';

import { auth } from '../config/firebase'; // Importa a instância de autenticação do Firebase
// Importa a função signInWithEmailAndPassword da API modular
import { signInWithEmailAndPassword } from 'firebase/auth'; // <--- CORREÇÃO AQUI

// Definindo as regras de validação com Yup
const LoginSchema = Yup.object().shape({
  email: Yup.string().email('E-mail inválido').required('Campo obrigatório'),
  password: Yup.string().min(6, 'Mínimo 6 caracteres').required('Campo obrigatório'),
});

export default function LoginScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values) => { 
    setLoading(true);
    try {
      // Usa a função signInWithEmailAndPassword da API modular
      await signInWithEmailAndPassword(auth, values.email, values.password); // <--- CORREÇÃO AQUI
      
      console.log('Login realizado com sucesso!');

    } catch (error) {
      console.error('Erro de login:', error.code, error.message);
      let errorMessage = 'Ocorreu um erro ao tentar fazer login.';
      if (error.code === 'auth/invalid-email') {
        errorMessage = 'E-mail inválido.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'Usuário desativado.';
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'E-mail ou senha inválidos.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Muitas tentativas de login. Tente novamente mais tarde.';
      }
      Alert.alert('Erro no Login', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Entrar</Text>

      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={LoginSchema}
        onSubmit={handleLogin}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <>
            <TextInput
              style={styles.input}
              placeholder="E-mail"
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              value={values.email}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
            {touched.email && errors.email && <Text style={styles.error}>{errors.email}</Text>}

            <TextInput
              style={styles.input}
              placeholder="Senha"
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              value={values.password}
              secureTextEntry
              editable={!loading}
            />
            {touched.password && errors.password && <Text style={styles.error}>{errors.password}</Text>}

            <TouchableOpacity 
              style={styles.button} 
              onPress={handleSubmit} 
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Entrar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => navigation.navigate('Registro')}
              disabled={loading}
            >
              <Text style={styles.linkText}>Não tem conta? Registre-se</Text>
            </TouchableOpacity>
          </>
        )}
      </Formik>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 20, 
    backgroundColor: '#f7f7f7' 
},

  title: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    marginBottom: 30, 
    textAlign: 'center', 
    color: '#3B5323' 
},

  input: { 
    backgroundColor: '#fff', 
    borderRadius: 10, 
    padding: 15, 
    marginBottom: 10, 
    borderColor: '#ccc', 
    borderWidth: 1 
},

  button: { 
    backgroundColor: '#3B5323', 
    padding: 15, 
    borderRadius: 10, 
    alignItems: 'center' 
},

  buttonText: { 
    color: 'white', 
    fontWeight: 'bold' 
},

  linkText: { 
    marginTop: 20, 
    color: '#3B5323', 
    textAlign: 'center' 
},

  error: { 
    color: 'red', 
    fontSize: 12, 
    marginBottom: 5 
},
});