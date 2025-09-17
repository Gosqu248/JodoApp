import React, {useState} from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Image,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Product } from '@/types/Product';
import {apiUrl} from "@/api/apiUrl";
import { formatPrice } from '@/utils/formatters';
import ProductDetail from './ProductDetail'; // Import the new component

interface ProductItemProps {
    item: Product;
}

/**
 * ProductItem component that displays individual product information
 * Shows product image, name, brand, price, and category in horizontal layout
 */
export default function ProductItem({ item }: ProductItemProps) {
    const [modalVisible, setModalVisible] = useState(false);

    const openModal = () => setModalVisible(true);
    const closeModal = () => setModalVisible(false);

    const getImageUri = (photoId: string) => {
        return `${apiUrl}/product-photos/${photoId}/raw`;
    };

    return (
        <>
            <TouchableOpacity
                style={styles.container}
                activeOpacity={0.7}
                onPress={openModal}
            >
                {/* Product Image */}
                <View style={styles.imageContainer}>
                    {item.photoIds && item.photoIds.length > 0 ? (
                        <Image
                            source={{ uri: getImageUri(item.photoIds[0]) }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={styles.noImageContainer}>
                            <ThemedText style={styles.noImageText}>Brak zdjęcia</ThemedText>
                        </View>
                    )}

                    {/* Stock indicator */}
                    {item.quantity === 0 && (
                        <View style={styles.stockOverlay}>
                            <ThemedText style={styles.stockText}>Brak w magazynie</ThemedText>
                        </View>
                    )}

                    {/* Category badge */}
                    <View style={styles.categoryBadge}>
                        <ThemedText style={styles.categoryText} numberOfLines={1}>
                            {item.category}
                        </ThemedText>
                    </View>
                </View>

                {/* Product Information */}
                <View style={styles.infoContainer}>
                    <View style={styles.textSection}>
                        <ThemedText style={styles.brandText} numberOfLines={1}>
                            {item.brand}
                        </ThemedText>

                        <ThemedText style={styles.nameText} numberOfLines={2}>
                            {item.name}
                        </ThemedText>

                        <ThemedText style={styles.quantityText}>
                            Dostępne: {item.quantity} szt.
                        </ThemedText>
                    </View>

                    <View style={styles.priceSection}>
                        <ThemedText style={styles.sizeText}>
                            Rozmiar: {item.size}
                        </ThemedText>
                        <ThemedText style={styles.priceText}>
                            {formatPrice(item.price)} zł
                        </ThemedText>
                    </View>
                </View>
            </TouchableOpacity>

            {/* Product Detail Modal */}
            <ProductDetail
                visible={modalVisible}
                onClose={closeModal}
                product={item}
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flexDirection: 'column',
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 12,
        minHeight: 120,
        shadowOpacity: 0.15,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 2 },
        elevation: 4,
    },
    imageContainer: {
        width: '100%',
        borderRadius: 16,
        height: 200,
        backgroundColor: '#f8f9fa',
    },
    image: {
        borderRadius: 16,
        width: '100%',
        height: '100%',
    },
    noImageContainer: {
        width: '100%',
        height: '100%',
        backgroundColor: '#f5f5f5',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noImageText: {
        color: '#666',
        fontSize: 12,
        textAlign: 'center',
    },
    stockOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
    },
    stockText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    categoryBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(255, 179, 0, 0.9)',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 12,
        maxWidth: '70%',
    },
    categoryText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '600',
        textAlign: 'center',
    },
    infoContainer: {
        flex: 1,
        flexDirection: 'row',
        padding: 16,
    },
    textSection: {
        flex: 1,
        justifyContent: 'space-between',
    },
    brandText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    nameText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1a1a1a',
        lineHeight: 20,
        flex: 1,
    },
    quantityText: {
        fontSize: 11,
        color: '#666',
        marginTop: 4,
    },
    priceSection: {
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        minWidth: 80,
    },
    priceText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffb300',
        textAlign: 'right',
    },
    sizeText: {
        fontSize: 12,
        color: '#666',
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        textAlign: 'center',
        marginTop: 8,
    },
});