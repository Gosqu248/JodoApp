import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    View,
    ActivityIndicator,
    RefreshControl,
    FlatList,
    ListRenderItemInfo,
    StatusBar,
    TouchableOpacity,
    ImageBackground, Platform,
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { publicApi } from '@/api/client';
import { Product } from '@/types/Product';
import { ProductFilters, FilterState } from '@/types/ProductFilters';
import { PageResponse } from "@/types/PageResponse";
import ProductItem from "@/components/shop/ProductItem";
import FilterComponent from "@/components/shop/FilterComponent";
import { Ionicons } from '@expo/vector-icons';
import ParallaxScrollView from "@/components/ui/ParallaxScrollView";

/**
 * Shop screen component that displays products with filtering and parallax view
 * Features product filtering, pagination, and product browsing functionality
 */
export default function ShopScreen() {
    // State for managing products data and filters
    const [products, setProducts] = useState<Product[]>([]);
    const [filters, setFilters] = useState<ProductFilters>({
        brands: [],
        categories: [],
        sizes: []
    });
    const [selectedFilters, setSelectedFilters] = useState<FilterState>({});

    // State for managing pagination
    const [page, setPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(1);

    // State for managing loading states
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // State for filter modal
    const [showFilters, setShowFilters] = useState<boolean>(false);

    /**
     * Fetches available product filters from the API
     * Called once on component mount to populate filter options
     */
    const fetchFilters = useCallback(async () => {
        try {
            setError(null);
            const { data } = await publicApi.get<ProductFilters>('/products/filters');
            setFilters(data);
        } catch {
            setError('Błąd podczas pobierania filtrów');
        }
    }, []);

    /**
     * Fetches products from the API with pagination and optional filtering
     * @param pageToLoad - The page number to load (0-based)
     * @param filterState - Optional filter state to apply
     * @param isRefresh - Whether this is a refresh operation
     */
    const fetchProducts = useCallback(async (
        pageToLoad: number = 0,
        filterState?: FilterState,
        isRefresh: boolean = false
    ) => {
        // Prevent loading if we've reached the last page (unless it's a refresh or first page)
        if (pageToLoad > 0 && pageToLoad >= totalPages && !isRefresh) {
            return;
        }

        try {
            setError(null);

            // Set appropriate loading state based on whether it's initial load or pagination
            if (pageToLoad === 0 || isRefresh) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            // Build API parameters with pagination and optional filters
            const params: Record<string, any> = {
                page: pageToLoad,
                size: 10,
            };

            // Add filter parameters if they exist
            const currentFilters = filterState || selectedFilters;
            if (currentFilters.brand) {
                params.brand = currentFilters.brand;
            }
            if (currentFilters.category) {
                params.category = currentFilters.category;
            }
            if (currentFilters.productSize) {
                params.productSize = currentFilters.productSize;
            }

            // Fetch products with applied filters
            const { data } = await publicApi.get<PageResponse<Product>>('/products', {
                params
            });

            // Update products state - replace for first page, append for subsequent pages
            if (pageToLoad === 0 || isRefresh) {
                setProducts(data.content);
            } else {
                setProducts(prev => [...prev, ...data.content]);
            }

            setPage(data.pageNumber);
            setTotalPages(data.totalPages);

        } catch {
            setError('Błąd podczas pobierania produktów');
        } finally {
            // Reset all loading states
            setLoading(false);
            setLoadingMore(false);
            setRefreshing(false);
        }
    }, [totalPages, selectedFilters]);

    // Load initial data when component mounts
    useEffect(() => {
        fetchFilters();
        fetchProducts(0);
    }, [fetchFilters]);

    /**
     * Handles pull-to-refresh functionality
     * Resets to first page and reloads products with current filters
     */
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setPage(0);
        setTotalPages(1); // Reset totalPages to allow refresh
        fetchProducts(0, selectedFilters, true);
    }, [selectedFilters, fetchProducts]);

    /**
     * Handles infinite scrolling by loading the next page
     * Called when user reaches the end of the product list
     */
    const loadMore = useCallback(() => {
        if (!loadingMore && !loading && page + 1 < totalPages) {
            fetchProducts(page + 1, selectedFilters);
        }
    }, [loadingMore, loading, page, totalPages, selectedFilters, fetchProducts]);

    /**
     * Handles filter application
     * @param newFilters - The new filter state to apply
     */
    const onApplyFilters = useCallback((newFilters: FilterState) => {
        setSelectedFilters(newFilters);
        setPage(0);
        setTotalPages(1); // Reset to allow new fetch
        setShowFilters(false);
        fetchProducts(0, newFilters, true);
    }, [fetchProducts]);

    /**
     * Handles filter reset
     */
    const onResetFilters = useCallback(() => {
        const emptyFilters: FilterState = {};
        setSelectedFilters(emptyFilters);
        setPage(0);
        setTotalPages(1); // Reset to allow new fetch
        setShowFilters(false);
        fetchProducts(0, emptyFilters, true);
    }, [fetchProducts]);

    /**
     * Renders individual product item in the products list
     */
    const renderProduct = ({ item }: ListRenderItemInfo<Product>) => (
        <ProductItem
            key={item.id}
            item={item}
        />
    );

    /**
     * Renders loading indicator at the bottom of the product list during pagination
     */
    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={styles.footer}>
                <ActivityIndicator size="small" color="#ffb300" />
            </View>
        );
    };

    /**
     * Renders error message when there's an error
     */
    const renderError = () => {
        if (!error) return null;
        return (
            <ThemedView style={styles.errorContainer}>
                <ThemedText style={styles.errorText}>{error}</ThemedText>
            </ThemedView>
        );
    };

    /**
     * Renders empty state when no products are found
     */
    const renderEmptyState = () => {
        if (loading) return null;
        return (
            <ThemedView style={styles.emptyContainer}>
                <ThemedText style={styles.emptyText}>
                    Brak dostępnych produktów
                </ThemedText>
            </ThemedView>
        );
    };

    /**
     * Get active filter count for display
     */
    const getActiveFilterCount = () => {
        return Object.values(selectedFilters).filter(value => value !== undefined && value !== '').length;
    };

    /**
     * Check if any filters are active
     */
    const hasActiveFilters = () => {
        return getActiveFilterCount() > 0;
    };

    // Show loading spinner for initial load
    if (loading && products.length === 0) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <StatusBar barStyle="light-content" backgroundColor="#2c5530"/>
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color="#ffb300" />
                    <ThemedText style={styles.loadingText}>Ładowanie produktów...</ThemedText>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#2c5530"/>

            <ParallaxScrollView
                headerBackgroundColor={{ light: '#ffffff', dark: '#656565' }}
                headerImage={
                    <ImageBackground
                        source={require('@/assets/images/shoes.webp')}
                        style={styles.headerImageBackground}
                        imageStyle={styles.headerImage}
                    >
                        <View style={styles.headerOverlay}>
                            <ThemedText style={styles.heroTitle}>
                                Oryginalne Buty w
                            </ThemedText>
                            <ThemedText style={[styles.heroTitle, styles.heroHighlight]}>
                                Super Cenie
                            </ThemedText>
                            <ThemedText style={styles.heroSubtitle}>
                                Znajdź idealne obuwie dla siebie
                            </ThemedText>
                        </View>
                    </ImageBackground>
                }
            >
                {/* Error display */}
                {renderError()}

                {/* Active filters indicator */}
                {getActiveFilterCount() > 0 && (
                    <ThemedView style={styles.activeFiltersContainer}>
                        <ThemedText style={styles.activeFiltersText}>
                            Aktywne filtry: {getActiveFilterCount()}
                        </ThemedText>
                        <TouchableOpacity
                            style={styles.clearFiltersButton}
                            onPress={onResetFilters}
                            activeOpacity={0.7}
                        >
                            <ThemedText style={styles.clearFiltersText}>Wyczyść</ThemedText>
                        </TouchableOpacity>
                    </ThemedView>
                )}

                {/* Products section */}
                <ThemedView style={styles.productsSection}>
                    <ThemedText style={styles.sectionTitle}>
                        {hasActiveFilters() ? 'Produkty z filtrami' : 'Wszystkie produkty'}
                        {products.length > 0 && (
                            <ThemedText style={styles.productCount}> ({products.length})</ThemedText>
                        )}
                    </ThemedText>

                    {products.length > 0 ? (
                        <FlatList
                            data={products}
                            renderItem={renderProduct}
                            keyExtractor={item => item.id}
                            numColumns={1}
                            onEndReached={loadMore}
                            onEndReachedThreshold={0.3}
                            ListFooterComponent={renderFooter}
                            scrollEnabled={false}
                            contentContainerStyle={styles.productsContainer}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={onRefresh}
                                    colors={['#ffb300']}
                                    tintColor="#ffb300"
                                />
                            }
                        />
                    ) : (
                        renderEmptyState()
                    )}
                </ThemedView>
            </ParallaxScrollView>

            {/* Fixed Filter Button */}
            <TouchableOpacity
                style={[
                    styles.filterButton,
                    getActiveFilterCount() > 0 && styles.filterButtonActive
                ]}
                onPress={() => setShowFilters(true)}
                activeOpacity={0.8}
            >
                <Ionicons name="filter" size={24} color="#fff" />
                {getActiveFilterCount() > 0 && (
                    <View style={styles.filterBadge}>
                        <ThemedText style={styles.filterBadgeText}>
                            {getActiveFilterCount()}
                        </ThemedText>
                    </View>
                )}
            </TouchableOpacity>

            {/* Filter Modal */}
            <FilterComponent
                visible={showFilters}
                filters={filters}
                selectedFilters={selectedFilters}
                onApply={onApplyFilters}
                onReset={onResetFilters}
                onClose={() => setShowFilters(false)}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    headerImageBackground: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    headerImage: {
    },
    headerOverlay: {
        backgroundColor: 'rgba(0,0,0,0.35)',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        marginHorizontal: 20,
        marginBottom: 10,
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        paddingVertical: 10,
        textShadowColor: 'rgba(0,0,0,0.29)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    heroHighlight: {
        color: '#ffb300',
    },
    heroSubtitle: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
        opacity: 0.9,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    activeFiltersContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff3e0',
        padding: 12,
        marginHorizontal: -32,
        marginTop: -16,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#ffb300',
    },
    activeFiltersText: {
        fontSize: 14,
        color: '#f57c00',
        fontWeight: '500',
    },
    clearFiltersButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#ffb300',
        borderRadius: 6,
    },
    clearFiltersText: {
        fontSize: 12,
        color: '#fff',
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginBottom: 20,
    },
    productCount: {
        fontSize: 16,
        fontWeight: 'normal',
        color: '#666',
    },
    productsSection: {
        flex: 1,
    },
    productsContainer: {
        paddingHorizontal: 10,
        paddingBottom: 20,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    footer: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    errorContainer: {
        backgroundColor: '#ffebee',
        padding: 16,
        marginHorizontal: -32,
        marginTop: -16,
        marginBottom: 16,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#f44336',
    },
    errorText: {
        color: '#c62828',
        fontSize: 14,
        textAlign: 'center',
        fontWeight: '500',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    filterButton: {
        position: 'absolute',
        bottom: Platform.OS === 'android' ? 30 : 100,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#ffb300',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    filterButtonActive: {
        backgroundColor: '#f57c00',
    },
    filterBadge: {
        position: 'absolute',
        top: -2,
        right: -2,
        backgroundColor: '#d32f2f',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    filterBadgeText: {
        fontSize: 12,
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});