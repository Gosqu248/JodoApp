import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MembershipType } from "@/types/MembershipType";
import { formatDuration, formatPrice } from "@/utils/formatters";

interface TypeItemProps {
    membershipType: MembershipType;
}

/**
 * TypeItem Component
 *
 * Displays a single membership type option with adaptive styling based on membership features.
 * Features visual distinction between one-time entries, gym-only, and full access memberships.
 *
 * Key Features:
 * - Adaptive icons and colors based on membership type
 * - Limited offer highlighting for special promotions
 * - Feature list showing included benefits
 * - Price display with proper formatting
 * - Touch-enabled for future selection functionality
 *
 * @param membershipType - The membership type data to display
 */
export default function TypeItem({ membershipType }: TypeItemProps) {

    /**
     * Determines appropriate icon based on membership type and features
     * @returns Ionicons icon name
     */
    const getTypeIcon = (): keyof typeof Ionicons.glyphMap => {
        const isOneTime = (!membershipType.durationMonths || membershipType.durationMonths === 0) &&
            (!membershipType.durationWeeks || membershipType.durationWeeks === 0);

        if (isOneTime) {
            return 'enter'; // One-time entry icon
        } else if (membershipType.withExercises) {
            return 'trophy'; // Premium membership with exercises icon
        } else {
            return 'fitness'; // Standard gym-only membership icon
        }
    };

    /**
     * Returns gradient colors based on membership type for visual distinction
     * @returns Array of gradient color strings
     */
    const getGradientColors = (): string[] => {
        const isOneTime = (!membershipType.durationMonths || membershipType.durationMonths === 0) &&
            (!membershipType.durationWeeks || membershipType.durationWeeks === 0);

        if (isOneTime) {
            return ['#4CAF50', '#45a049']; // Green for one-time entries
        } else if (membershipType.withExercises) {
            return ['#ffd500', '#ff9000']; // Gold for premium OPEN memberships
        } else {
            return ['#2196F3', '#1976D2']; // Blue for gym-only memberships
        }
    };

    return (
        <TouchableOpacity
            style={styles.container}
            activeOpacity={0.8}
        >
            <View style={styles.card}>
                {/* Limited offer banner - only shown for special promotions */}
                { membershipType.isLimited && (
                    <View style={styles.limitedContainer}>
                        <Text style={styles.limitedText}>Oferta limitowana</Text>
                    </View>
                )}

                {/* Main card content with gradient background */}
                <LinearGradient
                    colors={['#ffffff', '#f8f9fa']}
                    style={styles.cardGradient}
                >
                    {/* Header section with icon and price */}
                    <View style={styles.header}>
                        <View style={styles.iconContainer}>
                            <LinearGradient
                                colors={getGradientColors()}
                                style={styles.iconGradient}
                            >
                                <Ionicons
                                    name={getTypeIcon()}
                                    size={24}
                                    color="#ffffff"
                                />
                            </LinearGradient>
                        </View>

                        <View style={styles.priceContainer}>
                            <Text style={styles.priceValue}>{formatPrice(membershipType.price)}</Text>
                            <Text style={styles.priceCurrency}>zł</Text>
                        </View>
                    </View>

                    {/* Content section with name, duration, and features */}
                    <View style={styles.content}>
                        <Text style={styles.name}>{membershipType.name}</Text>
                        <Text style={styles.duration}>
                            {formatDuration(membershipType)}
                        </Text>

                        {/* Show group exercises feature for premium memberships */}
                        {membershipType.withExercises && (
                            <View style={styles.featureContainer}>
                                <View style={styles.feature}>
                                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                                    <Text style={styles.featureText}>Dostęp do zajęć grupowych</Text>
                                </View>
                            </View>
                        )}

                        {/* Basic gym access - included in all memberships */}
                        <View style={styles.featureContainer}>
                            <View style={styles.feature}>
                                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                                <Text style={styles.featureText}>Dostęp do siłowni</Text>
                            </View>
                        </View>
                    </View>
                </LinearGradient>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 4
    },
    card: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#ffd500'
    },
    limitedContainer: {
        backgroundColor: '#f8b30d',
        padding: 8,
        color: '#fff',
        alignItems: 'center'
    },
    limitedText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18
    },
    cardGradient: {
        padding: 20
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16
    },
    iconContainer: {
        borderRadius: 12,
        overflow: 'hidden'
    },
    iconGradient: {
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center'
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline'
    },
    priceValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000'
    },
    priceCurrency: {
        fontSize: 18,
        fontWeight: '600',
        color: '#666',
        marginLeft: 4
    },
    content: {
        marginBottom: 0
    },
    name: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000',
        marginBottom: 6
    },
    duration: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
        marginBottom: 12
    },
    featureContainer: {
        marginBottom: 6
    },
    feature: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    featureText: {
        fontSize: 14,
        color: '#4CAF50',
        fontWeight: '500',
        marginLeft: 8
    },

});