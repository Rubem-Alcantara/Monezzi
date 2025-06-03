// src/screens/HomeScreen.js

import React, { useState, useEffect } from 'react';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions, StyleSheet, Text, View, Image, TouchableOpacity, ActivityIndicator, Alert, FlatList } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Entypo from '@expo/vector-icons/Entypo';
import { useFonts, Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { useNavigation } from '@react-navigation/native';

import { auth, db } from '../config/firebase';
import { collection, query, where, orderBy, onSnapshot, doc } from 'firebase/firestore';
import { MaterialIcons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

export default function Home() {
  const navigation = useNavigation();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [userData, setUserData] = useState(null);
  const [chartData, setChartData] = useState([]);

  let [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      console.log('Nenhum usuário logado na HomeScreen.');
      setTransactions([]);
      setBalance(0);
      setUserData(null);
      setChartData([]); 
      setLoading(false);
      return;
    }

    const usersCollectionRef = collection(db, 'users');
    const userDocRef = doc(usersCollectionRef, user.uid);

    const unsubscribeUser = onSnapshot(userDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        setUserData(docSnapshot.data());
      } else {
        console.log("Dados do usuário não encontrados no Firestore!");
        setUserData(null);
      }
    }, (error) => {
      console.error("Erro ao carregar dados do usuário:", error);
    });

    const transactionsCollectionRef = collection(db, 'users', user.uid, 'transactions');
    const q = query(transactionsCollectionRef, orderBy('date', 'desc'));

    const unsubscribeTransactions = onSnapshot(q, (snapshot) => {
      const fetchedTransactions = [];
      let currentBalance = 0;
      const categoriesSummary = {};

      snapshot.forEach((docItem) => {
        const data = docItem.data();
        const amountAsNumber = parseFloat(data.amount);

        if (isNaN(amountAsNumber)) {
          console.warn(`Transação com valor inválido ignorada: ${data.amount}`);
          return;
        }

        fetchedTransactions.push({
          id: docItem.id,
          ...data,
          amount: amountAsNumber,
          date: data.date && data.date.toDate ? data.date.toDate() : new Date(), // Garantindo que a data seja um objeto Date
        });

        if (data.type === 'income') {
          currentBalance += amountAsNumber;
        } else if (data.type === 'expense') {
          currentBalance -= amountAsNumber;
          const categoryName = data.category || 'Outros';
          categoriesSummary[categoryName] = (categoriesSummary[categoryName] || 0) + amountAsNumber;
        }
      });

      setTransactions(fetchedTransactions);
      setBalance(currentBalance);

      const chartColors = ['#A9BA9D', '#3B5323', '#6B8E23', '#8FBC8F', '#556B2F', '#CD853F', '#D2B48C', '#90EE90'];
      const newChartData = Object.keys(categoriesSummary).map((category, index) => ({
        name: category,
        population: categoriesSummary[category],
        color: chartColors[index % chartColors.length],
        legendFontColor: '#3B5323',
        legendFontSize: 14,
      }));
      setChartData(newChartData);

      setLoading(false);
    }, (error) => {
      console.error('Erro ao buscar transações:', error);
      setLoading(false);
      Alert.alert('Erro', 'Não foi possível carregar as transações.');
    });

    return () => {
      unsubscribeUser();
      unsubscribeTransactions();
    };
  }, []); 

  const renderTransactionItem = ({ item }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionLeft}>
        <Text style={styles.transactionDescription} numberOfLines={1} ellipsizeMode="tail">{item.description}</Text>
        <Text style={styles.transactionCategory}>{item.category || 'Sem categoria'}</Text>
        <Text style={styles.transactionDate}>{item.date.toLocaleDateString()}</Text>
      </View>
      <Text style={[
        styles.transactionAmount,
        item.type === 'income' ? styles.incomeAmount : styles.expenseAmount
      ]}>
        {item.type === 'expense' ? '- ' : '+ '}R$ {item.amount !== undefined && !isNaN(Number(item.amount)) ? Number(item.amount).toFixed(2) : '0.00'}
      </Text>
    </View>
  );

  if (!fontsLoaded || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B5323" />
        <Text style={styles.loadingText}>Carregando dados...</Text>
      </View>
    );
  }

  const ListHeader = () => (
    <View style={styles.listHeaderContent}>
      <LinearGradient colors={['#3B5323', '#A9BA9D']} style={styles.headerGradient}>
        <View style={styles.row1}>
          <TouchableOpacity
            onPress={() => navigation.openDrawer()}
            style={styles.menuButton}
            activeOpacity={0.7}
          >
            <Entypo name="menu" size={28} color="white" />
          </TouchableOpacity>

          <Image
            style={styles.imgProfile}
            source={userData && userData.photoURL ? { uri: userData.photoURL } : { uri: 'https://avatars.githubusercontent.com/u/1024101?v=4' }} // Placeholder
          />
        </View>
        <Text style={styles.txtWelcome}>Bem vindo(a), {'\n'}{userData ? userData.name : 'Usuário'}!</Text>
      </LinearGradient>

      <View style={styles.resumoSaldo}>
        <Text style={styles.saldoLabel}>
          Seu saldo total
        </Text>
        <Text style={styles.saldoValor}>
          R$ {balance !== undefined && !isNaN(balance) ? balance.toFixed(2).replace('.',',') : '0,00'}
        </Text>
      </View>

      <View style={styles.AddNewEntry}>
        <LinearGradient colors={['#3B5323', '#A9BA9D']} style={styles.EntryGradient}>
          <Text style={styles.entryTitle}>O que deseja fazer?</Text>
          <View style={styles.entryButtonsContainer}>
            <TouchableOpacity
              style={styles.entryButton} // Usando entryButton para Receita
              onPress={() => navigation.navigate('AddIncome')}
            >
              <MaterialIcons name="add" size={20} color="white" />
              <Text style={styles.actionButtonText}>Receita</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton} // Usando actionButton (similar, mas pode ter cor diferente) para Despesa
              onPress={() => navigation.navigate('AddExpense')}
            >
              <MaterialIcons name="remove" size={20} color="white" />
              <Text style={styles.actionButtonText}>Despesa</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>
          Gastos por categoria
        </Text>
        {chartData.length > 0 ? (
          <PieChart
            data={chartData}
            width={screenWidth * 0.9} 
            height={180} 
            chartConfig={{
              color: (opacity = 1) => `rgba(59, 83, 35, ${opacity})`, 
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, 
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15" 
            absolute 
            hasLegend={true} 
          />
        ) : (
          <Text style={styles.noChartDataText}>Nenhum gasto registrado para o gráfico.</Text>
        )}
      </View>

      <Text style={styles.transactionsTitle}>Histórico de Transações</Text>
      {transactions.length === 0 && !loading && (
        <Text style={styles.noTransactionsText}>Nenhuma transação registrada ainda.</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#3B5323" /> 
      <FlatList
        data={transactions}
        renderItem={renderTransactionItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.flatListContentContainer}
        ListFooterComponent={<View style={{ height: 100 }} />} 
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={21}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
  },
  loadingText: { 
    marginTop: 10,
    color: '#3B5323',
    fontFamily: 'Montserrat_400Regular',
  },
  listHeaderContent: {
    alignItems: 'center',
    paddingBottom: 20, 
    width: '100%', 
  },
  flatListContentContainer: { 
    paddingBottom: 40, 
  },
  headerGradient: {
    width: '100%', 
  
    minHeight: 200, 
    paddingHorizontal: 20,
    paddingTop: 20, 
    paddingBottom: 20, 
    borderBottomLeftRadius: 70,
    borderBottomRightRadius: 70,
  },
  row1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 20, 
  },
  menuButton: {
    padding: 8,
    
  },
  imgProfile: {
    width: 50,
    height: 50,
    borderRadius: 25, 
    borderWidth: 1, 
    borderColor: 'white', 
  },
  txtWelcome: {
    color: 'white',
    fontSize: 20,
    marginLeft: '10%', 
    fontFamily: 'Montserrat_700Bold', 
    marginTop: 10, 
  },
  resumoSaldo: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginTop: -25, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'center', 
  },
  saldoLabel: { 
    color: '#3B5323',
    fontSize: 18,
    fontFamily: 'Montserrat_400Regular',
  },
  saldoValor: { 
    color: '#3B5323',
    fontSize: 30,
    fontFamily: 'Montserrat_700Bold',
    marginTop: 5,
  },
  AddNewEntry: {
    width: '80%',
    marginTop: 30,
    borderRadius: 20,
    overflow: 'hidden', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  EntryGradient: {
    width: '100%',
    //height: '100%',
    borderRadius: 20, 
    paddingHorizontal: 15, 
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center', 
  },
  entryTitle: {
    color: 'white',
    fontFamily: 'Montserrat_400Regular',
    fontSize: 18,
    marginBottom: 15, 
    textAlign: 'center',
  },
  entryButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%', 
    gap: 10, 
  },
  entryButton: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff33', 
    paddingVertical: 10,
    paddingHorizontal: 10, 
    borderRadius: 10,
    height: 50, 
    gap: 8, 
  },
  actionButton: { 
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff55', 
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    height: 50,
    gap: 8,
  },
  actionButtonText: {
    color: 'white',
    fontFamily: 'Montserrat_700Bold',
    fontSize: 16,
  },
  chartContainer: { 
    width: '90%', 
    marginTop: 30,
    alignItems: 'center', 
    paddingVertical: 15,
    backgroundColor: '#FFFFFF', 
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  chartTitle: { 
    fontSize: 18,
    color: '#3B5323',
    fontFamily: 'Montserrat_700Bold',
    marginBottom: 10,
  },
  noChartDataText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
    paddingHorizontal: 10, // Para não tocar nas bordas do card
  },
  transactionsTitle: {
    fontSize: 20,
    // fontWeight: 'bold', // Já incluso na fontFamily
    color: '#3B5323',
    marginBottom: 15,
    marginTop: 30,
    fontFamily: 'Montserrat_700Bold',
    textAlign: 'center', // Centraliza o texto
  },
  transactionItem: {
    width: '90%', // Para os itens ocuparem 90% da largura e serem centralizados
    alignSelf: 'center', // Garante a centralização do item na FlatList
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionLeft: {
    flex: 1, // Permite que a descrição cresça mas não empurre o valor para fora
    marginRight: 10, // Espaço antes do valor
  },
  transactionDescription: {
    fontSize: 16,
    // fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Montserrat_700Bold',
    marginBottom: 2,
  },
  transactionCategory: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Montserrat_400Regular',
  },
  transactionAmount: {
    fontSize: 17, // Levemente ajustado
    // fontWeight: 'bold',
    fontFamily: 'Montserrat_700Bold',
  },
  incomeAmount: {
    color: '#28a745', // Verde para receita
  },
  expenseAmount: {
    color: '#dc3545', // Vermelho para despesa
  },
  noTransactionsText: {
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20, // Adicionado para dar espaço
    fontSize: 16,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
  },
});