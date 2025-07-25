import {Image, Linking, StyleSheet, TouchableOpacity, View} from 'react-native'
import React from 'react'
import {ThemedText} from "@/components/ThemedText";
import {SativaProduct} from "@/types/SativaProduct";

const SativaItem = ({
                        item
}: {item: SativaProduct}) => {

    const goToProductDetail = () => {
            if (item.productUrl) {
                Linking.openURL(item.productUrl);
            }
    }

    return (
        <TouchableOpacity style={styles.productItem} onPress={goToProductDetail}>
            <Image source={{ uri: item.image }} style={styles.productImage} />
            <View style={styles.productInfo}>
                <ThemedText style={styles.productTitle} numberOfLines={2}>
                    {item.title}
                </ThemedText>
                <ThemedText style={styles.productPrice}>
                    {item.price.toFixed(2)} zł
                </ThemedText>
            </View>
        </TouchableOpacity>
    )
}
export default SativaItem
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
    },
    productImage: {
        width: '100%',
        height: 140,
        borderRadius: 8,
        marginBottom: 10,
        backgroundColor: '#f0f0f0',
    },
    productInfo: {
        flex: 1,
    },
    productTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        lineHeight: 18,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
})
