import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { auth, db } from '../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile, updateEmail } from 'firebase/auth';


const validationSchema = Yup.object().shape({
  name: Yup.string().required('Informe o nome'),
 
});

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const [currentUser, setCurrentUser] = useState(null);
  const [initialFormValues, setInitialFormValues] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Carregar dados do usuário ao montar a tela
  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      const user = auth.currentUser;
      if (user) {
        setCurrentUser(user);
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        let firestoreName = user.displayName || '';
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          firestoreName = userData.name || firestoreName;
        }
        
        setInitialFormValues({
          name: firestoreName,
          email: user.email || '', 
        });

      } else {
        Alert.alert("Erro", "Usuário não encontrado. Faça login novamente.");
        navigation.goBack();
      }
      setLoading(false);
    };
    loadUserData();
  }, []);

  // Função chamada ao enviar o formulário
  const handleSave = async (values) => {
    if (!currentUser) return;
    setSaving(true);

    try {
      // Atualizar displayName no Firebase Auth
      if (values.name !== currentUser.displayName) {
        await updateProfile(currentUser, {
          displayName: values.name,
        });
      }

      // Atualizar 'name' no Firestore
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        name: values.name,
      });
      

      Alert.alert('Perfil Atualizado', 'Suas informações foram salvas com sucesso!');
      navigation.goBack();

    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#3B5323" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient colors={['#3B5323', '#A9BA9D']} style={styles.gradientHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Editar Perfil</Text>
      </LinearGradient>

      <Formik
        initialValues={initialFormValues}
        validationSchema={validationSchema}
        onSubmit={handleSave}
        enableReinitialize 
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View style={styles.form}>
            {/* Campo Nome */}
            <Text style={styles.label}>Nome</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome"
              onChangeText={handleChange('name')}
              onBlur={handleBlur('name')}
              value={values.name}
            />
            {touched.name && errors.name && (
              <Text style={styles.errorText}>{errors.name}</Text>
            )}

            {/* Campo E-mail (Somente Leitura) */}
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={values.email}
              editable={false}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            {/* Botão Salvar */}
            <TouchableOpacity 
                style={[styles.button, saving && styles.buttonDisabled]} 
                onPress={handleSubmit}
                disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Salvar</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </Formik>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientHeader: {
    paddingTop: Platform.OS === 'android' ? 40 : 50,
    paddingBottom: 25,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 15,
    top: Platform.OS === 'android' ? 45 : 55,
    padding: 5,
    zIndex: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Montserrat_700Bold',
  },
  form: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
    marginTop: 20, 
  },
  label: {
    fontSize: 16,
    color: '#3B5323',
    marginTop: 15,
    marginBottom: 8,
    fontFamily: 'Montserrat_400Regular',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 16,
    borderColor: '#CCC',
    borderWidth: 1,
    color: '#333',
  },
  inputDisabled: {
    backgroundColor: '#f0f0f0',
    color: '#888',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
  button: {
    backgroundColor: '#3B5323',
    marginTop: 30,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#A9BA9D',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Montserrat_700Bold', 
  },
});