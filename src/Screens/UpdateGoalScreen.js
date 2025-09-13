import React, { useState, useEffect } from 'react';
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
import { useNavigation, useRoute } from '@react-navigation/native'; 
import { Ionicons, MaterialIcons } from '@expo/vector-icons'; 
import DateTimePicker from '@react-native-community/datetimepicker';

import { auth, db } from '../config/firebase';
import { doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore'; 

export default function UpdateGoalScreen() {
  const navigation = useNavigation();
  const route = useRoute(); 
  const { goal } = route.params; 

  const [name, setName] = useState(goal.name || '');
  const [targetAmount, setTargetAmount] = useState(String(goal.targetAmount) || '');
  const [currentAmount, setCurrentAmount] = useState(String(goal.currentAmount) || '0');
  const [description, setDescription] = useState(goal.description || '');
  const [targetDate, setTargetDate] = useState(goal.targetDate || null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateGoal = (name, targetAmount) => {
    if (!name.trim()) {
      Alert.alert('Erro', 'O nome da meta é obrigatório.');
      return false;
    }
    if (isNaN(parseFloat(targetAmount)) || parseFloat(targetAmount) <= 0) {
      Alert.alert('Erro', 'O valor alvo deve ser um número positivo.');
      return false;
    }
    if (isNaN(parseFloat(currentAmount))) {
        Alert.alert('Erro', 'O valor atual deve ser um número.');
        return false;
    }
    return true;
  };

  // Função para lidar com a atualização da meta
  const handleUpdateGoal = async () => {
    if (!validateGoal(name, targetAmount)) return;

    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Erro", "Usuário não autenticado.");
      return;
    }

    setIsLoading(true);
    try {
      const goalDocRef = doc(db, 'users', user.uid, 'goals', goal.id);
      
      const newCurrentAmount = parseFloat(currentAmount) || 0;
      const newTargetAmount = parseFloat(targetAmount);

      await updateDoc(goalDocRef, {
        name: name.trim(),
        targetAmount: newTargetAmount,
        currentAmount: newCurrentAmount,
        description: description.trim(),
        targetDate: targetDate ? Timestamp.fromDate(targetDate) : null,
        isAchieved: newCurrentAmount >= newTargetAmount, // Recalcula se a meta foi alcançada
        updatedAt: Timestamp.now(),
      });

      Alert.alert("Sucesso!", "Meta atualizada com sucesso.");
      navigation.goBack(); 

    } catch (error) {
      console.error("Erro ao atualizar meta: ", error);
      Alert.alert("Erro", "Não foi possível atualizar a meta.");
    } finally {
      setIsLoading(false);
    }
  };

  // Função para tratar a exclusão da meta
  const handleDeleteGoal = () => {
    Alert.alert(
      "Confirmar Exclusão",
      `Tem certeza que deseja excluir a meta "${goal.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          onPress: async () => {
            setIsLoading(true);
            try {
              const user = auth.currentUser;
              if (!user) {
                Alert.alert("Erro", "Usuário não autenticado.");
                setIsLoading(false);
                return;
              }
              const goalDocRef = doc(db, 'users', user.uid, 'goals', goal.id);
              await deleteDoc(goalDocRef);

              Alert.alert("Sucesso!", "Meta excluída com sucesso.");
              navigation.goBack(); 

            } catch (error) {
              console.error("Erro ao excluir meta: ", error);
              Alert.alert("Erro", "Não foi possível excluir a meta.");
            } finally {
              setIsLoading(false);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const onChangeDate = (event, selectedDate) => {

    setShowDatePicker(Platform.OS === 'ios'); 
    if (selectedDate) {
      setTargetDate(selectedDate);
    }
    if (Platform.OS !== 'ios' && event.type === 'set') { 
        setShowDatePicker(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContentContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#3B5323" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Meta</Text>
        {/* Botão de lixeira para excluir a meta */}
        <TouchableOpacity onPress={handleDeleteGoal} style={styles.deleteButton}>
          <MaterialIcons name="delete" size={28} color="#dc3545" />
        </TouchableOpacity>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Nome da Meta</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Viagem de Férias"
          value={name}
          onChangeText={setName}
          editable={!isLoading}
        />

        <Text style={styles.label}>Valor Alvo (R$)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 5000,00"
          keyboardType="numeric"
          value={targetAmount}
          onChangeText={setTargetAmount}
          editable={!isLoading}
        />

        <Text style={styles.label}>Valor Atual (R$)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 100,00 (quanto já guardou)"
          keyboardType="numeric"
          value={currentAmount}
          onChangeText={setCurrentAmount}
          editable={!isLoading}
        />
        
        <Text style={styles.label}>Data Alvo (Opcional)</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateInputTouchable} disabled={isLoading}>
          <Text style={styles.dateInputText}>
            {targetDate ? targetDate.toLocaleDateString('pt-BR') : "Selecione uma data"}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={targetDate || new Date()}
            mode="date"
            display="default"
            onChange={onChangeDate}
            minimumDate={new Date()}
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
          editable={!isLoading}
        />

        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleUpdateGoal}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Atualizar Meta</Text>
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
    justifyContent: 'space-between', // Para alinhar voltar e lixeira
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
  deleteButton: { 
    padding: 5,
    marginLeft: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B5323',
    flex: 1, 
    textAlign: 'center', 
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
    textAlignVertical: 'top',
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