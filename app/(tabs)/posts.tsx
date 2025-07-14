import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    View,
    ActivityIndicator,
    RefreshControl,
    FlatList,
    ListRenderItemInfo,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import PostItem from '@/components/post/PostItem';
import { ThemedText } from '@/components/ThemedText';
import { publicApi } from '@/api/client';
import { Post } from '@/types/Post';
import {PageResponse} from "@/types/PageResponse";
import { apiUrl } from '@/api/apiUrl';


export default function PostsScreen() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [page, setPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState<boolean>(false);

    const fetchPosts = async (pageToLoad: number = 0) => {
        if (pageToLoad > totalPages - 1) return;

        pageToLoad === 0 ? setLoading(true) : setLoadingMore(true);

        try {
            const { data } = await publicApi.get<PageResponse<Post>>('/posts', {
                params: { page: pageToLoad, size: 5 },
            });

            setPosts(prev =>
                pageToLoad === 0 ? data.content : [...prev, ...data.content]
            );
            setPage(data.pageNumber);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error('Błąd pobierania postów:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchPosts(0);
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchPosts(0);
    }, []);

    const loadMore = () => {
        if (!loadingMore && page < totalPages - 1) {
            fetchPosts(page + 1);
        }
    };

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={styles.footer}>
                <ActivityIndicator size="small" />
            </View>
        );
    };

    const renderItem = ({ item }: ListRenderItemInfo<Post>) => (
        <PostItem
            key={item.id}
            id={item.id}
            title={item.title}
            description={item.content}
            photo={{ uri: `${apiUrl}/posts/photo/${item.id}` }}
            createdDate={item.createdDate}
            type={item.postType}
        />
    );

    if (loading && page === 0) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#ffce00', '#fbcd36']}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <ThemedText style={styles.headerTitle}>🏋️ Aktualności</ThemedText>
                <ThemedText style={styles.headerSubtitle}>
                    Bądź na bieżąco z tym co dzieje się w siłowni
                </ThemedText>
            </LinearGradient>

            <FlatList
                data={posts}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                contentContainerStyle={styles.postsContainer}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: {
        paddingTop: 60,
        paddingBottom: 10,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        paddingTop: 10,
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(57,56,56,0.9)',
        textAlign: 'center',
        lineHeight: 22,
    },
    postsContainer: { paddingTop: 20, paddingBottom: 100 },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    footer: { paddingVertical: 20 },
});
