import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import {Button, ScrollView, StyleSheet, Text, View, TextInput, Image, Alert, TouchableOpacity, Platform} from 'react-native';
import {useSafeAreaInsets} from "react-native-safe-area-context";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/Colors';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function ScanScreen() {
    const insets = useSafeAreaInsets();
    const [permission, requestPermission] = useCameraPermissions();
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState('1');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [expirationDate, setExpirationDate] = useState('');
    const [barcode, setBarcode] = useState(null);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isManualEntry, setIsManualEntry] = useState(false);
    const [manualProductName, setManualProductName] = useState('');
    const [manualProductDescription, setManualProductDescription] = useState('');

    const handleBarCodeScanned = async ({ type, data }) => {
        setBarcode(data);
        try {
            const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${data}?fields=product_name,brands,image_url`);
            const productData = await response.json();
            if (productData.status === 1 && productData.product.product_name) {
                setProduct(productData.product);
                setIsFormVisible(true);
            } else {
                setIsManualEntry(true);
            }
        } catch (error) {
            console.error(error);
            setIsManualEntry(true);
        }
    };

    const saveProduct = async () => {
        if (!product || !barcode) return;

        try {
            const productToSave = {
                ...product,
                quantity: quantity,
                expirationDate: expirationDate,
            };
            await AsyncStorage.setItem(barcode, JSON.stringify(productToSave));
            Alert.alert('Produit enregistré!');
            setIsFormVisible(false);
            setProduct(null);
            setQuantity('1');
            setExpirationDate('');
            setDate(new Date());
            setBarcode(null);
        } catch (e) {
            console.error(e);
            Alert.alert('Erreur', 'Impossible d\'enregistrer le produit.');
        }
    };

    const saveManualProduct = async () => {
        if (!manualProductName || !barcode) return;

        try {
            const productToSave = {
                product_name: manualProductName,
                description: manualProductDescription,
                quantity: quantity,
                expirationDate: expirationDate,
            };
            await AsyncStorage.setItem(barcode, JSON.stringify(productToSave));
            Alert.alert('Produit enregistré!');
            setIsManualEntry(false);
            setManualProductName('');
            setManualProductDescription('');
            setQuantity('1');
            setExpirationDate('');
            setDate(new Date());
            setBarcode(null);
        } catch (e) {
            console.error(e);
            Alert.alert('Erreur', 'Impossible d\'enregistrer le produit.');
        }
    };

    const onDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(Platform.OS === 'ios');
        setDate(currentDate);
        setExpirationDate(currentDate.toISOString().split('T')[0]);
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
                    <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
                        <Text style={styles.datePickerButtonText}>{expirationDate || "Sélectionner une date de péremption"}</Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                        <DateTimePicker
                            testID="dateTimePicker"
                            value={date}
                            mode={'date'}
                            is24Hour={true}
                            display="default"
                            onChange={onDateChange}
                        />
                    )}
                    <TouchableOpacity style={styles.button} onPress={saveProduct}>
                        <Text style={styles.buttonText}>Valider</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, styles.buttonOutline]} onPress={() => {
                        setIsFormVisible(false);
                        setProduct(null);
                        setQuantity('1');
                        setExpirationDate('');
                        setDate(new Date());
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

    const renderManualEntryForm = () => (
        <View style={styles.container}>
            <View style={styles.formContainer}>
                <Text style={styles.titleText}>Produit non trouvé</Text>
                <Text style={styles.helperText}>Veuillez saisir les informations manuellement.</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={setManualProductName}
                    value={manualProductName}
                    placeholder="Nom du produit"
                />
                <TextInput
                    style={styles.input}
                    onChangeText={setManualProductDescription}
                    value={manualProductDescription}
                    placeholder="Description"
                />
                <TextInput
                    style={styles.input}
                    onChangeText={setQuantity}
                    value={quantity}
                    placeholder="Quantité"
                    keyboardType="numeric"
                />
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
                    <Text style={styles.datePickerButtonText}>{expirationDate || "Sélectionner une date de péremption"}</Text>
                </TouchableOpacity>
                {showDatePicker && (
                    <DateTimePicker
                        testID="dateTimePicker"
                        value={date}
                        mode={'date'}
                        is24Hour={true}
                        display="default"
                        onChange={onDateChange}
                    />
                )}
                <TouchableOpacity style={styles.button} onPress={saveManualProduct}>
                    <Text style={styles.buttonText}>Enregistrer</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.buttonOutline]} onPress={() => {
                    setIsManualEntry(false);
                    setManualProductName('');
                    setManualProductDescription('');
                    setQuantity('1');
                    setExpirationDate('');
                    setDate(new Date());
                    setBarcode(null);
                }}>
                    <Text style={styles.buttonOutlineText}>Retour</Text>
                </TouchableOpacity>
            </View>
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

    if (isManualEntry) {
        return renderManualEntryForm();
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
        marginBottom: 20,
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
    datePickerButton: {
        height: 50,
        borderColor: Colors.light.icon,
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: 20,
        justifyContent: 'center',
        paddingHorizontal: 15,
    },
    datePickerButtonText: {
        fontSize: 16,
        color: '#888',
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