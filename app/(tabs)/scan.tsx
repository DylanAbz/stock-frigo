import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import {Button, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets} from "react-native-safe-area-context";

export default function ScanScreen() {
    const insets = useSafeAreaInsets();
    const [permission, requestPermission] = useCameraPermissions();

    if (!permission) {
        // Camera permissions are still loading.
        return <View/>;
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet.
        return (
            <ScrollView style={{paddingTop : insets.top + 16, paddingBottom: insets.bottom + 64, paddingLeft: insets.left + 16, paddingRight: insets.right + 16, flex: 1 }}>
                <Text>We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title="grant permission"/>
            </ScrollView>
        );
    }

    return (
        <ScrollView style={{paddingTop : insets.top + 16, paddingBottom: insets.bottom + 64, paddingLeft: insets.left + 16, paddingRight: insets.right + 16, flex: 1 }}>
            <Text style={styles.titleText}>Scanner</Text>
            <CameraView facing={"back"}/>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    titleText: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: 'center',
    },
});