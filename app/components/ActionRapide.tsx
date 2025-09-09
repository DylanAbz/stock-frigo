// components/ActionRapide.js
import React from "react";
import {TouchableOpacity, Text} from "react-native";

export default function ActionRapide({icon: Icon, label, onPress,}: {
    icon: React.FunctionComponent;
    label: string;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={styles.actionRapideContainer}
        >
            <Icon/>
            <Text>{label}</Text>
        </TouchableOpacity>
    );
}

const styles = {
    actionRapideContainer: {
        alignItems: "center",
        backgroundColor: "#e5e5e5",
        borderRadius: 16,
        justifyContent: "center",
        flex:1,
        gap:16,
        paddingVertical:24,
    },
};