import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { auth, db } from '../config/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { MaterialIcons } from '@expo/vector-icons'; 

const ProgressBar = ({ current, target }) => {
  const progress = target > 0 ? (current / target) * 100 : 0;
  const displayProgress = Math.min(Math.max(progress, 0), 100); 

  return (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBarFill, { width: `${displayProgress}%` }]} />
    </View>
  );
};

export default function GoalsScreen() {
  const navigation = useNavigation();
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      const user = auth.currentUser;
      if (!user) {
        setGoals([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const goalsCollectionRef = collection(db, 'users', user.uid, 'goals');
      const q = query(goalsCollectionRef, orderBy('createdAt', 'desc')); 

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedGoals = snapshot.docs.map(docItem => ({ 
          id: docItem.id, 
          ...docItem.data(), 
          
          targetDate: docItem.data().targetDate?.toDate(), 
          createdAt: docItem.data().createdAt?.toDate(), 
        }));
        setGoals(fetchedGoals);
        setIsLoading(false);
      }, (error) => {
        console.error("Erro ao buscar metas: ", error);
        Alert.alert("Erro", "Não foi possível carregar as metas.");
        setIsLoading(false);
      });

      return () => unsubscribe(); 
    }, [])
  );

  const renderGoalItem = ({ item }) => {
    const progressPercent = item.targetAmount > 0 ? (item.currentAmount / item.targetAmount) * 100 : 0;
    return (
      <TouchableOpacity 
        style={styles.goalItem}
        onPress={() => navigation.navigate('UpdateGoalProgress', { goal: item })} // Tela para atualizar progresso
      >
        <Text style={styles.goalName}>{item.name}</Text>
        <Text style={styles.goalAmount}>
          R$ {item.currentAmount !== undefined && !isNaN(item.currentAmount) ? item.currentAmount.toFixed(2).replace('.', ',') : '0,00'} / R$ {item.targetAmount !== undefined && !isNaN(item.targetAmount) ? item.targetAmount.toFixed(2).replace('.', ',') : '0,00'}
        </Text>
        <ProgressBar current={item.currentAmount || 0} target={item.targetAmount || 0} />
        <Text style={styles.goalProgressText}>{Math.min(progressPercent, 100).toFixed(0)}% alcançado</Text>
        {item.targetDate && (
          <Text style={styles.goalTargetDate}>
            Data Alvo: {item.targetDate.toLocaleDateString('pt-BR')}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#3B5323" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color="#3B5323" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Minhas Metas</Text>
        
        <TouchableOpacity 
          onPress={() => navigation.navigate('AddGoal')} 
          style={styles.addButton}
        >
          <MaterialIcons name="add" size={30} color="#3B5323" />
        </TouchableOpacity>
      </View>

      {goals.length === 0 ? (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Você ainda não tem nenhuma meta.</Text>
            <Text style={styles.emptySubText}>Crie sua primeira meta clicando no botão '+' acima!</Text>
        </View>
      ) : (
        <FlatList
          data={goals}
          renderItem={renderGoalItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 45 : 55,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  backButton: {
    padding: 5, 
    marginRight: 10, 
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3B5323',
   
    flex: 1, 
    textAlign: 'center', 
  },
  addButton: {
    padding: 5,
    marginLeft: 10, 
  },
  listContainer: {
    padding: 15,
  },
  goalItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  goalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B5323',
    marginBottom: 5,
    fontFamily: 'Montserrat_700Bold',
  },
  goalAmount: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
    fontFamily: 'Montserrat_400Regular',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 5,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50', // Cor do progresso
    borderRadius: 5,
  },
  goalProgressText: {
    fontSize: 12,
    color: '#777',
    textAlign: 'right',
    marginBottom: 5,
  },
  goalTargetDate: {
    fontSize: 12,
    color: '#777',
    fontStyle: 'italic',
  },
  emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
  },
  emptyText: {
      fontSize: 18,
      color: '#666',
      textAlign: 'center',
      marginBottom: 10,
    fontFamily: 'Montserrat_400Regular',
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    fontFamily: 'Montserrat_400Regular',
  }
});