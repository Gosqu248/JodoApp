import React from 'react';
import {
    View,
    Text,
    StyleSheet, ColorValue,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MembershipPurchase } from "@/types/MembershipPurchase";
import { formatDuration, formatPrice, formatDate } from "@/utils/formatters";

interface PurchaseItemProps {
    purchase: MembershipPurchase;
}

/**
 * PurchaseItem Component
 *
 * Displays a single purchase item with formatted date, status, type, and price information.
 * Features adaptive UI based on purchase type (one-time, gym, or open membership).
 *
 * @param purchase - The membership purchase data to display
 */
export default function PurchaseItem({ purchase }: PurchaseItemProps) {

    /**
     * Determines appropriate icon based on purchase type
     * @returns Ionicons icon name
     */
    const getTypeIcon = (): keyof typeof Ionicons.glyphMap => {
        const isOneTime = purchase.durationMonths === 0 && purchase.durationWeeks === 0;

        if (isOneTime) {
            return 'enter'; // One-time entry icon
        } else if (purchase.typeName.toLowerCase().includes('open')) {
            return 'trophy'; // Premium/Open membership icon
        } else {
            return 'fitness'; // Standard gym membership icon
        }
    };

    /**
     * Returns gradient colors based on purchase type for visual distinction
     * @returns Array of gradient color strings
     */
    const getGradientColors = (): readonly [ColorValue, ColorValue]  => {
        const isOneTime = purchase.durationMonths === 0 && purchase.durationWeeks === 0;

        if (isOneTime) {
            return ['#4CAF50', '#45a049']; // Green for one-time entries
        } else if (purchase.typeName.toLowerCase().includes('open')) {
            return ['#ffd500', '#ff9000']; // Gold for OPEN memberships
        } else {
            return ['#2196F3', '#1976D2']; // Blue for gym-only memberships
        }
    };

    return (
        <View style={styles.container}>
            {/* Main card with gradient background */}
            <LinearGradient
                colors={['#ffffff', '#f8f9fa']}
                style={styles.cardGradient}
            >
                {/* Header section with status and purchase date/time */}
                <View style={styles.header}>
                    <View style={styles.statusContainer}>
                        <View style={[styles.statusDot, { backgroundColor: "#4CAF50" }]} />
                        <Text style={[styles.statusText, { color: "#4CAF50" }]}>
                            Aktywny
                        </Text>
                    </View>

                    <View style={styles.dateContainer}>
                        <Text style={styles.dateText}>{formatDate(new Date(purchase.purchaseDate))}</Text>
                    </View>
                </View>

                {/* Main content section */}
                <View style={styles.content}>
                    <View style={styles.mainInfo}>
                        {/* Type icon with gradient background */}
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

                        {/* Purchase type and duration information */}
                        <View style={styles.textContainer}>
                            <Text style={styles.typeName}>{purchase.typeName}</Text>
                            <Text style={styles.duration}>
                                {formatDuration(purchase)}
                            </Text>
                        </View>

                        {/* Price display */}
                        <View style={styles.priceContainer}>
                            <Text style={styles.priceValue}>{formatPrice(purchase.price)}</Text>
                            <Text style={styles.priceCurrency}>zł</Text>
                        </View>
                    </View>

                    {/* Footer with purchase ID */}
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