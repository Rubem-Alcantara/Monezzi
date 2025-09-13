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
  ScrollView
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { auth, db } from '../config/firebase';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';

const validateForm = (values) => {
  const errors = {};
  if (!values.description) errors.description = 'Descrição é obrigatória';
  if (!values.amount || isNaN(parseFloat(values.amount)) || parseFloat(values.amount) <= 0) {
    errors.amount = 'Valor inválido';
  }
  if (!values.type) errors.type = 'Tipo é obrigatório';
  if (!values.category || values.category === "") errors.category = 'Categoria é obrigatória'; 
  if (!values.date) errors.date = 'Data é obrigatória';
  return errors;
};


export default function EditTransactionScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { transaction } = route.params; 

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense'); 
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false); 
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const exampleCategories = [
    "Alimentação", "Transporte", "Lazer", "Moradia", "Saúde", "Educação", "Salário", "Investimentos", "Outros"
  ];


  useEffect(() => {
    if (transaction) {
      setDescription(transaction.description || '');
      setAmount(transaction.amount ? String(transaction.amount) : '');
      setType(transaction.type || 'expense');
      setCategory(transaction.category || '');
      setDate(transaction.date instanceof Date ? transaction.date : transaction.date?.toDate() || new Date());
    }
  }, [transaction]);

  const handleUpdateTransaction = async () => {
    const formValues = { description, amount, type, category, date };
    const validationErrors = validateForm(formValues);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Erro", "Usuário não autenticado.");
      return;
    }

    setIsLoading(true);
    try {
      const transactionDocRef = doc(db, 'users', user.uid, 'transactions', transaction.id);

      const updatedData = {
        description,
        amount: parseFloat(amount),
        type,
        category,
        date: Timestamp.fromDate(date), 
        updatedAt: Timestamp.now(), 
      };

      await updateDoc(transactionDocRef, updatedData);

      Alert.alert("Sucesso", "Transação atualizada!");
      navigation.goBack();

    } catch (error) {
      console.error("Erro ao atualizar transação: ", error);
      Alert.alert("Erro", "Não foi possível atualizar a transação.");
    } finally {
      setIsLoading(false);
    }
  };

  // Função para o DatePicker
  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
    if (Platform.OS !== 'ios') { 
        setShowDatePicker(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <LinearGradient colors={['#3B5323', '#A9BA9D']} style={styles.headerGradient}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>Editar Transação</Text>
        </LinearGradient>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Almoço, Salário"
            value={description}
            onChangeText={setDescription}
          />
          {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}

          <Text style={styles.label}>Valor (R$)</Text>
          <TextInput
            style={styles.input}
            placeholder="0,00"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
          {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}

          {/* Seletor de tipo com PICKER */}
          <Text style={styles.label}>Tipo</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={type}
              onValueChange={(itemValue) => setType(itemValue)}
              style={styles.picker}
              dropdownIconColor="#3B5323"
            >
              <Picker.Item label="Despesa" value="expense" />
              <Picker.Item label="Receita" value="income" />
            </Picker>
          </View>
          {errors.type && <Text style={styles.errorText}>{errors.type}</Text>}

          {/* Seletor de categoria com PICKER */}
          <Text style={styles.label}>Categoria</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={category}
              onValueChange={(itemValue) => setCategory(itemValue)}
              style={styles.picker}
              dropdownIconColor="#3B5323"
              prompt="Selecione uma categoria"
            >
              <Picker.Item label="Selecione uma categoria..." value="" />
              {exampleCategories.map(cat => (
                <Picker.Item key={cat} label={cat} value={cat} />
              ))}
            </Picker>
          </View>
          {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}

          {/* Seletor de data com DATE TIME PICKER */}
          <Text style={styles.label}>Data</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateInputTouchable}>
            <Text style={styles.dateInputText}>{date.toLocaleDateString('pt-BR')}</Text>
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={date}
              mode="date"
              display="default" 
              onChange={onChangeDate}
            />
          )}
          {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}


          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleUpdateTransaction}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Salvar Alterações</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'android' ? 40 : 50,
    paddingBottom: 25,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
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
  formContainer: {
    padding: 20,
    flexGrow: 1,
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
    marginBottom: 5,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
  },

  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    borderColor: '#CCC',
    borderWidth: 1,
    marginBottom: 5,
  },
  picker: {
    width: '100%',
    height: Platform.OS === 'ios' ? 150 : 50, 
    color: '#333',

  },
  // ESTILOS PARA O SELETOR DE DATA
  dateInputTouchable: { 
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    borderColor: '#CCC',
    borderWidth: 1,
    marginBottom: 5,
  },
  dateInputText: {
    fontSize: 16,
    color: '#333',
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    marginHorizontal: 5,
  },
  typeButtonActive: {
    backgroundColor: '#3B5323',
    borderColor: '#3B5323',
  },
  typeButtonText: {
    fontSize: 16,
    color: '#3B5323',
    fontFamily: 'Montserrat_400Regular',
  },
  typeButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#3B5323',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
  },
  saveButtonDisabled: {
    backgroundColor: '#A9BA9D',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Montserrat_700Bold',
  },
});