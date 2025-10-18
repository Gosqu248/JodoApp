import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    View,
    ActivityIndicator,
    RefreshControl,
    FlatList,
    ListRenderItemInfo,
    StatusBar,
    Image, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { publicApi } from '@/api/client';
import { SativaProduct } from '@/types/SativaProduct';
import { SativaCategory } from '@/types/SativaCategory';
import { PageResponse } from "@/types/PageResponse";
import SativaItem from "@/components/sativa/SativaItem";
import CategoryItem from "@/components/sativa/CategoryItem";

/**
 * Sativa Life screen component that displays wellness products with category filtering
 * Features category-based filtering, pagination, and product browsing functionality
 */
export default function SativaScreen() {
    // State for managing categories and products data
    const [categories, setCategories] = useState<SativaCategory[]>([]);
    const [products, setProducts] = useState<SativaProduct[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

    // State for managing pagination
    const [page, setPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(1);

    // State for managing loading states
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Fetches available product categories from the API
     * Called once on component mount to populate category filter
     */
    const fetchCategories = useCallback(async () => {
        try {
            setError(null);
            const { data } = await publicApi.get<SativaCategory[]>('/sativa-categories');
            setCategories(data);
        } catch  {
            setError('Błąd podczas pobierania kategorii');
        }
    }, []);

    /**
     * Fetches products from the API with pagination and optional category filtering
     * @param pageToLoad - The page number to load (0-based)
     * @param categoryId - Optional category ID to filter products
     * @param isRefresh - Whether this is a refresh operation
     */
    const fetchProducts = useCallback(async (
        pageToLoad: number = 0,
        categoryId?: number | null,
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

            // Build API parameters with pagination and optional category filter
            const params: Record<string, any> = {
                page: pageToLoad,
                size: 10
            };

            // Only add categoryId if it's not null
            if (categoryId !== null && categoryId !== undefined) {
                params.categoryId = categoryId;
            }

            // Fetch products with applied filters
            const { data } = await publicApi.get<PageResponse<SativaProduct>>('/sativa-products', {
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
    }, [totalPages]);

    // Load initial data when component mounts
    useEffect(() => {
        fetchCategories();
        fetchProducts(0);
    }, [fetchCategories]);

    /**
     * Handles pull-to-refresh functionality
     * Resets to first page and reloads products with current filter
     */
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setPage(0);
        setTotalPages(1); // Reset totalPages to allow refresh
        fetchProducts(0, selectedCategory, true);
    }, [selectedCategory, fetchProducts]);

    /**
     * Handles infinite scrolling by loading the next page
     * Called when user reaches the end of the product list
     */
    const loadMore = useCallback(() => {
        if (!loadingMore && !loading && page + 1 < totalPages) {
            fetchProducts(page + 1, selectedCategory);
        }
    }, [loadingMore, loading, page, totalPages, selectedCategory, fetchProducts]);

    /**
     * Handles category selection and filtering
     * Toggles category filter - if same category is selected, removes filter
     * @param categoryId - The ID of the category to filter by
     */
    const onCategoryPress = useCallback((categoryId: number) => {

        if (selectedCategory === categoryId) {
            // Deselect category and show all products
            setSelectedCategory(null);
            setPage(0);
            setTotalPages(1); // Reset to allow new fetch
            fetchProducts(0, null, true);
        } else {
            // Select new category and filter products
            setSelectedCategory(categoryId);
            setPage(0);
            setTotalPages(1); // Reset to allow new fetch
            fetchProducts(0, categoryId, true);
        }
    }, [selectedCategory, fetchProducts]);

    /**
     * Renders individual category item in the horizontal category list
     */
    const renderCategory = ({ item }: ListRenderItemInfo<SativaCategory>) => (
        <CategoryItem
            key={item.id}
            item={item}
            isSelected={selectedCategory === item.id}
            onPress={() => onCategoryPress(item.id)}
        />
    );

    /**
     * Renders individual product item in the products grid
     */
    const renderProduct = ({ item }: ListRenderItemInfo<SativaProduct>) => (
        <SativaItem
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
            <View style={styles.errorContainer}>
                <ThemedText style={styles.errorText}>{error}</ThemedText>
            </View>
        );
    };

    /**
     * Renders empty state when no products are found
     */
    const renderEmptyState = () => {
        if (loading) return null;
        return (
            <View style={styles.emptyContainer}>
                <ThemedText style={styles.emptyText}>
                    {selectedCategory
                        ? 'Brak produktów w tej kategorii'
                        : 'Brak dostępnych produktów'
                    }
                </ThemedText>
            </View>
        );
    };

    // Show loading spinner for initial load
    if (loading && products.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff"/>
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color="#ffb300" />
                    <ThemedText style={styles.loadingText}>Ładowanie produktów...</ThemedText>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff"/>

            {/* Header section with logo and subtitle */}
            <View style={styles.header}>
                <Image
                    source={require('@/assets/images/sativaLife.png')}
                    style={styles.headerLogo}
                    resizeMode="contain"
                />
                <ThemedText style={styles.headerSubtitle}>
                    Znajdź najlepsze produkty dla siebie
                </ThemedText>
            </View>

            {/* Error display */}
            {renderError()}

            {/* Categories section with horizontal scrollable list */}
            <View style={styles.categoriesSection}>
                <ThemedText style={styles.sectionTitle}>Kategorie</ThemedText>
                <FlatList
                    data={categories}
                    renderItem={renderCategory}
                    keyExtractor={item => item.id.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesContainer}
                />
            </View>

            {/* Products section with grid layout and infinite scroll */}
            <View style={styles.productsSection}>
                <ThemedText style={styles.sectionTitle}>
                    {selectedCategory ? 'Produkty z kategorii' : 'Wszystkie produkty'}
                    {products.length > 0 && (
                        <ThemedText style={styles.productCount}> ({products.length})</ThemedText>
                    )}
                </ThemedText>
                <FlatList
                    data={products}
                    renderItem={renderProduct}
                    keyExtractor={item => item.id.toString()}
                    numColumns={2}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.3}
                    ListFooterComponent={renderFooter}
                    ListEmptyComponent={renderEmptyState}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#ffb300']}
                            tintColor="#ffb300"
                        />
                    }
                    contentContainerStyle={[
                        styles.productsContainer,
                        products.length === 0 && styles.emptyProductsContainer
                    ]}
                    columnWrapperStyle={products.length > 0 ? styles.productRow : undefined}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        marginBottom: 20,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    header: {
        paddingBottom: 15,
        paddingHorizontal: 15,
    },
    headerLogo: {
        width: 200,
        height: 60,
        alignSelf: 'center',
        marginTop: 10,
        marginBottom: 5,
    },
    headerTitle: {
        paddingTop: 10,
        fontSize: 28,
        fontWeight: 'bold',
        color: '#4CAF50',
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(57,56,56,0.9)',
        textAlign: 'center',
        lineHeight: 22,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
        paddingHorizontal: 15,
    },
    productCount: {
        fontSize: 16,
        fontWeight: 'normal',
        color: '#666',
    },
    categoriesSection: {
        marginBottom: 20,
    },
    categoriesContainer: {
        paddingHorizontal: 10,
    },
    productsSection: {
        flex: 1,
    },
    productsContainer: {
        paddingHorizontal: 15,
        paddingBottom: 20,
    },
    emptyProductsContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    productRow: {
        width: '100%',
        justifyContent: 'space-between',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    footer: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    errorContainer: {
        backgroundColor: '#ffebee',
        padding: 15,
        marginHorizontal: 15,
        marginBottom: 15,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#f44336',
    },
    errorText: {
        color: '#c62828',
        fontSize: 14,
        textAlign: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
});