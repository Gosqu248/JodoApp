import React, {useState, useEffect} from 'react';
import {
    Image,
    StyleSheet,
    TouchableOpacity,
    View,
    ScrollView,
    Linking,
} from 'react-native';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/pl';
import {ThemedText} from '@/components/ThemedText';
import {ThemedView} from '@/components/ThemedView';
import {LinearGradient} from 'expo-linear-gradient';
import Modal from 'react-native-modal';
import { Video, ResizeMode } from 'expo-av';

// Configure dayjs for Polish localization and relative time formatting
dayjs.extend(relativeTime);
dayjs.locale('pl');

interface PostItemProps {
    id: string;
    description: string;
    imageUrl: string | null;
    videoUrl: string | null;
    facebookPostUrl: string | null;
    createdDate: string;
}

/**
 * PostItem Component
 *
 * Displays a single post item synced from Facebook.
 * Features a modal for expanded view with image/video and full description.
 *
 * Key Features:
 * - Displays images or videos from Facebook
 * - Modal for detailed view with full description
 * - Polish date formatting with relative time display
 * - Link to original Facebook post
 * - Touch interactions for opening modal
 * - Responsive design with media overlay effects
 *
 * @param id - Unique post identifier
 * @param description - Post description content
 * @param imageUrl - Optional post image URL from Facebook
 * @param videoUrl - Optional post video URL from Facebook
 * @param facebookPostUrl - Link to original Facebook post
 * @param createdDate - Post creation date
 */
export default function PostItem({
                                     description,
                                     imageUrl,
                                     videoUrl,
                                     facebookPostUrl,
                                     createdDate,
                                 }: PostItemProps) {
    const [modalVisible, setModalVisible] = useState(false);
    const [imageAspectRatio, setImageAspectRatio] = useState<number>(9 / 11); // Default for portrait

    const openModal = () => setModalVisible(true);
    const closeModal = () => setModalVisible(false);

    /**
     * Calculate image aspect ratio when imageUrl changes
     * Detects if image is portrait (9:16) or landscape (16:9) and adjusts accordingly
     */
    useEffect(() => {
        if (imageUrl) {
            Image.getSize(
                imageUrl,
                (width, height) => {
                    const ratio = width / height;
                    // If landscape (width > height), use landscape aspect ratio
                    // If portrait (height > width), use portrait aspect ratio
                    setImageAspectRatio(ratio);
                },
                (error) => {
                    console.log('Error getting image size:', error);
                    // Fallback to default portrait aspect ratio
                    setImageAspectRatio(9 / 11);
                }
            );
        }
    }, [imageUrl]);

    /**
     * Opens the original Facebook post in browser or Facebook app
     */
    const openFacebookPost = () => {
        if (facebookPostUrl) {
            Linking.openURL(facebookPostUrl);
        }
    };

    /**
     * Formats the creation date for display
     * Shows relative time for today's posts, otherwise shows DD.MM.YYYY format
     */
    const dateText = dayjs(createdDate).isValid()
        ? dayjs(createdDate).isSame(dayjs(), 'day')
            ? dayjs(createdDate).fromNow()
            : dayjs(createdDate).format('DD.MM.YYYY')
        : '';

    return (
        <>
            <ThemedView style={styles.container}>
                {/* Image or Video */}
                <View style={styles.mediaContainer}>
                    {videoUrl ? (
                        <Video
                            source={{ uri: videoUrl }}
                            style={[styles.media, { aspectRatio: 9 / 11 }]}
                            useNativeControls
                            resizeMode={ResizeMode.COVER}
                            isLooping
                        />
                    ) : imageUrl ? (
                        <Image
                            source={{ uri: imageUrl }}
                            style={[styles.media, { aspectRatio: imageAspectRatio }]}
                            resizeMode="cover"
                        />
                    ) : (
                        <Image source={require('@/assets/images/icon.png')} style={[styles.media, { aspectRatio: 9 / 11 }]} />
                    )}
                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.mediaOverlay}/>
                </View>

                {/* Main content with description and read more button */}
                <TouchableOpacity style={styles.contentContainer} onPress={openModal}>
                    <ThemedText style={styles.description} numberOfLines={3}>
                        {description}
                    </ThemedText>

                    <View style={styles.readMoreContainer}>
                        <ThemedText style={styles.dateText}>📅 {dateText}</ThemedText>
                        <ThemedText style={styles.readMore}>
                            Zobacz więcej ▼
                        </ThemedText>
                    </View>
                </TouchableOpacity>

                {/* Accent line at bottom */}
                <View style={styles.accentLine}/>
            </ThemedView>

            {/* Modal for expanded post view */}
            <Modal
                isVisible={modalVisible}
                onBackdropPress={closeModal}
                style={{margin: 0}}
                propagateSwipe={true}
            >
                <ThemedView style={styles.modalContainer}>
                    <ScrollView
                        style={styles.modalScrollView}
                        contentContainerStyle={styles.modalScrollContent}
                        showsVerticalScrollIndicator={true}
                        bounces={true}
                    >
                        {/* Full-size media in modal */}
                        {videoUrl ? (
                            <Video
                                source={{ uri: videoUrl }}
                                style={[styles.modalImage, { aspectRatio: 9 / 14 }]}
                                useNativeControls
                                resizeMode={ResizeMode.COVER}
                                isLooping
                            />
                        ) : imageUrl ? (
                            <Image
                                source={{ uri: imageUrl }}
                                style={[styles.modalImage, { aspectRatio: imageAspectRatio }]}
                                resizeMode="cover"
                            />
                        ) : (
                            <Image
                                source={require('@/assets/images/icon.png')}
                                style={[styles.modalImage, { aspectRatio: 9 / 14 }]}
                                resizeMode="contain"
                            />
                        )}

                        {/* Modal content with full description, date and buttons */}
                        <View style={styles.modalContentContainer}>
                            {facebookPostUrl && (
                                <View style={styles.topContainer}>
                                    <ThemedText style={styles.modalDate}>📅 {dateText}</ThemedText>

                                    <TouchableOpacity
                                        style={styles.modalFacebookButton}
                                        onPress={openFacebookPost}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.facebookButtonContent}>
                                            <View style={styles.facebookIconCircle}>
                                                <ThemedText style={styles.facebookIcon}>f</ThemedText>
                                            </View>
                                            <ThemedText style={styles.modalFacebookButtonText}>
                                                Zobacz na Facebooku
                                            </ThemedText>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            )}

                            <ThemedText style={styles.modalDescription}>{description}</ThemedText>
                        </View>
                    </ScrollView>

                    <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                        <ThemedText style={styles.closeButtonText}>Zamknij</ThemedText>
                    </TouchableOpacity>
                </ThemedView>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        marginVertical: 20,
        marginHorizontal: 26,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 8},
        shadowOpacity: 0.12,
        shadowRadius: 24,
        elevation: 8,
        borderWidth: 1,
        borderColor: '#d0d2d5',
    },
    headerGradient: {
        height: 50,
        justifyContent: 'center',
        paddingHorizontal: 20
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    icon: {
        fontSize: 20
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        backgroundColor: '#5E72E4',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 3
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: 'bold',
        letterSpacing: 0.5
    },
    mediaContainer: {
        position: 'relative'
    },
    media: {
        width: '100%',
        // aspectRatio is set dynamically based on image dimensions
    },
    mediaOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 60
    },
    contentContainer: {
        padding: 20
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        color: '#4A5568',
        marginBottom: 16
    },
    readMoreContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    readMore: {
        paddingVertical: 8,
        paddingHorizontal: 25,
        borderRadius: 20,
        backgroundColor: 'rgba(94, 114, 228, 0.1)',
        fontSize: 14,
        fontWeight: '600',
        color: '#5E72E4'
    },
    facebookButton: {
        marginHorizontal: 20,
        marginBottom: 15,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 15,
        backgroundColor: '#1877F2',
        alignItems: 'center',
    },
    facebookButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    dateText: {
        fontSize: 14,
        color: '#4A5568',
        fontWeight: '500'
    },
    accentLine: {
        height: 4,
        width: '100%',
        backgroundColor: '#5E72E4'
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalScrollView: {
        flex: 1,
        width: '100%',
    },
    modalScrollContent: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    modalImage: {
        alignSelf: 'center',
        borderRadius: 10,
        width: '90%',
        // aspectRatio is set dynamically based on image dimensions
    },
    modalContentContainer: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        width: '100%',
    },
    topContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    modalDescription: {
        fontSize: 16,
        lineHeight: 24,
        color: '#4A5568',
        marginBottom: 60
    },
    modalDate: {
        fontSize: 16,
        color: '#718096',
        fontWeight: '500',
        marginBottom: 10
    },
    modalFacebookButton: {
        alignSelf: 'center',
        marginBottom: 12,
        marginTop: 2,
        borderRadius: 12,
        backgroundColor: '#1877F2',
        shadowColor: '#1877F2',
        shadowOffset: {width: 0, height: 3},
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 4,
    },
    facebookButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 18,
        gap: 8,
    },
    facebookIconCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    facebookIcon: {
        color: '#1877F2',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'sans-serif',
    },
    modalFacebookButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 0.2,
    },
    closeButton: {
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
        paddingVertical: 12,
        paddingHorizontal: 60,
        borderRadius: 25,
        backgroundColor: '#ffb300',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    closeButtonText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '600'
    },
});