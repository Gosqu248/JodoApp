import { StyleSheet } from 'react-native';

import NotificationItem from "@/components/notification/NotificationItem";
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React from "react";

const sampleNotifications = [
    {
        id: '1',
        title: 'Nowe powiadomienie',
        description: 'To jest przykładowy opis powiadomienia. Kliknij, aby zobaczyć więcej szczegółów. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        image: require('@/assets/images/czchow_home.png'),
    },
    {
        id: '2',
        title: 'Aktualizacja aplikacji',
        description: 'Dostępna jest nowa wersja aplikacji. Zaktualizuj, aby korzystać z nowych funkcji. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        image: require('@/assets/images/czchow_home.png'),
    },
];

const accentColors = ['#ffd900', '#00BFFF', '#32CD32', '#FF69B4'];


export default function NotificationsScreen() {
    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: '#FFD700', dark: '#333333' }}
            headerImage={
                <ThemedView style={styles.headerImageContainer}>
                    <ThemedText style={styles.headerText}>Powiadomienia</ThemedText>
                </ThemedView>
            }>
            <ThemedView style={styles.container}>
                {sampleNotifications.length > 0 ? (
                    sampleNotifications.map((notification, index) => (
                        <NotificationItem
                            key={notification.id}
                            title={notification.title}
                            description={notification.description}
                            image={notification.image}
                            accentColor={accentColors[index % accentColors.length]}
                        />
                    ))
                ) : (
                    <ThemedText style={styles.noDataText}>Brak nowych powiadomień.</ThemedText>
                )}
            </ThemedView>
        </ParallaxScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 16,
    },
    headerImageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,217,0,0.87)', // Semi-transparent gold background
    },
    headerText: {
        paddingTop: 50,
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    noDataText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: '#888888',
    }
});