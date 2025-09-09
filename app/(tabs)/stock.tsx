import { useSafeAreaInsets } from "react-native-safe-area-context";
import {ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert, Image, Modal, TextInput, Button, Platform} from "react-native";
import { FlashList } from "@shopify/flash-list";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useState } from "react";
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from "@/constants/Colors";
import DateTimePicker from '@react-native-community/datetimepicker';

export default function StockScreen() {
    const insets = useSafeAreaInsets();
    const [products, setProducts] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [editedName, setEditedName] = useState('');
    const [editedDescription, setEditedDescription] = useState('');
    const [editedExpirationDate, setEditedExpirationDate] = useState('');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

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

    const openEditModal = (product) => {
        setEditingProduct(product);
        setEditedName(product.product_name);
        setEditedDescription(product.description || '');
        setEditedExpirationDate(product.expirationDate || '');
        setDate(product.expirationDate ? new Date(product.expirationDate) : new Date());
        setIsModalVisible(true);
    };

    const handleSaveChanges = async () => {
        if (!editingProduct) return;

        try {
            const productJson = await AsyncStorage.getItem(editingProduct.id);
            if (productJson) {
                const product = JSON.parse(productJson);
                product.product_name = editedName;
                product.description = editedDescription;
                product.expirationDate = editedExpirationDate;
                await AsyncStorage.setItem(editingProduct.id, JSON.stringify(product));
                setIsModalVisible(false);
                setEditingProduct(null);
                fetchProducts();
            }
        } catch (e) {
            console.error(e);
            Alert.alert('Erreur', 'Impossible de sauvegarder les modifications.');
        }
    };

    const onDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(Platform.OS === 'ios');
        setDate(currentDate);
        setEditedExpirationDate(currentDate.toISOString().split('T')[0]);
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => openEditModal(item)}>
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
                    <TouchableOpacity onPress={(e) => {e.stopPropagation(); updateQuantity(item.id, parseInt(item.quantity) - 1)}} style={styles.quantityButton}>
                        <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity onPress={(e) => {e.stopPropagation(); updateQuantity(item.id, parseInt(item.quantity) + 1)}} style={styles.quantityButton}>
                        <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
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
            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => {
                    setIsModalVisible(!isModalVisible);
                    setEditingProduct(null);
                }}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Modifier le produit</Text>
                        <TextInput
                            style={styles.input}
                            onChangeText={setEditedName}
                            value={editedName}
                            placeholder="Nom du produit"
                        />
                        <TextInput
                            style={styles.input}
                            onChangeText={setEditedDescription}
                            value={editedDescription}
                            placeholder="Description"
                            multiline
                        />
                        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
                            <Text style={styles.datePickerButtonText}>{editedExpirationDate || "Sélectionner une date de péremption"}</Text>
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
                        <View style={styles.modalButtons}>
                            <Button title="Annuler" onPress={() => setIsModalVisible(false)} color="#ff6347" />
                            <Button title="Sauvegarder" onPress={handleSaveChanges} />
                        </View>
                    </View>
                </View>
            </Modal>
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
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '90%'
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center",
        fontSize: 20,
        fontWeight: 'bold'
    },
    input: {
        height: 50,
        borderColor: Colors.light.icon,
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: 20,
        paddingHorizontal: 15,
        fontSize: 16,
        width: '100%'
    },
    datePickerButton: {
        height: 50,
        borderColor: Colors.light.icon,
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: 20,
        justifyContent: 'center',
        paddingHorizontal: 15,
        width: '100%'
    },
    datePickerButtonText: {
        fontSize: 16,
        color: '#888',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%'
    }
});
