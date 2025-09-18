import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Modal,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ProductFilters, FilterState } from '@/types/ProductFilters';
import { Ionicons } from '@expo/vector-icons';

interface FilterComponentProps {
    visible: boolean;
    filters: ProductFilters;
    selectedFilters: FilterState;
    onApply: (filters: FilterState) => void;
    onReset: () => void;
    onClose: () => void;
}

/**
 * FilterComponent provides a modal interface for filtering products
 * Allows users to filter by brand, category, and size
 */
export default function FilterComponent({
                                            visible,
                                            filters,
                                            selectedFilters,
                                            onApply,
                                            onReset,
                                            onClose
                                        }: FilterComponentProps) {
    const [tempFilters, setTempFilters] = useState<FilterState>({});

    // Update temp filters when modal opens with current selected filters
    useEffect(() => {
        if (visible) {
            setTempFilters({ ...selectedFilters });
        }
    }, [visible, selectedFilters]);

    /**
     * Handles filter selection for a specific filter type
     */
    const handleFilterSelect = (filterType: keyof FilterState, value: string) => {
        setTempFilters(prev => ({
            ...prev,
            [filterType]: prev[filterType] === value ? undefined : value
        }));
    };

    /**
     * Applies the temporary filters
     */
    const handleApply = () => {
        onApply(tempFilters);
    };

    /**
     * Resets all filters
     */
    const handleReset = () => {
        setTempFilters({});
        onReset();
    };

    /**
     * Renders a filter section (brand, category, or size)
     */
    const renderFilterSection = (
        title: string,
        filterKey: keyof FilterState,
        options: string[]
    ) => {
        if (options.length === 0) return null;

        return (
            <View style={styles.filterSection}>
                <ThemedText style={styles.filterSectionTitle}>{title}</ThemedText>
                <View style={styles.optionsContainer}>
                    {options.map((option) => {
                        const isSelected = tempFilters[filterKey] === option;
                        return (
                            <TouchableOpacity
                                key={option}
                                style={[
                                    styles.optionButton,
                                    isSelected && styles.optionButtonSelected
                                ]}
                                onPress={() => handleFilterSelect(filterKey, option)}
                                activeOpacity={0.7}
                            >
                                <ThemedText
                                    style={[
                                        styles.optionText,
                                        isSelected && styles.optionTextSelected
                                    ]}
                                >
                                    {option}
                                </ThemedText>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        );
    };

    /**
     * Counts active filters
     */
    const getActiveFilterCount = () => {
        return Object.values(tempFilters).filter(value => value !== undefined).length;
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="close" size={24} color="#333" />
                    </TouchableOpacity>

                    <ThemedText style={styles.headerTitle}>Filtry</ThemedText>

                    <TouchableOpacity
                        style={styles.resetButton}
                        onPress={handleReset}
                        activeOpacity={0.7}
                    >
                        <ThemedText style={styles.resetButtonText}>Wyczyść</ThemedText>
                    </TouchableOpacity>
                </View>

                {/* Filter Content */}
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {renderFilterSection('Marka', 'brand', filters.brands)}
                    {renderFilterSection('Kategoria', 'category', filters.categories)}
                    {renderFilterSection('Rozmiar', 'productSize', filters.sizes)}
                </ScrollView>

                {/* Footer */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.applyButton}
                        onPress={handleApply}
                        activeOpacity={0.8}
                    >
                        <ThemedText style={styles.applyButtonText}>
                            Zastosuj filtry
                            {getActiveFilterCount() > 0 && (
                                <ThemedText style={styles.filterCount}>
                                    {' '}({getActiveFilterCount()})
                                </ThemedText>
                            )}
                        </ThemedText>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        paddingTop: 50,
    },
    closeButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    resetButton: {
        padding: 5,
    },
    resetButtonText: {
        fontSize: 16,
        color: '#ffb300',
        fontWeight: '500',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    filterSection: {
        marginBottom: 30,
    },
    filterSectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 15,
    },
    optionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    optionButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#f9f9f9',
        marginBottom: 10,
    },
    optionButtonSelected: {
        backgroundColor: '#ffb300',
        borderColor: '#ffb300',
    },
    optionText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    optionTextSelected: {
        color: '#fff',
        fontWeight: '600',
    },
    footer: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    applyButton: {
        backgroundColor: '#ffb300',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    applyButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    filterCount: {
        fontSize: 14,
        fontWeight: '500',
        color: '#fff',
        opacity: 0.9,
    },
});