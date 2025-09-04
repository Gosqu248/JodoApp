import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    StatusBar,
    ActivityIndicator,
    Alert, SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MembershipType } from "@/types/MembershipType";
import { getActiveMembershipTypes } from "@/api/membership";
import TypeItem from './TypeItem';
import {handleApiError} from "@/utils/errorHandler";

interface GroupedMembershipTypes {
    oneTime: MembershipType[];
    gym: MembershipType[];
    open: MembershipType[];
}

/**
 * TypesScreen Component
 *
 * Main screen for displaying available membership types organized by category.
 * Features automatic categorization, loading states, and empty state handling.
 *
 * Key Features:
 * - Fetches and displays active membership types from API
 * - Automatically groups memberships by type (one-time, gym, open)
 * - Responsive sections with descriptive headers
 * - Loading and error handling with user feedback
 * - Empty state when no memberships are available
 */
export default function TypesScreen() {
    const [membershipTypes, setMembershipTypes] = useState<MembershipType[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch membership types on component mount
    useEffect(() => {
        fetchMembershipTypes();
    }, []);

    /**
     * Fetches active membership types from API
     * Handles loading states and error scenarios
     */
    const fetchMembershipTypes = async () => {
        try {
            setLoading(true);
            const types = await getActiveMembershipTypes();
            setMembershipTypes(types);
        } catch (error) {
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Groups membership types into categories based on duration and features
     * @param types - Array of membership types to categorize
     * @returns Grouped membership types object
     */
    const groupMembershipTypes = (types: MembershipType[]): GroupedMembershipTypes => {
        const grouped: GroupedMembershipTypes = {
            oneTime: [],
            gym: [],
            open: []
        };

        types.forEach(type => {
            const isOneTime = (!type.durationMonths || type.durationMonths === 0) &&
                (!type.durationWeeks || type.durationWeeks === 0);

            if (isOneTime) {
                grouped.oneTime.push(type);
            } else if (type.withExercises) {
                grouped.open.push(type);
            } else {
                grouped.gym.push(type);
            }
        });

        return grouped;
    };

    /**
     * Renders a section of membership types with header and description
     * @param title - Section title
     * @param types - Array of membership types for this section
     * @param icon - Icon to display in section header
     * @param description - Section description text
     * @returns JSX element or null if no types in section
     */
    const renderSection = (title: string, types: MembershipType[], icon: keyof typeof Ionicons.glyphMap, description: string) => {
        if (types.length === 0) return null;

        return (
            <View style={styles.section}>
                {/* Section header with icon, title, description and underline */}
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleContainer}>
                        <View style={styles.sectionIconContainer}>
                            <Ionicons name={icon} size={24} color="#ffd500" />
                        </View>
                        <View style={styles.sectionTextContainer}>
                            <Text style={styles.sectionTitle}>{title}</Text>
                            <Text style={styles.sectionDescription}>{description}</Text>
                        </View>
                    </View>
                    <View style={styles.sectionTitleUnderline} />
                </View>

                {/* List of membership types in this section */}
                <View style={styles.typesContainer}>
                    {types.map((type) => (
                        <TypeItem
                            key={type.id}
                            membershipType={type}
                        />
                    ))}
                </View>
            </View>
        );
    };

    // Show loading screen while fetching data
    if (loading) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#ffd500" />
                    <Text style={styles.loadingText}>Ładowanie karnetów...</Text>
                </View>
            </View>
        );
    }

    const groupedTypes = groupMembershipTypes(membershipTypes);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >

                {/* Membership Types Sections */}
                <View style={styles.sectionsContainer}>
                    {renderSection(
                        'Wejścia Jednorazowe',
                        groupedTypes.oneTime,
                        'enter-outline',
                        'Płać za każde wejście z osobna'
                    )}

                    {renderSection(
                        'Karnet Siłownia',
                        groupedTypes.gym,
                        'fitness-outline',
                        'Dostęp tylko do siłowni'
                    )}

                    {renderSection(
                        'Karnet OPEN',
                        groupedTypes.open,
                        'trophy-outline',
                        'Pełny dostęp - siłownia + zajęcia grupowe'
                    )}
                </View>

                {/* Empty state when no membership types are available */}
                {membershipTypes.length === 0 && (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconContainer}>
                            <Ionicons name="card-outline" size={64} color="#d1d5db" />
                        </View>
                        <Text style={styles.emptyStateTitle}>Brak dostępnych karnetów</Text>
                        <Text style={styles.emptyStateText}>
                            Obecnie nie ma dostępnych karnetów w ofercie
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA'
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6b7280',
        fontWeight: '500'
    },
    scrollView: {
        flex: 1
    },
    scrollContainer: {
        paddingBottom: 32
    },
    heroSection: {
        marginHorizontal: 16,
        marginTop: 10,
        marginBottom: 24
    },
    heroGradient: {
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#ffd500',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6
    },
    heroContent: {
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24
    },
    cardContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16
    },
    heroTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 8,
        textAlign: 'center'
    },
    heroSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
        lineHeight: 24
    },
    sectionsContainer: {
        marginTop: 24,
        paddingHorizontal: 16
    },
    section: {
        marginBottom: 32
    },
    sectionHeader: {
        marginBottom: 16
    },
    sectionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8
    },
    sectionIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 213, 0, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    sectionTextContainer: {
        flex: 1
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000',
        marginBottom: 2
    },
    sectionDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 18
    },
    sectionTitleUnderline: {
        height: 3,
        backgroundColor: '#ffd500',
        width: 60,
        borderRadius: 2,
        marginLeft: 52
    },
    typesContainer: {
        gap: 12
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 20
    },
    emptyIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#f9fafb',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#6b7280',
        marginBottom: 8,
        textAlign: 'center'
    },
    emptyStateText: {
        fontSize: 16,
        color: '#9ca3af',
        textAlign: 'center',
        lineHeight: 24
    }
});