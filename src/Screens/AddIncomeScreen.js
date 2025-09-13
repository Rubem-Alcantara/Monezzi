import React, { useState } from 'react'; 
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { auth, db } from '../config/firebase'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; 

// Esquema de validação com Yup
const IncomeSchema = Yup.object().shape({
  description: Yup.string().required('Descrição obrigatória'),
  amount: Yup.number().typeError('Informe um valor numérico').positive('Valor deve ser positivo').required('Valor obrigatório'),
  category: Yup.string().required('Categoria obrigatória'),
});

export default function AddIncomeScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false); 

  const handleAddIncome = async (values) => {
    setLoading(true); 
    const user = auth.currentUser; 

    if (!user) { // Verifica se há um usuário logado
      Alert.alert('Erro', 'Nenhum usuário logado. Por favor, faça login novamente.');
      setLoading(false);
      return;
    }

    try {
      // Criando uma referência para a subcoleção 'transactions' do usuário logado
      const transactionsCollectionRef = collection(db, 'users', user.uid, 'transactions');

      // Adiciona um novo documento (transação) à subcoleção
      await addDoc(transactionsCollectionRef, {
        description: values.description,
        amount: values.amount,
        type: 'income',
        category: values.category,
        date: serverTimestamp(), // Usando data e hora do servidor para deinir data exata da transação
        userId: user.uid, 
      });

      console.log('Receita adicionada com sucesso ao Firestore!');
      Alert.alert('Sucesso', 'Receita salva com sucesso!');
      navigation.goBack(); 

    } catch (error) {
      console.error('Erro ao adicionar receita:', error);
      Alert.alert('Erro', 'Não foi possível adicionar a receita. Tente novamente.');
    } finally {
      setLoading(false); 
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Botão de voltar */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          disabled={loading}
        >
          <MaterialIcons name="arrow-back" size={24} color="#3B5323" />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Adicionar Renda</Text>

        {/* Formulário com Formik */}
        <Formik
          initialValues={{ description: '', amount: '', category: '' }} 
          validationSchema={IncomeSchema}
          onSubmit={handleAddIncome}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <View>
              <TextInput
                style={styles.input}
                placeholder="Descrição"
                onChangeText={handleChange('description')}
                onBlur={handleBlur('description')}
                value={values.description}
                editable={!loading} 
              />
              {touched.description && errors.description && (
                <Text style={styles.errorText}>{errors.description}</Text>
              )}

              <TextInput
                style={styles.input}
                placeholder="Valor"
                keyboardType="numeric"
                onChangeText={handleChange('amount')} 
                onBlur={handleBlur('amount')} 
                value={values.amount} 
                editable={!loading}
              />
              {touched.amount && errors.amount && ( 
                <Text style={styles.errorText}>{errors.amount}</Text> 
              )}

              <TextInput
                style={styles.input}
                placeholder="Categoria"
                onChangeText={handleChange('category')}
                onBlur={handleBlur('category')}
                value={values.category}
                editable={!loading} 
              />
              {touched.category && errors.category && (
                <Text style={styles.errorText}>{errors.category}</Text>
              )}

              <TouchableOpacity 
                style={styles.button} 
                onPress={handleSubmit}
                disabled={loading} 
              >
                {loading ? ( 
                  <ActivityIndicator color="white" /> 
                ) : (
                  <Text style={styles.buttonText}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </Formik>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    paddingHorizontal: 20,
  },
  content: {
    paddingTop: 10,
    flexGrow: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  backText: {
    color: '#3B5323',
    fontSize: 16,
    marginLeft: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B5323',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    fontSize: 16,
    borderColor: '#ccc',
    borderWidth: 1,
    alignSelf: 'center',
    width: '90%',
  },
  errorText: {
    color: '#D8000C',
    fontSize: 14,
    marginBottom: 10,
    marginLeft: '5%',
  },
  button: {
    backgroundColor: '#3B5323',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    width: '80%',
    alignSelf: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});