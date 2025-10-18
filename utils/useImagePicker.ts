import { useState } from 'react';
import { Alert, Platform, ActionSheetIOS } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

export function useImagePicker() {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const requestPermissions = async () => {
        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
        const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

        return {
            camera: cameraPermission.status === 'granted',
            mediaLibrary: mediaLibraryPermission.status === 'granted'
        };
    };

    const showPermissionAlert = () => {
        Alert.alert(
            'Brak uprawnień',
            'Aby zmienić zdjęcie profilowe, musisz nadać uprawnienia do aparatu lub galerii.',
            [{ text: 'OK' }]
        );
    };

    const pickImageFromCamera = async () => {
        try {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.3, // Zwiększona jakość
                base64: false, // Wyłączone base64 dla lepszej wydajności
                exif: false,
            });

            if (!result.canceled && result.assets[0]) {
                await processImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Camera error:', error);
            Alert.alert('Błąd', 'Nie udało się zrobić zdjęcia');
        }
    };

    const pickImageFromGallery = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.3,
                base64: false,
                exif: false,
            });

            if (!result.canceled && result.assets[0]) {
                await processImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Gallery error:', error);
            Alert.alert('Błąd', 'Nie udało się wybrać zdjęcia');
        }
    };

    const processImage = async (uri: string) => {
        try {
            if (Platform.OS === 'android') {
                const fileInfo = await FileSystem.getInfoAsync(uri);

                if (!fileInfo.exists) {
                    throw new Error('File does not exist');
                }

                const filename = uri.split('/').pop() || `image_${Date.now()}.jpg`;
                const newPath = `${FileSystem.cacheDirectory}${filename}`;

                try {
                    await FileSystem.copyAsync({
                        from: uri,
                        to: newPath
                    });
                    setSelectedImage(newPath);
                } catch (copyError) {
                    setSelectedImage(uri);
                }
            } else {
                setSelectedImage(uri);
            }
        } catch (error) {
            console.error('Process image error:', error);
            Alert.alert('Błąd', 'Nie udało się przetworzyć zdjęcia');
        }
    };

    const showImagePicker = async () => {
        const permissions = await requestPermissions();


        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: ['Anuluj', 'Aparat', 'Galeria'],
                    cancelButtonIndex: 0,
                    title: 'Wybierz źródło zdjęcia'
                },
                (buttonIndex) => {
                    if (buttonIndex === 1 && permissions.camera) {
                        pickImageFromCamera();
                    } else if (buttonIndex === 2 && permissions.mediaLibrary) {
                        pickImageFromGallery();
                    } else if (buttonIndex !== 0) {
                        showPermissionAlert();
                    }
                }
            );
        } else {
            Alert.alert(
                'Wybierz źródło zdjęcia',
                'Skąd chcesz wybrać zdjęcie?',
                [
                    { text: 'Anuluj', style: 'cancel' },
                    {
                        text: 'Aparat',
                        onPress: () => {
                            if (permissions.camera) {
                                pickImageFromCamera();
                            } else {
                                showPermissionAlert();
                            }
                        }
                    },
                    {
                        text: 'Galeria',
                        onPress: () => {
                            if (permissions.mediaLibrary) {
                                pickImageFromGallery();
                            } else {
                                showPermissionAlert();
                            }
                        }
                    }
                ]
            );
        }
    };

    const resetImage = () => {
        setSelectedImage(null);
    };

    return {
        selectedImage,
        showImagePicker,
        resetImage
    };
}