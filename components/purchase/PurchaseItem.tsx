import React from 'react';
import {
    View,
    Text,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MembershipPurchase } from "@/types/MembershipPurchase";
import { formatDuration, formatPrice } from "@/utils/formatters";

interface PurchaseItemProps {
    purchase: MembershipPurchase;
}

export default function PurchaseItem({ purchase }: PurchaseItemProps) {

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pl-PL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatTime = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('pl-PL', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (): string => {
        return '#4CAF50';
    };

    const getTypeIcon = (): keyof typeof Ionicons.glyphMap => {
        const isOneTime = purchase.durationMonths === 0 && purchase.durationWeeks === 0;

        if (isOneTime) {
            return 'enter';
        } else if (purchase.typeName.toLowerCase().includes('open')) {
            return 'trophy';
        } else {
            return 'fitness';
        }
    };

    const getGradientColors = (): string[] => {
        const isOneTime = purchase.durationMonths === 0 && purchase.durationWeeks === 0;

        if (isOneTime) {
            return ['#4CAF50', '#45a049']; // Green for one-time
        } else if (purchase.typeName.toLowerCase().includes('open')) {
            return ['#ffd500', '#ff9000']; // Gold for OPEN
        } else {
            return ['#2196F3', '#1976D2']; // Blue for gym-only
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#ffffff', '#f8f9fa']}
                style={styles.cardGradient}
            >
                {/* Header with status and date */}
                <View style={styles.header}>
                    <View style={styles.statusContainer}>
                        <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
                        <Text style={[styles.statusText, { color: getStatusColor() }]}>
                            Aktywny
                        </Text>
                    </View>

                    <View style={styles.dateContainer}>
                        <Text style={styles.dateText}>{formatDate(purchase.purchaseDate)}</Text>
                        <Text style={styles.timeText}>{formatTime(purchase.purchaseDate)}</Text>
                    </View>
                </View>

                {/* Main content */}
                <View style={styles.content}>
                    <View style={styles.mainInfo}>
                        <View style={styles.iconContainer}>
                            <LinearGradient
                                colors={getGradientColors()}
                                style={styles.iconGradient}
                            >
                                <Ionicons
                                    name={getTypeIcon()}
                                    size={20}
                                    color="#ffffff"
                                />
                            </LinearGradient>
                        </View>

                        <View style={styles.textContainer}>
                            <Text style={styles.typeName}>{purchase.typeName}</Text>
                            <Text style={styles.duration}>
                                {formatDuration(purchase)}
                            </Text>
                        </View>

                        <View style={styles.priceContainer}>
                            <Text style={styles.priceValue}>{formatPrice(purchase.price)}</Text>
                            <Text style={styles.priceCurrency}>zł</Text>
                        </View>
                    </View>

                    {/* Purchase ID */}
                    <View style={styles.footer}>
                        <View style={styles.idContainer}>
                            <Ionicons name="receipt-outline" size={14} color="#999" />
                            <Text style={styles.idText}>ID: {purchase.id.slice(-8).toUpperCase()}</Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 8,
        marginHorizontal: 16,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f0f0f0'
    },
    cardGradient: {
        padding: 16
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600'
    },
    dateContainer: {
        alignItems: 'flex-end'
    },
    dateText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333'
    },
    timeText: {
        fontSize: 11,
        color: '#666',
        marginTop: 1
    },
    content: {
        gap: 8
    },
    mainInfo: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    iconContainer: {
        marginRight: 12
    },
    iconGradient: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center'
    },
    textContainer: {
        flex: 1
    },
    typeName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
        marginBottom: 2
    },
    duration: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500'
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline'
    },
    priceValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000'
    },
    priceCurrency: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
        marginLeft: 2
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 8,
        marginTop: 8
    },
    idContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    idText: {
        fontSize: 11,
        color: '#999',
        marginLeft: 4,
        fontFamily: 'monospace'
    }
});