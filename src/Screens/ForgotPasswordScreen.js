// src/Screens/ForgotPasswordScreen.js

import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    Alert, 
    ActivityIndicator, 
    Platform,
    KeyboardAvoidingView,
    ScrollView 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../config/firebase'; // Verifique se o caminho está correto
import { sendPasswordResetEmail } from 'firebase/auth';

export default function ForgotPasswordScreen() {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePasswordReset = async () => {
        if (email.trim() === '') {
            Alert.alert('Campo Vazio', 'Por favor, insira seu endereço de e-mail.');
            return;
        }

        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email.trim());
            Alert.alert(
                'Verifique seu E-mail',
                `Um link para redefinir sua senha foi enviado para ${email}.`,
                [{ text: 'OK', onPress: () => navigation.goBack() }] // Volta para a tela de login ao pressionar OK
            );
        } catch (error) {
            console.error("Erro ao enviar e-mail de redefinição:", error);
            if (error.code === 'auth/user-not-found') {
                Alert.alert('Erro', 'Nenhum usuário encontrado com este endereço de e-mail.');
            } else if (error.code === 'auth/invalid-email') {
                Alert.alert('Erro', 'O endereço de e-mail fornecido é inválido.');
            }
            else {
                Alert.alert('Erro', 'Não foi possível enviar o link de redefinição. Tente novamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={28} color="#3B5323" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Recuperar Senha</Text>
                </View>

                <View style={styles.formContainer}>
                    <Text style={styles.instructions}>
                        Insira o e-mail associado à sua conta e enviaremos um link para você criar uma nova senha.
                    </Text>

                    <Text style={styles.label}>E-mail</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="seuemail@exemplo.com"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        editable={!loading}
                    />

                    <TouchableOpacity
                        style={[styles.sendButton, loading && styles.sendButtonDisabled]}
                        onPress={handlePasswordReset}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.sendButtonText}>Enviar Link de Recuperação</Text>
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
    scrollContainer: {
        flexGrow: 1,
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
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#3B5323',
        marginLeft: 15,
    },
    formContainer: {
        padding: 20,
        marginTop: 20,
    },
    instructions: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 24,
    },
    label: {
        fontSize: 16,
        color: '#3B5323',
        marginBottom: 8,
    },
    input: {
        backgroundColor: 'white',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: Platform.OS === 'ios' ? 14 : 12,
        fontSize: 16,
        borderColor: '#CCC',
        borderWidth: 1,
        color: '#333',
        marginBottom: 20,
    },
    sendButton: {
        backgroundColor: '#3B5323',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#A9BA9D',
    },
    sendButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});