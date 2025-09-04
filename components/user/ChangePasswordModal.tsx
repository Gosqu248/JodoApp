import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Modal,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {changePassword} from "@/api/auth";
import {ErrorResponse} from "@/types/ErrorResponse";

interface ChangePasswordModalProps {
    visible: boolean;
    onClose: () => void;
    userId?: string; // Optional for future use
}

interface PasswordData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

/**
 * Modal component for changing user password
 * Includes validation, secure input fields, and proper error handling
 */
export default function ChangePasswordModal({ visible, onClose }: ChangePasswordModalProps) {
    const [formData, setFormData] = useState<PasswordData>({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<Partial<PasswordData>>({});

    /**
     * Validate form fields according to password policy
     * @returns boolean indicating if form is valid
     */
    const validateForm = (): boolean => {
        const newErrors: Partial<PasswordData> = {};

        // Current password validation
        if (!formData.currentPassword.trim()) {
            newErrors.currentPassword = 'Obecne hasło jest wymagane';
        }

        // New password validation
        if (!formData.newPassword.trim()) {
            newErrors.newPassword = 'Nowe hasło jest wymagane';
        } else if (formData.newPassword.length < 6) {
            newErrors.newPassword = 'Hasło musi mieć co najmniej 6 znaków';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
            newErrors.newPassword = 'Hasło musi zawierać małą literę, dużą literę i cyfrę';
        } else if (formData.newPassword === formData.currentPassword) {
            newErrors.newPassword = 'Nowe hasło musi być różne od obecnego';
        }

        // Confirm password validation
        if (!formData.confirmPassword.trim()) {
            newErrors.confirmPassword = 'Potwierdzenie hasła jest wymagane';
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Hasła nie są identyczne';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Handle form submission
     */
    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            await changePassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
                confirmNewPassword: formData.confirmPassword
            });

            Alert.alert(
                'Sukces',
                'Hasło zostało pomyślnie zmienione',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            resetForm();
                            onClose();
                        }
                    }
                ]
            );
        } catch (error: any) {
            console.error('Error changing password:', error);
            const errData = error?.response?.data as ErrorResponse;

            const message =
                errData?.message || error.message || 'Wystąpił nieoczekiwany błąd.';
            Alert.alert(
                'Błąd',
                message,
                [{ text: 'OK' }]
            );
        } finally {
            setLoading(false);
        }
    };

    /**
     * Reset form to initial state
     */
    const resetForm = () => {
        setFormData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
        setErrors({});
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
    };

    /**
     * Handle modal close with form reset
     */
    const handleClose = () => {
        if (!loading) {
            resetForm();
            onClose();
        }
    };

    /**
     * Update form field and clear associated error
     */
    const updateFormData = (field: keyof PasswordData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                style={styles.overlay}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.modalContainer}>
                    <ScrollView
                        contentContainerStyle={styles.scrollContainer}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.title}>Zmień hasło</Text>
                            <TouchableOpacity
                                style={[styles.closeButton, loading && styles.disabledButton]}
                                onPress={handleClose}
                                disabled={loading}
                            >
                                <Ionicons name="close" size={24} color={loading ? "#ccc" : "#000"} />
                            </TouchableOpacity>
                        </View>

                        {/* Form */}
                        <View style={styles.form}>
                            {/* Current Password Field */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Obecne hasło</Text>
                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            errors.currentPassword && styles.inputError
                                        ]}
                                        value={formData.currentPassword}
                                        onChangeText={(text) => updateFormData('currentPassword', text)}
                                        placeholder="Wprowadź obecne hasło"
                                        secureTextEntry={!showCurrentPassword}
                                        editable={!loading}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                    <TouchableOpacity
                                        style={styles.eyeButton}
                                        onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                                        disabled={loading}
                                    >
                                        <Ionicons
                                            name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'}
                                            size={20}
                                            color={loading ? "#ccc" : "#666"}
                                        />
                                    </TouchableOpacity>
                                </View>
                                {errors.currentPassword && (
                                    <Text style={styles.errorText}>{errors.currentPassword}</Text>
                                )}
                            </View>

                            {/* New Password Field */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Nowe hasło</Text>
                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            errors.newPassword && styles.inputError
                                        ]}
                                        value={formData.newPassword}
                                        onChangeText={(text) => updateFormData('newPassword', text)}
                                        placeholder="Wprowadź nowe hasło"
                                        secureTextEntry={!showNewPassword}
                                        editable={!loading}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                    <TouchableOpacity
                                        style={styles.eyeButton}
                                        onPress={() => setShowNewPassword(!showNewPassword)}
                                        disabled={loading}
                                    >
                                        <Ionicons
                                            name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                                            size={20}
                                            color={loading ? "#ccc" : "#666"}
                                        />
                                    </TouchableOpacity>
                                </View>
                                {errors.newPassword && (
                                    <Text style={styles.errorText}>{errors.newPassword}</Text>
                                )}
                            </View>

                            {/* Confirm Password Field */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Potwierdź nowe hasło</Text>
                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            errors.confirmPassword && styles.inputError
                                        ]}
                                        value={formData.confirmPassword}
                                        onChangeText={(text) => updateFormData('confirmPassword', text)}
                                        placeholder="Potwierdź nowe hasło"
                                        secureTextEntry={!showConfirmPassword}
                                        editable={!loading}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                    <TouchableOpacity
                                        style={styles.eyeButton}
                                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                        disabled={loading}
                                    >
                                        <Ionicons
                                            name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                                            size={20}
                                            color={loading ? "#ccc" : "#666"}
                                        />
                                    </TouchableOpacity>
                                </View>
                                {errors.confirmPassword && (
                                    <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                                )}
                            </View>

                            {/* Password Requirements */}
                            <View style={styles.passwordRequirements}>
                                <Text style={styles.requirementsTitle}>Wymagania hasła:</Text>
                                <Text style={styles.requirementText}>• Co najmniej 6 znaków</Text>
                                <Text style={styles.requirementText}>• Zawiera małą literę</Text>
                                <Text style={styles.requirementText}>• Zawiera dużą literę</Text>
                                <Text style={styles.requirementText}>• Zawiera cyfrę</Text>
                                <Text style={styles.requirementText}>• Różne od obecnego hasła</Text>
                            </View>
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[styles.cancelButton, loading && styles.disabledButton]}
                                onPress={handleClose}
                                disabled={loading}
                            >
                                <Text style={[styles.cancelButtonText, loading && styles.disabledText]}>
                                    Anuluj
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.submitButton,
                                    loading && styles.submitButtonDisabled
                                ]}
                                onPress={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#000" size="small" />
                                ) : (
                                    <Text style={styles.submitButtonText}>Zmień hasło</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '90%',
        maxWidth: 400,
        backgroundColor: '#fff',
        borderRadius: 16,
        maxHeight: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    scrollContainer: {
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#000',
    },
    closeButton: {
        padding: 8,
        backgroundColor: '#f5f5f5',
        borderRadius: 20,
    },
    disabledButton: {
        opacity: 0.5,
    },
    form: {
        marginBottom: 24,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 8,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
    },
    input: {
        flex: 1,
        borderWidth: 2,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: '#fff',
        paddingRight: 50,
    },
    inputError: {
        borderColor: '#F44336',
    },
    eyeButton: {
        position: 'absolute',
        right: 16,
        padding: 4,
    },
    errorText: {
        color: '#F44336',
        fontSize: 14,
        marginTop: 4,
        marginLeft: 4,
    },
    passwordRequirements: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 12,
        marginTop: 8,
    },
    requirementsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
    },
    requirementText: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e0e0e0',
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    disabledText: {
        color: '#ccc',
    },
    submitButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        backgroundColor: '#ffc500',
        alignItems: 'center',
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
    },
});