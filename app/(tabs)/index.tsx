import React, { useCallback, useState } from "react";
import { Text, TouchableOpacity, View, FlatList, StyleSheet, Image } from "react-native";
import ActionRapide from "../components/ActionRapide";
import ItemConsommation from "../components/ItemConsommation";
import { AntDesign, Entypo } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [expiringSoonProducts, setExpiringSoonProducts] = useState([]);

    const getDaysUntilExpiration = (expirationDate) => {
        const today = new Date();
        const expiry = new Date(expirationDate);
        const diffTime = expiry.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const getExpiryColor = (days) => {
        if (days <= 3) return 'red';
        if (days <= 7) return 'orange';
        return 'green';
    };

    const fetchProducts = async () => {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const items = await AsyncStorage.multiGet(keys);
            const products = items
                .map(item => ({ ...JSON.parse(item[1]), id: item[0] }))
                .filter(p => p.expirationDate)
                .map(p => ({ ...p, daysUntilExpiration: getDaysUntilExpiration(p.expirationDate) }))
                .filter(p => p.daysUntilExpiration >= 0)
                .sort((a, b) => a.daysUntilExpiration - b.daysUntilExpiration);
            setExpiringSoonProducts(products);
        } catch (e) {
            console.error(e);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchProducts();
        }, [])
    );

    const renderHeader = () => (
        <View>
            {/* Header */}
            <View style={styles.headerContainer}>
                <Text style={styles.helloText}>Bonjour!</Text>
                <TouchableOpacity>
                    <AntDesign name="bells" size={24} color="black" />
                </TouchableOpacity>
            </View>

            {/* Actions rapides */}
            <Text style={styles.partTitle}>Actions rapides</Text>
            <View style={styles.quickActionsContainer}>
                <ActionRapide icon={() => <MaterialIcons name="qr-code-scanner" size={24} color="black" />}
                    label="Scanner un article"
                    onPress={() => router.push("/(tabs)/scan")} />
                <ActionRapide icon={() => <Entypo name="box" size={24} color="black" />} label="Voir le stock"
                    onPress={() => router.push("/(tabs)/stock")} />
            </View>

            {/* Liste à consommer bientôt */}
            <Text style={styles.partTitle}>À consommer bientôt</Text>
        </View>
    );

    return (
        <View style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom, paddingLeft: insets.left + 16, paddingRight: insets.right + 16 }}>
            <FlatList
                data={expiringSoonProducts}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={renderHeader}
                renderItem={({ item }) => (
                    <ItemConsommation
                        emoji={<Image source={{ uri: item.image_url }} style={{ width: 40, height: 40, borderRadius: 8 }} defaultSource={require('@/assets/images/icon.png')} />}
                        name={item.product_name}
                        expiry={`Expire dans ${item.daysUntilExpiration} jours`}
                        color={getExpiryColor(item.daysUntilExpiration)}
                    />
                )}
                ListEmptyComponent={
                    <View>
                        {renderHeader()}
                        <Text>Aucun produit bientôt périmé.</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
    },
    helloText: {
        fontSize: 24,
        fontWeight: "bold",
    },
    partTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 12,
    },
    quickActionsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 24,
        gap: 12,
    }
});
