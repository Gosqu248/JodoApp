import { Image, StyleSheet, TouchableOpacity } from 'react-native'
import React, { useCallback } from 'react'
import { ThemedText } from "@/components/ThemedText";
import { SativaCategory } from "@/types/SativaCategory";

interface CategoryItemProps {
    item: SativaCategory;
    isSelected: boolean;
    onPress: () => void;
}

/**
 * CategoryItem Component
 *
 * Displays a category item with image and name in a horizontal scrollable list.
 * Features:
 * - Category image with fallback handling
 * - Visual feedback for selected state
 * - Accessible button with proper labels
 * - Responsive design with minimum width
 * - Smooth selection animations
 */
const CategoryItem = ({ item, isSelected, onPress }: CategoryItemProps) => {

    /**
     * Handle category selection with proper callback optimization
     */
    const handlePress = useCallback(() => {
        onPress();
    }, [onPress]);

    /**
     * Handle image loading errors gracefully
     */
    const handleImageError = useCallback((error: any) => {
        console.warn('Failed to load category image:', item.img, error.nativeEvent.error);
    }, [item.img]);

    return (
        <TouchableOpacity
            style={[
                styles.categoryItem,
                isSelected && styles.selectedCategory
            ]}
            onPress={handlePress}
            activeOpacity={0.7}
            accessibilityLabel={`Kategoria ${item.name}`}
            accessibilityState={{ selected: isSelected }}
            accessibilityHint="Dotknij aby wybrać tę kategorię"
        >
            {/* Category image with error handling */}
            <Image
                source={{ uri: item.img }}
                style={styles.categoryImage}
                resizeMode="contain"
                onError={handleImageError}
            />

            {/* Category name with dynamic styling based on selection */}
            <ThemedText style={[
                styles.categoryName,
                isSelected && styles.selectedCategoryText
            ]}>
                {item.name}
            </ThemedText>
        </TouchableOpacity>
    );
}

export default CategoryItem;
const styles = StyleSheet.create({
    categoryItem: {
        alignItems: 'center',
        marginHorizontal: 5,
        padding: 10,
        borderRadius: 12,
        backgroundColor: '#f5f5f5',
        minWidth: 80,
    },
    selectedCategory: {
        backgroundColor: '#e4131d',
    },
    categoryImage: {
        width: 50,
        height: 50,
        marginBottom: 8,
    },
    categoryName: {
        fontSize: 12,
        fontWeight: '500',
        color: '#333',
        textAlign: 'center',
    },
    selectedCategoryText: {
        color: '#fff',
    },
})
