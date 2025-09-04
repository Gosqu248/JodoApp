import { Image, Linking, StyleSheet, TouchableOpacity, View, Alert } from 'react-native'
import React, { useCallback } from 'react'
import { ThemedText } from "@/components/ThemedText";
import { SativaProduct } from "@/types/SativaProduct";

interface SativaItemProps {
    item: SativaProduct;
}

/**
 * SativaItem Component
 *
 * Displays a single Sativa product with image, title, and price.
 * Features:
 * - Product image with fallback handling
 * - Price formatting in Polish currency (zł)
 * - External link navigation to product details
 * - Error handling for invalid URLs
 * - Optimized for grid layout (48% width)
 */
const SativaItem = ({ item }: SativaItemProps) => {

    /**
     * Handle navigation to product detail page
     * Opens the product URL in the default browser with error handling
     */
    const goToProductDetail = useCallback(() => {
        if (!item.productUrl) {
            Alert.alert('Błąd', 'Link do produktu jest niedostępny');
            return;
        }

        // Validate URL format before opening
        try {
            const url = new URL(item.productUrl);
            if (url.protocol !== 'http:' && url.protocol !== 'https:') {
                return;
            }
            Linking.openURL(item.productUrl);
        } catch {
            Alert.alert('Błąd', 'Nieprawidłowy adres URL produktu');
        }
    }, [item.productUrl]);

    /**
     * Format price with proper decimal places and currency
     */
    const formatPrice = useCallback((price: number): string => {
        return `${price.toFixed(2)} zł`;
    }, []);

    return (
        <TouchableOpacity
            style={styles.productItem}
            onPress={goToProductDetail}
            activeOpacity={0.8}
            accessibilityLabel={`${item.title}, cena ${formatPrice(item.price)}`}
            accessibilityHint="Dotknij aby otworzyć szczegóły produktu"
        >
            {/* Product image with fallback background */}
            <Image
                source={{ uri: item.image }}
                style={styles.productImage}
                resizeMode="cover"
                onError={(error) => {
                    console.warn('Failed to load product image:', item.image, error.nativeEvent.error);
                }}
            />

            {/* Product information */}
            <View style={styles.productInfo}>
                <ThemedText style={styles.productTitle} numberOfLines={2}>
                    {item.title}
                </ThemedText>
                <ThemedText style={styles.productPrice}>
                    {formatPrice(item.price)}
                </ThemedText>
            </View>
        </TouchableOpacity>
    )
}

export default SativaItem;

const styles = StyleSheet.create({
    productItem: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
        // Ensure proper layout in flex containers
        alignSelf: 'stretch',
    },
    productImage: {
        width: '100%',
        height: 140,
        borderRadius: 8,
        marginBottom: 10,
        backgroundColor: '#f0f0f0', // Fallback background color
    },
    productInfo: {
        flex: 1,
        justifyContent: 'space-between',
    },
    productTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        lineHeight: 18,
        // Ensure proper text wrapping
        flexWrap: 'wrap',
    },
    productPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#e4131d',
        textAlign: 'left',
    },
});
