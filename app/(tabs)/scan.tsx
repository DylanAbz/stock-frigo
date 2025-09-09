import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import {Button, ScrollView, StyleSheet, Text, View, TextInput, Image, Alert, TouchableOpacity} from 'react-native';
import {useSafeAreaInsets} from "react-native-safe-area-context";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/Colors';

export default function ScanScreen() {
    const insets = useSafeAreaInsets();
    const [permission, requestPermission] = useCameraPermissions();
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState('1');
    const [barcode, setBarcode] = useState(null);
    const [isFormVisible, setIsFormVisible] = useState(false);

    const handleBarCodeScanned = async ({ type, data }) => {
        setBarcode(data);
        try {
            const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${data}?fields=product_name,brands,image_url`);
            const productData = await response.json();
            if (productData.status === 1) {
                setProduct(productData.product);
                setIsFormVisible(true);
            } else {
                setProduct({ product_name: 'Produit non trouvé' });
                setIsFormVisible(true);
            }
        } catch (error) {
            console.error(error);
            setProduct({ product_name: 'Erreur lors de la récupération du produit' });
            setIsFormVisible(true);
        }
    };

    const saveProduct = async () => {
        if (!product || !barcode) return;

        try {
            const productToSave = {
                ...product,
                quantity: quantity,
            };
            await AsyncStorage.setItem(barcode, JSON.stringify(productToSave));
            Alert.alert('Produit enregistré!');
            setIsFormVisible(false);
            setProduct(null);
            setQuantity('1');
            setBarcode(null);
        } catch (e) {
            console.error(e);
            Alert.alert('Erreur', 'Impossible d\'enregistrer le produit.');
        }
    };

    const renderScanner = () => (
        <View style={styles.container}>
            <Text style={styles.titleText}>Scanner un produit</Text>
            <View style={styles.cameraContainer}>
                <CameraView
                    style={styles.camera}
                    facing={"back"}
                    onBarcodeScanned={handleBarCodeScanned}
                />
            </View>
            <Text style={styles.helperText}>Veuillez scanner le code-barres de votre produit.</Text>
        </View>
    );

    const renderForm = () => (
        <View style={styles.container}>
            {product ? (
                <View style={styles.formContainer}>
                    <Text style={styles.productName}>{product.product_name}</Text>
                    {product.image_url && (
                        <Image source={{ uri: product.image_url }} style={styles.productImage} />
                    )}
                    <TextInput
                        style={styles.input}
                        onChangeText={setQuantity}
                        value={quantity}
                        placeholder="Quantité"
                        keyboardType="numeric"
                    />
                    <TouchableOpacity style={styles.button} onPress={saveProduct}>
                        <Text style={styles.buttonText}>Valider</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, styles.buttonOutline]} onPress={() => {
                        setIsFormVisible(false);
                        setProduct(null);
                        setQuantity('1');
                        setBarcode(null);
                    }}>
                        <Text style={styles.buttonOutlineText}>Retour</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <Text style={styles.productName}>Chargement...</Text>
            )}
        </View>
    );

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

    return isFormVisible ? renderForm() : renderScanner();
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    titleText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.light.text,
        marginBottom: 20,
    },
    cameraContainer: {
        width: '100%',
        aspectRatio: 1,
        overflow: 'hidden',
        borderRadius: 20,
        marginBottom: 20,
    },
    camera: {
        flex: 1,
    },
    helperText: {
        fontSize: 16,
        color: Colors.light.text,
        textAlign: 'center',
    },
    formContainer: {
        width: '100%',
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    productName: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        color: Colors.light.text,
    },
    productImage: {
        width: 150,
        height: 150,
        alignSelf: 'center',
        marginBottom: 20,
        borderRadius: 10,
    },
    input: {
        height: 50,
        borderColor: Colors.light.icon,
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: 20,
        paddingHorizontal: 15,
        fontSize: 16,
    },
    button: {
        backgroundColor: Colors.light.tint,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonText: {
        color: Colors.light.background,
        fontSize: 16,
        fontWeight: 'bold',
    },
    buttonOutline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: Colors.light.tint,
    },
    buttonOutlineText: {
        color: Colors.light.tint,
        fontSize: 16,
        fontWeight: 'bold',
    },
});
