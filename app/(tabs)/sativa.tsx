import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    View,
    ActivityIndicator,
    RefreshControl,
    FlatList,
    ListRenderItemInfo,
    SafeAreaView,
    StatusBar,
    Image, Platform,
} from 'react-native';
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

    /**
     * Fetches available product categories from the API
     * Called once on component mount to populate category filter
     */
    const fetchCategories = useCallback(async () => {
        try {
            const { data } = await publicApi.get<SativaCategory[]>('/sativa-categories');
            setCategories(data);
        } catch (error) {
            // Handle error appropriately (could add error handling here)
            console.error('Error fetching categories:', error);
        } finally {
            // Reset loading states (note: this might be unnecessary here)
            setLoading(false);
            setLoadingMore(false);
            setRefreshing(false);
        }
    }, []);

    /**
     * Fetches products from the API with pagination and optional category filtering
     * @param pageToLoad - The page number to load (0-based)
     * @param categoryId - Optional category ID to filter products
     */
    const fetchProducts = useCallback(async (pageToLoad: number = 0, categoryId?: number) => {
        // Prevent loading if we've reached the last page
        if (pageToLoad > totalPages - 1) return;

        // Set appropriate loading state based on whether it's initial load or pagination
        if (pageToLoad === 0) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }
        
        try {
            // Build API parameters with pagination and optional category filter
            const params: any = { page: pageToLoad, size: 10 };
            if (categoryId) {
                params.categoryId = categoryId;
            }

            // Fetch products with applied filters
            const { data } = await publicApi.get<PageResponse<SativaProduct>>('/sativa-products', {
                params
            });

            // Update products state - replace for first page, append for subsequent pages
            setProducts(prev =>
                pageToLoad === 0 ? data.content : [...prev, ...data.content]
            );
            setPage(data.pageNumber);
            setTotalPages(data.totalPages);
        }  finally {
            setLoading(false);
            setLoadingMore(false);
            setRefreshing(false);
        }
    }, [totalPages]);

    // Load initial data when component mounts
    useEffect(() => {
        fetchCategories();
        fetchProducts(0);
    }, [fetchCategories, fetchProducts]);

    /**
     * Handles pull-to-refresh functionality
     * Resets to first page and reloads products with current filter
     */
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setPage(0);
        fetchProducts(0, selectedCategory || undefined);
    }, [selectedCategory, fetchProducts]);

    /**
     * Handles infinite scrolling by loading the next page
     * Called when user reaches the end of the product list
     */
    const loadMore = useCallback(() => {
        if (!loadingMore && page < totalPages - 1) {
            fetchProducts(page + 1, selectedCategory || undefined);
        }
    }, [loadingMore, page, totalPages, selectedCategory, fetchProducts]);

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
            fetchProducts(0);
        } else {
            // Select new category and filter products
            setSelectedCategory(categoryId);
            setPage(0);
            fetchProducts(0, categoryId);
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

    // Show loading spinner for initial load
    if (loading && page === 0) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#ffb300" />
            </View>
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
                </ThemedText>
                <FlatList
                    data={products}
                    renderItem={renderProduct}
                    keyExtractor={item => item.id.toString()}
                    numColumns={2}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#ffb300']}
                        />
                    }
                    contentContainerStyle={styles.productsContainer}
                    columnWrapperStyle={styles.productRow}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
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

    // Kategorie
    categoriesSection: {
        marginBottom: 20,
    },
    categoriesContainer: {
        paddingHorizontal: 10,
    },
    // Produkty
    productsSection: {
        flex: 1,
    },
    productsContainer: {
        paddingHorizontal: 15,
        paddingBottom: 20,
    },
    productRow: {
        width: '100%',
        justifyContent: 'space-between',
    },
    // Inne
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    footer: {
        paddingVertical: 20,
        alignItems: 'center',
    },
});