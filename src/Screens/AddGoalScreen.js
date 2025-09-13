import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; 
import DateTimePicker from '@react-native-community/datetimepicker';

import { auth, db } from '../config/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

// Validação simples
const validateGoal = (name, targetAmount) => {
  if (!name.trim()) {
    Alert.alert('Erro', 'O nome da meta é obrigatório.');
    return false;
  }
  if (isNaN(parseFloat(targetAmount)) || parseFloat(targetAmount) <= 0) {
    Alert.alert('Erro', 'O valor alvo deve ser um número positivo.');
    return false;
  }
  return true;
};

export default function AddGoalScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0'); 
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState(null); 
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddGoal = async () => {
    if (!validateGoal(name, targetAmount)) return;

    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Erro", "Usuário não autenticado.");
      return;
    }

    setIsLoading(true);
    try {
      const goalsCollectionRef = collection(db, 'users', user.uid, 'goals');
      await addDoc(goalsCollectionRef, {
        name: name.trim(),
        targetAmount: parseFloat(targetAmount),
        currentAmount: parseFloat(currentAmount) || 0,
        description: description.trim(),
        targetDate: targetDate ? Timestamp.fromDate(targetDate) : null,
        createdAt: Timestamp.now(),
        isAchieved: (parseFloat(currentAmount) || 0) >= parseFloat(targetAmount),
      });

      Alert.alert("Sucesso!", "Nova meta adicionada.");
      navigation.goBack();

    } catch (error) {
      console.error("Erro ao adicionar meta: ", error);
      Alert.alert("Erro", "Não foi possível adicionar a meta.");
    } finally {
      setIsLoading(false);
    }
  };

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setTargetDate(selectedDate);
    }
     if (Platform.OS !== 'ios') { 
        setShowDatePicker(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContentContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#3B5323" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Adicionar Nova Meta</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Nome da Meta</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Viagem de Férias"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Valor Alvo (R$)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 5000,00"
          keyboardType="numeric"
          value={targetAmount}
          onChangeText={setTargetAmount}
        />

        <Text style={styles.label}>Valor Atual (R$) (Opcional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 100,00 (quanto já guardou)"
          keyboardType="numeric"
          value={currentAmount}
          onChangeText={setCurrentAmount}
        />
        
        <Text style={styles.label}>Data Alvo (Opcional)</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateInputTouchable}>
          <Text style={styles.dateInputText}>
            {targetDate ? targetDate.toLocaleDateString('pt-BR') : "Selecione uma data"}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={targetDate || new Date()} // usa data atual como padrao no picker
            mode="date"
            display="default"
            onChange={onChangeDate}
            minimumDate={new Date()} //não permitir datas passadas
          />
        )}

        <Text style={styles.label}>Descrição (Opcional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Mais detalhes sobre sua meta..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleAddGoal}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Salvar Meta</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 45 : 55,
    paddingBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#f7f7f7',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B5323',
    fontFamily: 'Montserrat_700Bold',
  },
  formContainer: {
    padding: 20,
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
  textArea: {
    height: 80,
    textAlignVertical: 'top', // Para Android
  },
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