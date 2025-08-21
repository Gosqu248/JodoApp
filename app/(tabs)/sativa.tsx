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

export default function SativaScreen() {
    const [categories, setCategories] = useState<SativaCategory[]>([]);
    const [products, setProducts] = useState<SativaProduct[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [page, setPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState<boolean>(false);

    const fetchCategories = async () => {
        try {
            const { data } = await publicApi.get<SativaCategory[]>('/sativa-categories');
            setCategories(data);
        } finally {
            setLoading(false);
            setLoadingMore(false);
            setRefreshing(false);
        }
    };

    const fetchProducts = async (pageToLoad: number = 0, categoryId?: number) => {
        if (pageToLoad > totalPages - 1) return;

        pageToLoad === 0 ? setLoading(true) : setLoadingMore(true);

        try {
            const params: any = { page: pageToLoad, size: 10 };
            if (categoryId) {
                params.categoryId = categoryId;
            }

            const { data } = await publicApi.get<PageResponse<SativaProduct>>('/sativa-products', {
                params
            });

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
    };

    useEffect(() => {
        fetchCategories();
        fetchProducts(0);
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setPage(0);
        fetchProducts(0, selectedCategory || undefined);
    }, [selectedCategory]);

    const loadMore = () => {
        if (!loadingMore && page < totalPages - 1) {
            fetchProducts(page + 1, selectedCategory || undefined);
        }
    };

    const onCategoryPress = (categoryId: number) => {
        if (selectedCategory === categoryId) {
            setSelectedCategory(null);
            setPage(0);
            fetchProducts(0);
        } else {
            setSelectedCategory(categoryId);
            setPage(0);
            fetchProducts(0, categoryId);
        }
    };

    const renderCategory = ({ item }: ListRenderItemInfo<SativaCategory>) => (
        <CategoryItem
            key={item.id}
            item={item}
            isSelected={selectedCategory === item.id}
            onPress={() => onCategoryPress(item.id)}
        />
    );

    const renderProduct = ({ item }: ListRenderItemInfo<SativaProduct>) => (
        <SativaItem
            key={item.id}
            item={item}
        />
    );

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={styles.footer}>
                <ActivityIndicator size="small" color="#ffb300" />
            </View>
        );
    };

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

            {/* Kategorie */}
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

            {/* Produkty */}
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