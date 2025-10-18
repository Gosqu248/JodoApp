import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Modal,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
    Alert,
    Linking,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Product } from '@/types/Product';
import { apiUrl } from "@/api/apiUrl";
import { formatPrice } from '@/utils/formatters';

interface ProductDetailProps {
    visible: boolean;
    onClose: () => void;
    product: Product;
}

const { width: screenWidth } = Dimensions.get('window');

export default function ProductDetail({ visible, onClose, product }: ProductDetailProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imagesLoaded, setImagesLoaded] = useState(false);

    useEffect(() => {
        if (visible) {
            setCurrentImageIndex(0);
            setImagesLoaded(false);
            // Simulate image loading
            setTimeout(() => setImagesLoaded(true), 500);
        }
    }, [visible]);

    const getImageUri = (photoId: string) => {
        return `${apiUrl}/product-photos/${photoId}/raw`;
    };

    const hasMultipleImages = () => {
        return product.photoIds && product.photoIds.length > 1;
    };

    const canGoToPrevious = () => {
        return currentImageIndex > 0;
    };

    const canGoToNext = () => {
        return product.photoIds && currentImageIndex < product.photoIds.length - 1;
    };

    const previousImage = () => {
        if (canGoToPrevious()) {
            setCurrentImageIndex(prev => prev - 1);
        }
    };

    const nextImage = () => {
        if (canGoToNext()) {
            setCurrentImageIndex(prev => prev + 1);
        }
    };

    const goToImage = (index: number) => {
        if (product.photoIds && index >= 0 && index < product.photoIds.length) {
            setCurrentImageIndex(index);
        }
    };

    const handleCall = () => {
        if (product.quantity === 0) return;

        const phoneNumber = '+48506896450';
        Linking.openURL(`tel:${phoneNumber}`).catch(() => {
            Alert.alert('Błąd', 'Nie można wykonać połączenia');
        });
    };

    const getCurrentImage = () => {
        if (!product.photoIds || product.photoIds.length === 0) return null;
        return getImageUri(product.photoIds[currentImageIndex]);
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
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <ThemedText style={styles.closeButtonText}>×</ThemedText>
                    </TouchableOpacity>
                    <ThemedText style={styles.headerTitle}>Szczegóły produktu</ThemedText>
                    <View style={styles.headerSpacer} />
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>


                    {/* Image Section */}
                    <View style={styles.imageSection}>
                        <View style={styles.mainImageContainer}>
                            {!imagesLoaded ? (
                                <View style={styles.imageLoading}>
                                    <ThemedText style={styles.loadingText}>Ładowanie...</ThemedText>
                                </View>
                            ) : getCurrentImage() ? (
                                <>
                                    <Image
                                        source={{ uri: getCurrentImage()! }}
                                        style={styles.mainImage}
                                        resizeMode="cover"
                                    />

                                    {hasMultipleImages() && (
                                        <>
                                            <TouchableOpacity
                                                style={[styles.navArrow, styles.navArrowLeft]}
                                                onPress={previousImage}
                                                disabled={!canGoToPrevious()}
                                            >
                                                <ThemedText style={styles.navArrowText}>‹</ThemedText>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.navArrow, styles.navArrowRight]}
                                                onPress={nextImage}
                                                disabled={!canGoToNext()}
                                            >
                                                <ThemedText style={styles.navArrowText}>›</ThemedText>
                                            </TouchableOpacity>
                                        </>
                                    )}
                                </>
                            ) : (
                                <View style={styles.noImage}>
                                    <ThemedText style={styles.noImageText}>📷</ThemedText>
                                    <ThemedText style={styles.noImageLabel}>Brak zdjęcia</ThemedText>
                                </View>
                            )}
                        </View>

                        {hasMultipleImages() && (
                            <>
                                <ScrollView
                                    horizontal
                                    style={styles.thumbnailGallery}
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.thumbnailContainer}
                                >
                                    {product.photoIds?.map((photoId, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={[
                                                styles.thumbnail,
                                                currentImageIndex === index && styles.thumbnailActive
                                            ]}
                                            onPress={() => goToImage(index)}
                                        >
                                            <Image
                                                source={{ uri: getImageUri(photoId) }}
                                                style={styles.thumbnailImage}
                                                resizeMode="cover"
                                            />
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>

                                <View style={styles.imageCounter}>
                                    <ThemedText style={styles.imageCounterText}>
                                        {currentImageIndex + 1} / {product.photoIds?.length}
                                    </ThemedText>
                                </View>
                            </>
                        )}
                    </View>

                    {/* Info Section */}
                    <View style={styles.infoSection}>
                        <View style={styles.productHeader}>
                            <ThemedText style={styles.brand}>{product.brand}</ThemedText>
                            <ThemedText style={styles.productTitle}>{product.name}</ThemedText>
                        </View>

                        <View style={styles.priceContainer}>
                            <View style={styles.discountSection}>
                                <ThemedText style={styles.priceLabel}>Cena:</ThemedText>
                                <ThemedText style={styles.price}>{formatPrice(product.price)} zł</ThemedText>
                            </View>
                            <View style={styles.discountSection}>
                                <ThemedText style={styles.regularText}>Cena regularna:</ThemedText>
                                <ThemedText style={styles.regularPriceText}>{formatPrice(product.regularPrice)} zł</ThemedText>
                                <ThemedText style={styles.discountText}>-{product.discountPercentage}%</ThemedText>
                            </View>
                        </View>

                        <View style={styles.detailsGrid}>
                            <View style={styles.detailItem}>
                                <ThemedText style={styles.detailIcon}>🏷️</ThemedText>
                                <ThemedText style={styles.detailText}>{product.category}</ThemedText>
                            </View>
                            <View style={styles.detailItem}>
                                <ThemedText style={styles.detailIcon}>📏</ThemedText>
                                <ThemedText style={styles.detailText}>Rozmiar {product.size}</ThemedText>
                            </View>
                        </View>

                        <View style={styles.availabilitySection}>
                            {product.quantity > 0 ? (
                                <View style={styles.availabilityInStock}>
                                    <ThemedText style={styles.availabilityIcon}>✅</ThemedText>
                                    <ThemedText style={styles.availabilityText}>
                                        Dostępny ({product.quantity} szt.)
                                    </ThemedText>
                                </View>
                            ) : (
                                <View style={styles.availabilityOutOfStock}>
                                    <ThemedText style={styles.availabilityIcon}>❌</ThemedText>
                                    <ThemedText style={styles.availabilityText}>
                                        Produkt niedostępny
                                    </ThemedText>
                                </View>
                            )}
                        </View>

                        {product.description && (
                            <View style={styles.descriptionSection}>
                                <ThemedText style={styles.descriptionTitle}>Opis produktu</ThemedText>
                                <ThemedText style={styles.description}>{product.description}</ThemedText>
                            </View>
                        )}

                        <View style={styles.actionButtons}>
                            <ThemedText style={styles.actionText}>
                                Masz pytania? Chętnie pomożemy!
                            </ThemedText>

                            <TouchableOpacity
                                style={[
                                    styles.contactButton,
                                    product.quantity === 0 && styles.contactButtonDisabled
                                ]}
                                onPress={handleCall}
                                disabled={product.quantity === 0}
                            >
                                <ThemedText style={styles.contactButtonIcon}>📞</ThemedText>
                                <ThemedText style={styles.contactButtonText}>
                                    Zadzwoń do nas! +48 506 896 450
                                </ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
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
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    closeButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        flex: 1,
        textAlign: 'center',
    },
    headerSpacer: {
        width: 40,
    },
    content: {
        flex: 1,
    },
    breadcrumb: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    breadcrumbText: {
        fontSize: 14,
        color: '#666',
    },
    breadcrumbSeparator: {
        fontSize: 14,
        color: '#666',
    },
    breadcrumbCurrent: {
        fontSize: 14,
        color: '#ffb300',
        fontWeight: '500',
    },
    imageSection: {
        paddingHorizontal: 16,
        marginTop: 16,
        marginBottom: 24,
    },
    mainImageContainer: {
        width: '100%',
        height: screenWidth - 32,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#f1f1f1',
        position: 'relative',
        marginBottom: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainImage: {
        width: '100%',
        height: '100%',
    },
    imageLoading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 14,
        color: '#666',
    },
    noImage: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noImageText: {
        fontSize: 48,
        marginBottom: 8,
    },
    noImageLabel: {
        fontSize: 14,
        color: '#666',
    },
    navArrow: {
        position: 'absolute',
        top: '50%',
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -22,
    },
    navArrowLeft: {
        left: 12,
    },
    navArrowRight: {
        right: 12,
    },
    navArrowText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    thumbnailGallery: {
        marginBottom: 12,
        alignSelf: 'center',
    },
    thumbnailContainer: {
        paddingHorizontal: 4,
        minWidth: screenWidth - 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    thumbnail: {
        width: 60,
        height: 60,
        borderRadius: 8,
        overflow: 'hidden',
        marginHorizontal: 4,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    thumbnailActive: {
        borderColor: '#ffb300',
    },
    thumbnailImage: {
        width: '100%',
        height: '100%',
    },
    imageCounter: {
        alignSelf: 'center',
        backgroundColor: '#f1f1f1',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    imageCounterText: {
        fontSize: 12,
        color: '#666',
    },
    infoSection: {
        paddingHorizontal: 16,
        paddingBottom: 32,
    },
    productHeader: {
        marginBottom: 20,
    },
    brand: {
        fontSize: 12,
        color: '#888',
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    productTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#222',
        lineHeight: 28,
    },
    priceContainer: {
        flexDirection: 'column',
        alignItems: 'baseline',
        backgroundColor: '#f9f9f9',
        padding: 16,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#ffb300',
        marginBottom: 20,
    },
    discountSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginTop: 4,
    },
    regularText: {
        fontSize: 11,
        color: '#878686',
    },
    regularPriceText: {
        fontSize: 14,
        color: '#6a6969',
        textDecorationLine: 'line-through',
    },
    discountText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#ff0707',
    },
    priceLabel: {
        fontSize: 16,
        color: '#555',
        marginRight: 8,
    },
    price: {
        paddingVertical: 4,
        fontSize: 28,
        fontWeight: '800',
        color: '#ffb300',
    },
    detailsGrid: {
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    detailIcon: {
        fontSize: 16,
        marginRight: 12,
    },
    detailText: {
        fontSize: 16,
        color: '#333',
    },
    availabilitySection: {
        marginBottom: 20,
    },
    availabilityInStock: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    availabilityOutOfStock: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    availabilityIcon: {
        fontSize: 16,
        marginRight: 8,
    },
    availabilityText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#388e3c',
    },
    descriptionSection: {
        marginBottom: 24,
    },
    descriptionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
        borderBottomWidth: 2,
        borderBottomColor: '#eee',
        paddingBottom: 8,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        color: '#555',
    },
    actionButtons: {
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 20,
    },
    actionText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 16,
    },
    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffb300',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginBottom: 12,
    },
    contactButtonDisabled: {
        backgroundColor: '#e0e0e0',
    },
    contactButtonIcon: {
        fontSize: 16,
        marginRight: 8,
    },
    contactButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        flex: 1,
        textAlign: 'center',
    },
});