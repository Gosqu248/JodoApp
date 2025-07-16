import React, {useState} from 'react';
import {
    Image,
    StyleSheet,
    TouchableOpacity,
    ImageSourcePropType,
    View,
} from 'react-native';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/pl';
import {ThemedText} from '@/components/ThemedText';
import {ThemedView} from '@/components/ThemedView';
import {LinearGradient} from 'expo-linear-gradient';
import {Post} from '@/types/Post';
import Modal from 'react-native-modal';


dayjs.extend(relativeTime);
dayjs.locale('pl');

interface PostItemProps {
    id: string;
    title: string;
    description: string;
    photo?: ImageSourcePropType;
    createdDate: string;
    type?: Post['postType'];
}

export default function PostItem({
                                     id,
                                     title,
                                     description,
                                     photo,
                                     createdDate,
                                     type = 'OGŁOSZENIE',
                                 }: PostItemProps) {
    const [modalVisible, setModalVisible] = useState(false);

    const openModal = () => setModalVisible(true);
    const closeModal = () => setModalVisible(false);


    const dateText = dayjs(createdDate).isValid()
        ? dayjs(createdDate).isSame(dayjs(), 'day')
            ? dayjs(createdDate).fromNow()
            : dayjs(createdDate).format('DD.MM.YYYY')
        : '';

    const getTypeConfig = () => {
        switch (type) {
            case 'ZAMKNIĘCIE':
                return {gradient: ['#FF6B6B', '#FF8E8E'], icon: '🔒', badge: 'ZAMKNIĘCIE', badgeColor: '#FF4444'};
            case 'PROMOCJA':
                return {gradient: ['#ffb300', '#edce32', ], icon: '💪', badge: 'PROMOCJA', badgeColor: '#FFA000'};
            case 'NOWOŚĆ':
                return {gradient: ['#4ECDC4', '#44A08D'], icon: '🆕', badge: 'NOWOŚĆ', badgeColor: '#00BFA5'};
            case 'ZAJĘCIA':
                return {gradient: ['#42A5F5', '#1E88E5'], icon: '🏋️‍♀️', badge: 'ZAJĘCIA', badgeColor: '#1565C0'};
            case 'WYDARZENIE':
                return {gradient: ['#AB47BC', '#8E24AA'], icon: '📅', badge: 'WYDARZENIE', badgeColor: '#6A1B9A'};
            default:
                return {gradient: ['#667eea', '#764ba2'], icon: '📢', badge: 'OGŁOSZENIE', badgeColor: '#5E72E4'};
        }
    };

    const typeConfig = getTypeConfig();

    return (
        <>
            <ThemedView style={styles.container}>
                <LinearGradient colors={typeConfig.gradient} style={styles.headerGradient} start={{x: 0, y: 0}}
                                end={{x: 1, y: 0}}>
                    <View style={styles.headerContent}>
                        <View style={styles.iconContainer}>
                            <ThemedText style={styles.icon}>{typeConfig.icon}</ThemedText>
                        </View>
                        <ThemedText style={styles.dateText}>📅 {dateText}</ThemedText>

                        <View style={[styles.badge, {backgroundColor: typeConfig.badgeColor}]}>
                            <ThemedText style={styles.badgeText}>{typeConfig.badge}</ThemedText>
                        </View>
                    </View>
                </LinearGradient>

                {photo && (
                    <View style={styles.imageContainer}>
                        <Image source={photo} style={styles.image}/>
                        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.imageOverlay}/>
                    </View>
                )}

                <TouchableOpacity style={styles.contentContainer} onPress={openModal}>
                    <ThemedText style={styles.title}>{title}</ThemedText>
                    <ThemedText style={styles.description} numberOfLines={1}>
                        {description}
                    </ThemedText>

                    <View style={styles.readMoreContainer} >
                        <ThemedText style={[styles.readMore, {color: typeConfig.badgeColor}]}>Zobacz więcej
                            ▼</ThemedText>
                    </View>

                </TouchableOpacity>
                <View style={[styles.accentLine, {backgroundColor: typeConfig.badgeColor}]}/>
            </ThemedView>

            <Modal
                isVisible={modalVisible}
                onSwipeComplete={closeModal}
                swipeDirection={['up', 'down']}
                onBackdropPress={closeModal}
                style={{margin: 0}}
            >
                <ThemedView style={styles.modalContainer}>
                        {photo && <Image source={photo} style={styles.modalImage} resizeMode={"contain"}/>}
                        <View style={styles.infoContainer}>
                            <ThemedText style={styles.modalTitle}>{title}</ThemedText>
                            <ThemedText style={styles.modalDescription}>{description}</ThemedText>
                                <ThemedText style={styles.modalDate}>📅 {dateText}</ThemedText>
                                <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                                    <ThemedText style={styles.closeButtonText}>Zamknij</ThemedText>
                                </TouchableOpacity>
                        </View>
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
    headerGradient: {height: 50, justifyContent: 'center', paddingHorizontal: 20},
    headerContent: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    icon: {fontSize: 20},
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 3
    },
    badgeText: {color: '#FFFFFF', fontSize: 12, fontWeight: 'bold', letterSpacing: 0.5},
    imageContainer: {position: 'relative'},
    image: {width: '100%', aspectRatio: 5/4},
    imageOverlay: {position: 'absolute', bottom: 0, left: 0, right: 0, height: 60},
    contentContainer: {padding: 20},
    title: {fontSize: 22, fontWeight: 'bold', marginBottom: 12, color: '#2D3748', lineHeight: 28},
    description: {fontSize: 16, lineHeight: 24, color: '#4A5568', marginBottom: 16},
    readMoreContainer: {
        alignSelf: 'flex-end',
    },
    readMore: {paddingVertical: 8,
        paddingHorizontal: 25,
        borderRadius: 20,
        backgroundColor: 'rgba(94, 114, 228, 0.1)', fontSize: 14, fontWeight: '600'},
    footer: {marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#E2E8F0'},
    dateContainer: {flexDirection: 'row', alignItems: 'center'},
    dateText: {fontSize: 14, color: '#ffffff', fontWeight: '500'},
    accentLine: {height: 4, width: '100%'},
    modalContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalImage: {width: '90%', borderRadius: 20, aspectRatio: 1, marginTop: 5},
    infoContainer: {padding: 20, width: '100%', alignItems: 'center'},
    modalTitle: {fontSize: 24, fontWeight: 'bold', marginTop: 5, textAlign: 'center', marginBottom: 12, color: '#2D3748'},
    modalDescription: {fontSize: 14, lineHeight: 24, color: '#4A5568', marginBottom: 16},
    modalDateContainer: {display: "flex", flexDirection: 'row', gap: 10, justifyContent: "center", alignItems: 'center'},
    modalDate: {fontSize: 14, color: '#718096', fontWeight: '500', marginBottom: 10},
    closeButton: {paddingVertical: 10, paddingHorizontal: 50, borderRadius: 20, backgroundColor: '#ffb300'},
    closeButtonText: {color: '#FFFFFF', fontSize: 20, fontWeight: '600'},
});
