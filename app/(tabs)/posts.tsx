import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    View,
    ActivityIndicator,
    RefreshControl,
    FlatList,
    ListRenderItemInfo,
    StatusBar,
    Platform,
} from 'react-native';
import PostItem from '@/components/post/PostItem';
import { ThemedText } from '@/components/ThemedText';
import { publicApi } from '@/api/client';
import { Post } from '@/types/Post';
import {PageResponse} from "@/types/PageResponse";
import { apiUrl } from '@/api/apiUrl';
import {handleApiError} from "@/utils/errorHandler";
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Posts screen component that displays a paginated list of gym announcements and news
 * Features pull-to-refresh and infinite scrolling functionality
 */
export default function PostsScreen() {
    // State for managing posts data and pagination
    const [posts, setPosts] = useState<Post[]>([]);
    const [page, setPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(1);

    // State for managing loading states
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState<boolean>(false);

    /**
     * Fetches posts from the API with pagination support
     * @param pageToLoad - The page number to load (0-based)
     */
    const fetchPosts = useCallback(async (pageToLoad: number = 0) => {
        // Prevent loading if we've reached the last page
        if (pageToLoad > totalPages - 1) return;

        // Set appropriate loading state based on whether it's initial load or pagination
        if (pageToLoad === 0) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            // Fetch posts with pagination parameters
            const { data } = await publicApi.get<PageResponse<Post>>('/posts', {
                params: { page: pageToLoad, size: 5 },
            });

            // Update posts state - replace for first page, append for subsequent pages
            setPosts(prev =>
                pageToLoad === 0 ? data.content : [...prev, ...data.content]
            );
            setPage(data.pageNumber);
            setTotalPages(data.totalPages);
        } catch (error) {
            handleApiError(error);
        } finally {
            // Reset all loading states
            setLoading(false);
            setLoadingMore(false);
            setRefreshing(false);
        }
    }, [totalPages]);

    // Load initial posts when component mounts
    useEffect(() => {
        void fetchPosts(0);
    }, [fetchPosts]);

    /**
     * Handles pull-to-refresh functionality
     * Resets to first page and reloads all posts
     */
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        void fetchPosts(0);
    }, [fetchPosts]);

    /**
     * Handles infinite scrolling by loading the next page
     * Called when user reaches the end of the list
     */
    const loadMore = () => {
        if (!loadingMore && page < totalPages - 1) {
            void fetchPosts(page + 1);
        }
    };

    /**
     * Renders loading indicator at the bottom of the list during pagination
     */
    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={styles.footer}>
                <ActivityIndicator size="small" />
            </View>
        );
    };

    /**
     * Renders individual post item in the FlatList
     */
    const renderItem = ({ item }: ListRenderItemInfo<Post>) => (
        <PostItem
            key={item.id}
            id={item.id}
            title={item.title}
            description={item.content}
            photo={{ uri: `${apiUrl}/posts/${item.id}/photo` }}
            createdDate={item.createdDate}
            type={item.postType}
        />
    );

    // Show loading spinner for initial load
    if (loading && page === 0) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <SafeAreaView edges={['top']}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff"/>
                <View style={styles.header}>
                    <ThemedText style={styles.headerTitle}>🏋️ Aktualności</ThemedText>
                    <ThemedText style={styles.headerSubtitle}>
                        Bądź na bieżąco z tym co dzieje się w siłowni
                    </ThemedText>
                </View>
            </SafeAreaView>

            <View style={styles.listContainer}>
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    headerTitle: {
        fontSize: 28,
        paddingTop: 5,
        fontWeight: 'bold',
        color: '#ffb300',
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(57,56,56,0.9)',
        textAlign: 'center',
        lineHeight: 22,
        paddingTop: 5,
    },
    listContainer: {
        flex: 1,
        width: '100%',
    },
    postsContainer: { paddingTop: 5, paddingBottom: 40 },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
    },
    footer: { paddingVertical: 20 },
});