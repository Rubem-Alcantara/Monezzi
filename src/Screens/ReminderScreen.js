import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; 
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

const DAILY_REMINDER_NOTIFICATION_ID = 'daily-transaction-reminder'; 
const REMINDER_SETTINGS_KEY = '@AppReminders:dailyReminderSettings';

// Função para pedir permissão
async function ensurePermissions() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    Alert.alert(
      'Permissão Negada', 
      'Não será possível agendar lembretes sem permissão. Você pode habilitar as permissões nas configurações do seu dispositivo.'
    );
    return false;
  }
  
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
  return true;
}

export default function RemindersScreen() {
  const navigation = useNavigation();
  const [isReminderEnabled, setIsReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState(new Date()); 
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(true); 

  
  useEffect(() => {
    const loadPreferences = async () => {
      setIsLoading(true);
      try {
        const settingsString = await AsyncStorage.getItem(REMINDER_SETTINGS_KEY);
        if (settingsString) {
          const settings = JSON.parse(settingsString);
          setIsReminderEnabled(settings.isEnabled);
          setReminderTime(new Date(settings.time)); 
        } else {
          const defaultTime = new Date();
          defaultTime.setHours(19, 0, 0, 0); 
          setReminderTime(defaultTime);
        }
      } catch (e) {
        console.error("Erro ao carregar preferências de lembrete:", e);
        const defaultTime = new Date();
        defaultTime.setHours(19, 0, 0, 0);
        setReminderTime(defaultTime);
      }
      setIsLoading(false);
    };
    loadPreferences();
  }, []);

  const saveAndScheduleReminder = useCallback(async (enabled, time) => {
    try {
      const settings = JSON.stringify({ isEnabled: enabled, time: time.toISOString() });
      await AsyncStorage.setItem(REMINDER_SETTINGS_KEY, settings);
      await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_NOTIFICATION_ID);

      if (enabled) {
        const hasPermission = await ensurePermissions();
        if (!hasPermission) {
          setIsReminderEnabled(false); 
          const disabledSettings = JSON.stringify({ isEnabled: false, time: time.toISOString() });
          await AsyncStorage.setItem(REMINDER_SETTINGS_KEY, disabledSettings);
          return;
        }

        const hour = time.getHours();
        const minute = time.getMinutes();

        await Notifications.scheduleNotificationAsync({
          identifier: DAILY_REMINDER_NOTIFICATION_ID,
          content: {
            title: 'MONEZI - Lembrete Diário 💰',
            body: 'Não se esqueça de registrar suas movimentações financeiras de hoje!',
            sound: true, 
          },
          trigger: {
            hour: hour,
            minute: minute,
            repeats: true,
          },
        });
        console.log(`Lembrete diário agendado para ${hour}:${minute}`);
        Alert.alert('Lembrete Salvo!', `Você será lembrado diariamente às ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}.`);
      } else {
        console.log('Lembrete diário cancelado.');
        Alert.alert('Lembrete Desativado', 'Você não receberá mais lembretes diários.');
      }
    } catch (e) {
      console.error("Erro ao salvar/agendar lembrete:", e);
      Alert.alert("Erro", "Não foi possível salvar as configurações do lembrete.");
    }
  }, []);


  const handleToggleReminder = (value) => {
    setIsReminderEnabled(value);
    saveAndScheduleReminder(value, reminderTime);
  };

  const onChangeTime = (event, selectedDate) => {
    const currentDate = selectedDate || reminderTime;
    setShowTimePicker(Platform.OS === 'ios');
    setReminderTime(currentDate);
    
    if (isReminderEnabled) {
      saveAndScheduleReminder(true, currentDate);
    } else { 
        const settings = JSON.stringify({ isEnabled: false, time: currentDate.toISOString() });
        AsyncStorage.setItem(REMINDER_SETTINGS_KEY, settings);
    }
    if (Platform.OS !== 'ios') { 
        setShowTimePicker(false);
    }
  };

  
  async function scheduleImmediateTestNotification() {
    const hasPermission = await ensurePermissions(); 
    if (!hasPermission) return;
  
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "🔔 Teste de Notificação! 🔔",
          body: "FUNCIONOUUUU!!!",
          data: { testData: "informação de teste" },
          sound: true, 
        },
        trigger: {
          seconds: 3, 
        },
      });
      console.log('Notificação de teste agendada com ID:', notificationId);
      Alert.alert("Teste Agendado", "Você deve receber uma notificação em 3 segundos.");
    } catch (error) {
      console.error("Erro ao agendar notificação de teste:", error);
      Alert.alert("Erro no Teste", "Não foi possível agendar a notificação de teste.");
    }
  }

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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#3B5323" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lembretes</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.settingItem}>
          <Text style={styles.settingText}>Ativar lembrete diário</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#A9BA9D" }}
            thumbColor={isReminderEnabled ? "#3B5323" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={handleToggleReminder}
            value={isReminderEnabled}
          />
        </View>

        {isReminderEnabled && (
          <View style={styles.timePickerContainer}>
            <Text style={styles.label}>Hora do Lembrete:</Text>
            <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.timeDisplay}>
              <Text style={styles.timeText}>
                {reminderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                value={reminderTime}
                mode="time"
                is24Hour={true}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'} 
                onChange={onChangeTime}
              />
            )}
          </View>
        )}
        {!isReminderEnabled && (
            <Text style={styles.disabledMessage}>
                Ative o lembrete diário para configurar a hora.
            </Text>
        )}

        <TouchableOpacity 
            onPress={scheduleImmediateTestNotification} 
            style={styles.testButton}
        >
          <Text style={styles.testButtonText}>Testar Notificação</Text>
        </TouchableOpacity>
      </View>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 45 : 55,
    paddingBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B5323',
    fontFamily: 'Montserrat_700Bold',
  },
  content: {
    padding: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Montserrat_400Regular', 
  },
  timePickerContainer: {
    marginTop: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    color: '#3B5323',
    marginBottom: 10,
    fontFamily: 'Montserrat_700Bold', 
  },
  timeDisplay: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 18,
    color: '#3B5323',
  },
  disabledMessage: {
    marginTop: 15,
    textAlign: 'center',
    fontSize: 14,
    color: '#777',
    fontFamily: 'Montserrat_400Regular', 
  },
  
  testButton: {
    backgroundColor: '#FFA500', 
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30, 
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Montserrat_700Bold', 
  },
});