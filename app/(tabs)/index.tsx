// screens/HomeScreen.js
import React from "react";
import {ScrollView, Text, TouchableOpacity, View} from "react-native";
import ActionRapide from "../components/ActionRapide";
import ItemConsommation from "../components/ItemConsommation";
import {AntDesign, Entypo} from "@expo/vector-icons";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {useRouter} from "expo-router";

export default function HomeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <ScrollView style={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16, paddingLeft: insets.left + 16, paddingRight: insets.right + 16, flex: 1}}>
            {/* Header */}
            <View style={styles.headerContainer}>
                <Text style={styles.helloText}>Bonjour!</Text>
                <TouchableOpacity>
                    <AntDesign name="bells" size={24} color="black"/>
                </TouchableOpacity>
            </View>

            {/* Bloc vide (message / actu) */}
            <View/>

            {/* Actions rapides */}
            <Text style={styles.partTitle}>Actions rapides</Text>
            <View style={styles.quickActionsContainer}>
                <ActionRapide icon={() => <MaterialIcons name="qr-code-scanner" size={24} color="black" />}
                              label="Scanner un article"
                              onPress={() => router.push("/scan")}
                />
                <ActionRapide icon={() => <Entypo name="box" size={24} color="black"/>} label="Voir le stock"
                              onPress={() => router.push("/stock")}
                />
            </View>

            {/* Liste à consommer bientôt */}
            <Text style={styles.partTitle}>À consommer bientôt</Text>
            <ItemConsommation
                emoji="🍎"
                name="Pommes"
                expiry="Expire dans 2 jours"
                color="red"
            />
            <ItemConsommation
                emoji="🥛"
                name="Lait"
                expiry="Expire dans 5 jours"
                color="orange"
            />
        </ScrollView>
    );
}
const styles = {
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
    partTitle : {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 12,
    },
    quickActionsContainer : {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 24,
        gap: 12,
    }
}
