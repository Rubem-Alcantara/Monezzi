import React, { useState, useEffect } from 'react';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions, StyleSheet, Text, View, Image, TouchableOpacity, ActivityIndicator, Alert, FlatList, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Entypo from '@expo/vector-icons/Entypo';
import { useFonts, Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { useNavigation, useFocusEffect } from '@react-navigation/native'; 
import { auth, db } from '../config/firebase';
import { collection, query, where, orderBy, onSnapshot, doc, getDocs, getDoc, deleteDoc } from 'firebase/firestore'; 
import { MaterialIcons } from '@expo/vector-icons';


const screenWidth = Dimensions.get('window').width;

export default function Home() {
  const navigation = useNavigation();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingBalance, setLoadingBalance] = useState(true); 
  const [balance, setBalance] = useState(0);
  const [userData, setUserData] = useState(null);
  const [chartData, setChartData] = useState([]);

  
  const [filterType, setFilterType] = useState(null); 
  const [filterCategory, setFilterCategory] = useState(null); 
  const [availableCategories, setAvailableCategories] = useState(['Todas']);

  let [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

  
  useFocusEffect(
    React.useCallback(() => {
      const user = auth.currentUser;
      let isActive = true; 

      const fetchInitialData = async () => {
        if (!user) {
          if (isActive) {
            setUserData(null);
            setBalance(0);
            setLoadingBalance(false);
          }
          return;
        }

        if (isActive) setLoadingBalance(true);

        const userDocRef = doc(db, 'users', user.uid);
        try {
          const docSnapshot = await getDoc(userDocRef); 
          if (isActive && docSnapshot.exists()) {
            setUserData(docSnapshot.data());
          } else if (isActive) {
            setUserData({ name: user.displayName, photoURL: user.photoURL }); 
          }
        } catch (error) {
          console.error("Erro ao buscar dados do usuário:", error);
          if (isActive) setUserData({ name: user.displayName, photoURL: user.photoURL });
        }
        
        const transactionsCollectionRef = collection(db, 'users', user.uid, 'transactions');
        const allTransactionsQuery = query(transactionsCollectionRef);
        try {
          const querySnapshot = await getDocs(allTransactionsQuery);
          let totalBalance = 0;
          const categoriesSet = new Set(); 
          querySnapshot.forEach((docItem) => {
            const data = docItem.data();
            const amountAsNumber = parseFloat(data.amount);
            if (!isNaN(amountAsNumber)) {
              if (data.type === 'income') {
                totalBalance += amountAsNumber;
              } else if (data.type === 'expense') {
                totalBalance -= amountAsNumber;
              }
              if (data.category) {
                categoriesSet.add(data.category);
              }
            }
          });
          if (isActive) {
            setBalance(totalBalance);
            setAvailableCategories(['Todas', ...Array.from(categoriesSet)]);
          }
        } catch (error) {
          console.error("Erro ao calcular saldo total:", error);
          if (isActive) setBalance(0);
        }
        if (isActive) setLoadingBalance(false);
      };

      fetchInitialData();

      return () => {
        isActive = false;
      };
    }, [])
  ); 

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setTransactions([]);
      setChartData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const transactionsCollectionRef = collection(db, 'users', user.uid, 'transactions');
    const queryConstraints = [orderBy('date', 'desc')];

    if (filterType) {
      queryConstraints.push(where('type', '==', filterType));
    }
    if (filterCategory && filterCategory !== 'Todas') {
      queryConstraints.push(where('category', '==', filterCategory));
    }

    const q = query(transactionsCollectionRef, ...queryConstraints);

    const unsubscribeTransactions = onSnapshot(q, (snapshot) => {
      const fetchedTransactions = [];
      const categoriesSummary = {};

      snapshot.forEach((docItem) => {
        const data = docItem.data();
        const amountAsNumber = parseFloat(data.amount);

        if (isNaN(amountAsNumber)) return;

        fetchedTransactions.push({
          id: docItem.id,
          ...data,
          amount: amountAsNumber,
          date: data.date && data.date.toDate ? data.date.toDate() : new Date(),
        });

        if (data.type === 'expense') {
          const categoryName = data.category || 'Outros';
          categoriesSummary[categoryName] = (categoriesSummary[categoryName] || 0) + amountAsNumber;
        }
      });

      setTransactions(fetchedTransactions);

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
      console.error('Erro ao buscar transações filtradas:', error);
      setLoading(false);
      Alert.alert('Erro', 'Não foi possível carregar as transações.');
    });

    return () => unsubscribeTransactions();
  }, [auth.currentUser, filterType, filterCategory]);

   const handleDeleteTransaction = (transactionId, description) => {
    Alert.alert(
      "Confirmar Exclusão",
      `Tem certeza que deseja excluir a transação "${description}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          onPress: async () => {
            const user = auth.currentUser;
            if (!user) {
              Alert.alert("Erro", "Usuário não autenticado.");
              return;
            }
            try {
              const transactionDocRef = doc(db, 'users', user.uid, 'transactions', transactionId);
              await deleteDoc(transactionDocRef);
              console.log('Transação excluída com sucesso!');
            } catch (error) {
              console.error("Erro ao excluir transação:", error);
              Alert.alert("Erro", "Não foi possível excluir a transação.");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const renderTransactionItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.transactionItem} 
      onPress={() => navigation.navigate('EditTransaction', { transaction: item })} 
                                                                                  
    >
      <View style={styles.transactionLeft}>
        <Text style={styles.transactionDescription} numberOfLines={1} ellipsizeMode="tail">{item.description}</Text>
        <Text style={styles.transactionCategory}>{item.category || 'Sem categoria'}</Text>
        <Text style={styles.transactionDate}>{item.date.toLocaleDateString()}</Text>
      </View>
      <Text style={[
        styles.transactionAmount,
        item.type === 'income' ? styles.incomeAmount : styles.expenseAmount
      ]}>
        {item.type === 'expense' ? '- ' : '+ '}R$ {item.amount !== undefined && !isNaN(Number(item.amount)) ? Number(item.amount).toFixed(2).replace('.', ',') : '0,00'}
      </Text>
  
      <TouchableOpacity 
        onPress={() => handleDeleteTransaction(item.id, item.description)}
        style={styles.deleteTransactionButton}
      >
        <MaterialIcons name="delete" size={20} color="#dc3545" />
      </TouchableOpacity>
    </TouchableOpacity> 
  );
  

  if (!fontsLoaded || loadingBalance) {
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
            source={userData && userData.photoURL ? { uri: userData.photoURL } : require('../assets/default-avatar.png')} 
          />
        </View>
        <Text style={styles.txtWelcome}>Bem vindo(a), {'\n'}{userData ? userData.name : 'Usuário'}!</Text>
      </LinearGradient>

      <View style={styles.resumoSaldo}>
        <Text style={styles.saldoLabel}>Seu saldo total</Text>
        <Text style={styles.saldoValor}>
          R$ {balance !== undefined && !isNaN(balance) ? balance.toFixed(2).replace('.', ',') : '0,00'}
        </Text>
      </View>

      <View style={styles.AddNewEntry}>
        <LinearGradient colors={['#3B5323', '#A9BA9D']} style={styles.EntryGradient}>
          <Text style={styles.entryTitle}>O que deseja fazer?</Text>
          <View style={styles.entryButtonsContainer}>
            <TouchableOpacity style={styles.entryButton} onPress={() => navigation.navigate('AddIncome')}>
              <MaterialIcons name="add" size={20} color="white" />
              <Text style={styles.actionButtonText}>Receita</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('AddExpense')}>
              <MaterialIcons name="remove" size={20} color="white" />
              <Text style={styles.actionButtonText}>Despesa</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Gastos por categoria</Text>
        {loading ? <ActivityIndicator color="#3B5323" /> : chartData.length > 0 ? (
          <PieChart
            data={chartData}
            width={screenWidth * 0.9}
            height={180}
            chartConfig={{ color: (opacity = 1) => `rgba(59, 83, 35, ${opacity})` }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
            hasLegend={true}
          />
        ) : (
          <Text style={styles.noChartDataText}>Nenhum gasto para exibir no gráfico com os filtros atuais.</Text>
        )}
      </View>

      <View style={styles.filtersOuterContainer}>
        <View style={styles.filtersContainer}>
          <Text style={styles.filterSectionTitle}>Filtrar Transações</Text>
          <Text style={styles.filterLabel}>Por Tipo:</Text>
          <View style={styles.filterOptions}>
            <TouchableOpacity
              style={[styles.filterButton, !filterType && styles.filterButtonActive]}
              onPress={() => setFilterType(null)}>
              <Text style={[styles.filterButtonTextBase, !filterType ? styles.filterButtonTextActive : styles.filterButtonTextInactive]}>Todos</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filterType === 'income' && styles.filterButtonActive]}
              onPress={() => setFilterType('income')}>
              <Text style={[styles.filterButtonTextBase, filterType === 'income' ? styles.filterButtonTextActive : styles.filterButtonTextInactive]}>Receitas</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filterType === 'expense' && styles.filterButtonActive]}
              onPress={() => setFilterType('expense')}>
              <Text style={[styles.filterButtonTextBase, filterType === 'expense' ? styles.filterButtonTextActive : styles.filterButtonTextInactive]}>Despesas</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.filterLabel}>Por Categoria:</Text>
          <View style={styles.filterOptions}>
            {availableCategories.map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.filterButton,
                  (filterCategory === category || (!filterCategory && category === 'Todas')) && styles.filterButtonActive
                ]}
                onPress={() => setFilterCategory(category === 'Todas' ? null : category)}>
                <Text style={[
                    styles.filterButtonTextBase,
                    (filterCategory === category || (!filterCategory && category === 'Todas')) ? styles.filterButtonTextActive : styles.filterButtonTextInactive
                ]}>{category}</Text>
              </TouchableOpacity>
            ))}
              {availableCategories.length <= 1 && <Text style={styles.noCategoriesText}>Nenhuma categoria encontrada.</Text>}
          </View>
        </View>
      </View>

      <Text style={styles.transactionsTitle}>Histórico de Transações</Text>
      {loading && transactions.length === 0 && <ActivityIndicator style={{marginTop: 20}} color="#3B5323" />}
      {!loading && transactions.length === 0 && (
        <Text style={styles.noTransactionsText}>Nenhuma transação encontrada com os filtros atuais.</Text>
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
    width: '100%',
  },
  flatListContentContainer: {
    paddingBottom: 40,
  },
  headerGradient: {
    width: '100%',
    minHeight: 200,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 30 : 40, 
    paddingBottom: 20,
    borderBottomLeftRadius: 70,
    borderBottomRightRadius: 70,
  },
  row1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10, 
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
    paddingVertical: 20, 
    paddingHorizontal: 20,
    marginTop: -20,
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
    paddingHorizontal: 10, 
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
    paddingHorizontal: 10,
  },
  filtersOuterContainer: { 
    width: '100%',
    alignItems: 'center', 
    marginTop: 30,
  },
  filtersContainer: {
    width: '90%', 
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 15, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 20, 
  },
  filterSectionTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat_700Bold',
    color: '#3B5323',
    marginBottom: 15,
    textAlign: 'center',
  },
  filterLabel: {
    fontSize: 15, 
    fontFamily: 'Montserrat_700Bold', 
    color: '#444', 
    marginBottom: 8,
    marginTop: 10, 
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 5, 
  },
  filterButton: {
    paddingVertical: 6, 
    paddingHorizontal: 12, 
    backgroundColor: '#E9E9E9', 
    borderRadius: 15, 
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#DDD', 
  },
  filterButtonActive: {
    backgroundColor: '#3B5323',
    borderColor: '#3B5323',
  },
  filterButtonTextBase: { 
    fontFamily: 'Montserrat_400Regular',
    fontSize: 14,
  },
  filterButtonTextActive: { 
    color: '#FFFFFF',
    fontWeight: 'bold', 
  },
  filterButtonTextInactive: { 
    color: '#333333',
  },
  noCategoriesText: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 13,
    color: '#777',
    marginLeft: 5,
  },
  transactionsTitle: {
    fontSize: 20,
    color: '#3B5323',
    marginBottom: 15,
    marginTop: 10, 
    fontFamily: 'Montserrat_700Bold',
    textAlign: 'center',
  },
  transactionItem: {
    width: '90%',
    alignSelf: 'center',
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
    flex: 1,
    marginRight: 10,
  },
  transactionDescription: {
    fontSize: 16,
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
    fontSize: 17,
    fontFamily: 'Montserrat_700Bold',
  },
  incomeAmount: {
    color: '#28a745',
  },
  expenseAmount: {
    color: '#dc3545',
  },
  noTransactionsText: {
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
    fontSize: 16,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
  },
});