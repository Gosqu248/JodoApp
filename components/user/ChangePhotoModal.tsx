import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Modal,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { updateUserPhoto } from '@/api/user';
import {handleApiError} from "@/utils/errorHandler";
import {useImagePicker} from "@/utils/useImagePicker";


interface ChangePhotoModalProps {
    visible: boolean;
    onClose: () => void;
    onPhotoUpdated: (newPhotoUri: string) => void;
}

export default function ChangePhotoModal({ visible, onClose, onPhotoUpdated }: ChangePhotoModalProps) {
    const [uploading, setUploading] = useState(false);
    const { selectedImage, showImagePicker, resetImage } = useImagePicker();

    // Upload the selected photo to the server
    const uploadPhoto = async () => {
        if (!selectedImage) {
            Alert.alert('Błąd', 'Nie wybrano zdjęcia');
            return;
        }

        setUploading(true);
        try {
            await updateUserPhoto(selectedImage);
            Alert.alert(
                'Sukces',
                'Zdjęcie profilowe zostało pomyślnie zaktualizowane',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            onPhotoUpdated(selectedImage);
                            handleClose();
                        },
                    },
                ]
            );
        } catch (error: any) {
            handleApiError(error);
        } finally {
            setUploading(false);
        }
    };

    // Reset state and close modal
    const handleClose = () => {
        if (!uploading) {
            resetImage();
            onClose();
        }
    };

    // Handle image picker with error handling
    const handleImagePicker = async () => {
        try {
            await showImagePicker();
        } catch  {
            Alert.alert('Błąd', 'Nie udało się wybrać zdjęcia');
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Zmień zdjęcie profilowe</Text>
                        <TouchableOpacity
                            style={[styles.closeButton, uploading && styles.disabledButton]}
                            onPress={handleClose}
                            disabled={uploading}
                        >
                            <Ionicons name="close" size={24} color={uploading ? "#ccc" : "#000"} />
                        </TouchableOpacity>
                    </View>

                    {/* Preview Image */}
                    <View style={styles.imagePreviewContainer}>
                        {selectedImage ? (
                            <Image
                                source={{ uri: selectedImage }}
                                style={styles.previewImage}
                                contentFit="cover"
                            />
                        ) : (
                            <View style={styles.placeholderImage}>
                                <Ionicons name="person" size={60} color="#666" />
                                <Text style={styles.placeholderText}>Wybierz zdjęcie</Text>
                            </View>
                        )}
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionContainer}>
                        <TouchableOpacity
                            style={[styles.actionButton, uploading && styles.disabledButton]}
                            onPress={handleImagePicker}
                            disabled={uploading}
                        >
                            <Ionicons name="camera" size={24} color={uploading ? "#ccc" : "#000"} />
                            <Text style={[styles.actionButtonText, uploading && styles.disabledText]}>
                                {selectedImage ? 'Zmień zdjęcie' : 'Wybierz zdjęcie'}
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.infoContainer}>
                            <Ionicons name="information-circle-outline" size={24} color="#000" />
                            <Text style={styles.infoText}>
                                Zdjęcie profilowe można zmieniać tylko 1 raz w miesiącu.
                                Upewnij się, że wybrane zdjęcie jest wyraźne i przedstawia Twoją twarz.
                            </Text>
                        </View>
                    </View>

                    {/* Bottom Buttons */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.cancelButton, uploading && styles.disabledButton]}
                            onPress={handleClose}
                            disabled={uploading}
                        >
                            <Text style={[styles.cancelButtonText, uploading && styles.disabledText]}>
                                Anuluj
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                (!selectedImage || uploading) && styles.submitButtonDisabled
                            ]}
                            onPress={uploadPhoto}
                            disabled={!selectedImage || uploading}
                        >
                            {uploading ? (
                                <ActivityIndicator color="#000" size="small" />
                            ) : (
                                <Text style={[
                                    styles.submitButtonText,
                                    !selectedImage && styles.disabledText
                                ]}>
                                    Zapisz
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
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
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
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
    imagePreviewContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    previewImage: {
        width: 150,
        height: 150,
        borderRadius: 25,
        borderWidth: 3,
        borderColor: '#ffc500',
    },
    placeholderImage: {
        width: 150,
        height: 150,
        borderRadius: 25,
        backgroundColor: '#f5f5f5',
        borderWidth: 2,
        borderColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
        borderStyle: 'dashed',
    },
    placeholderText: {
        fontSize: 12,
        color: '#666',
        marginTop: 8,
        textAlign: 'center',
    },
    actionContainer: {
        marginBottom: 24,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginLeft: 8,
    },
    disabledText: {
        color: '#ccc',
    },
    infoContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(246,255,23,0.32)',
        padding: 22,
        gap: 10,
        marginVertical: 12,
        borderRadius: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: '#888',
        lineHeight: 18,
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
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
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
        backgroundColor: '#ffe680',
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
});