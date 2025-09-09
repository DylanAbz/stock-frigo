import {useSafeAreaInsets} from "react-native-safe-area-context";
import {ScrollView, View, Text, StyleSheet} from "react-native";
import { FlashList } from "@shopify/flash-list";

const DATA = [];
for (let i = 0; i < 1500; i++) {
    DATA.push({
        title: `Item ${i + 1}`,
    });
}

export default function StockScreen() {
    const insets = useSafeAreaInsets();
    return (
        <ScrollView style={{paddingTop : insets.top + 16, paddingBottom: insets.bottom + 64, paddingLeft: insets.left + 16, paddingRight: insets.right + 16, flex: 1 }}>
            <View style={{alignContent: "center", justifyContent: "center", flex: 1, flexDirection: "row"}}>
                <Text style={styles.titleText}> Mon Frigo</Text>
            </View>
            <FlashList
                data={DATA}
                renderItem={({ item }) =>
                    <Text>{item.title}</Text>
            }
            />
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    titleText: {
        fontSize: 24,
        fontWeight: "bold",
    }
})