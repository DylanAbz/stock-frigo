
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert, Image } from "react-native";
import { FlashList } from "@shopify/flash-list";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useState } from "react";
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from "@/constants/Colors";

export default function StockScreen() {
    const insets = useSafeAreaInsets();
    const [products, setProducts] = useState([]);

    const fetchProducts = async () => {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const items = await AsyncStorage.multiGet(keys);
            const productsList = items.map(item => {
                const product = JSON.parse(item[1]);
                return { ...product, id: item[0] };
            });
            setProducts(productsList);
        } catch (e) {
            console.error(e);
            Alert.alert('Erreur', 'Impossible de charger les produits.');
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchProducts();
        }, [])
    );

    const updateQuantity = async (id, newQuantity) => {
        if (newQuantity <= 0) {
            Alert.alert(
                "Supprimer le produit",
                "Voulez-vous vraiment supprimer ce produit de votre stock ?",
                [
                    { text: "Annuler", style: "cancel" },
                    {
                        text: "Supprimer", onPress: async () => {
                            await AsyncStorage.removeItem(id);
                            fetchProducts();
                        },
                        style: "destructive"
                    }
                ]
            );
        } else {
            try {
                const productJson = await AsyncStorage.getItem(id);
                if (productJson) {
                    const product = JSON.parse(productJson);
                    product.quantity = newQuantity;
                    await AsyncStorage.setItem(id, JSON.stringify(product));
                    fetchProducts();
                }
            } catch (e) {
                console.error(e);
                Alert.alert('Erreur', 'Impossible de mettre à jour la quantité.');
            }
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <Image
                source={{ uri: item.image_url }}
                style={styles.productImage}
                defaultSource={require('@/assets/images/icon.png')} // Placeholder image
            />
            <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{item.product_name}</Text>
            </View>
            <View style={styles.quantityContainer}>
                <TouchableOpacity onPress={() => updateQuantity(item.id, parseInt(item.quantity) - 1)} style={styles.quantityButton}>
                    <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>{item.quantity}</Text>
                <TouchableOpacity onPress={() => updateQuantity(item.id, parseInt(item.quantity) + 1)} style={styles.quantityButton}>
                    <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: Colors.light.background }}>
            <View style={styles.header}>
                <Text style={styles.titleText}>Mon Frigo</Text>
            </View>
            <FlashList
                data={products}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                estimatedItemSize={80}
                ListEmptyComponent={<Text style={styles.emptyText}>Votre frigo est vide.</Text>}
                contentContainerStyle={styles.listContent}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    titleText: {
        fontSize: 24,
        fontWeight: "bold",
        color: Colors.light.text,
    },
    listContent: {
        paddingHorizontal: 16,
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.icon,
    },
    productImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginRight: 16,
    },
    itemInfo: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 16,
        color: Colors.light.text,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantityButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: Colors.light.tint,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 10,
    },
    quantityButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    quantityText: {
        fontSize: 16,
        fontWeight: 'bold',
        minWidth: 30,
        textAlign: 'center',
        color: Colors.light.text,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: Colors.light.text,
    }
});
