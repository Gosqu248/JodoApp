import {Image, StyleSheet, TouchableOpacity} from 'react-native'
import React from 'react'
import {ThemedText} from "@/components/ThemedText";
import {SativaCategory} from "@/types/SativaCategory";

const CategoryItem = ({
                item,
                isSelected,
                onPress
}: { item: SativaCategory; isSelected: boolean; onPress: () => void}) => {
    return (
        <TouchableOpacity
            style={[
                styles.categoryItem,
                isSelected && styles.selectedCategory
            ]}
            onPress={onPress}
        >
            <Image source={{ uri: item.img }} style={styles.categoryImage} />
            <ThemedText style={[
                styles.categoryName,
                isSelected && styles.selectedCategoryText
            ]}>
                {item.name}
            </ThemedText>
        </TouchableOpacity>
    );
}
export default CategoryItem
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
        backgroundColor: '#4CAF50',
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
