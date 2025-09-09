// components/ItemConsommation.js
import React from "react";
import {View, Text, Appearance} from "react-native";

export default function ItemConsommation({ emoji, name, expiry, color }) {
    const styles = {
        itemContainer: {
            flexDirection: "row",
            alignItems: "center",
            padding: 16,
            backgroundColor: "#f5f5f5",
            borderRadius: 12,
            marginBottom: 12,
            gap: 16,
            borderColor: Appearance.getColorScheme() === "dark" ? "#fff" : "#9f9f9f",
            borderWidth: 0.5,
        },
    };
    return (
        <View style={styles.itemContainer}>
            <Text>{emoji}</Text>
            <View>
                <Text>{name}</Text>
                <Text style={{color}}>{expiry}</Text>
            </View>
        </View>
    );
}

