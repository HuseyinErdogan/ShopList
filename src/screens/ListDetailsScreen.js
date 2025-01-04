import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Dimensions, Platform, Image } from 'react-native';
import { Text, IconButton, FAB, Card, Portal, Modal, TextInput, Button } from 'react-native-paper';
import { getListItems, updateListItems } from '../utils/storage';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import * as ImagePicker from 'expo-image-picker';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';

const ITEM_WIDTH = 80;
const SCREEN_WIDTH = Dimensions.get('window').width;
const CONTAINER_PADDING = 20;
const ITEM_SPACING = 4;

const CustomCheckbox = ({ checked, onPress }) => {
  const progress = useSharedValue(checked ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(checked ? 1 : 0, {
      damping: 15,
      stiffness: 150,
    });
  }, [checked]);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = withSpring(progress.value === 1 ? 1 : 0.8, {
      damping: 15,
      stiffness: 150,
    });

    return {
      transform: [{ scale }],
      backgroundColor: interpolateColor(
        progress.value,
        [0, 1],
        ['#FFF8E3', '#E6A4B4']
      ),
    };
  });

  return (
    <TouchableOpacity onPress={onPress} style={styles.checkboxContainer}>
      <Animated.View style={[styles.checkbox, animatedStyle]}>
        {checked && (
          <IconButton
            icon="check"
            size={16}
            color="#FFF8E3"
            style={styles.checkIcon}
          />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const ListDetailsScreen = ({ route, navigation }) => {
  const { listId, listTitle, note } = route.params;
  const [items, setItems] = useState([]);
  const [visible, setVisible] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('pcs');
  const [selectedImage, setSelectedImage] = useState(null);
  const [description, setDescription] = useState('');
  const scrollViewRef = useRef(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const units = [
    { label: 'pcs', value: 'pcs' },
    { label: 'kg', value: 'kg' },
    { label: 'g', value: 'g' },
    { label: 'L', value: 'L' },
    { label: 'ml', value: 'ml' },
  ];

  useEffect(() => {
    loadItems();
  }, [listId]);

  const loadItems = async () => {
    const loadedItems = await getListItems(listId);
    setItems(loadedItems);
  };

  const toggleItem = async (id) => {
    const updatedItems = items.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setItems(updatedItems);
    await updateListItems(listId, updatedItems);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const addItem = async () => {
    if (!newItemName.trim()) return;

    const newItem = {
      id: Date.now().toString(),
      name: newItemName.trim(),
      quantity: `${quantity} ${unit}`,
      checked: false,
      image: selectedImage,
      description: description.trim(),
    };

    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    await updateListItems(listId, updatedItems);

    setNewItemName('');
    setQuantity('1');
    setUnit('pcs');
    setSelectedImage(null);
    setDescription('');
    setVisible(false);
  };

  const handleUnitSelect = (selectedUnit, index) => {
    setUnit(selectedUnit);
    const offset = index * (ITEM_WIDTH + ITEM_SPACING * 2) - (SCREEN_WIDTH - ITEM_WIDTH) / 2 + CONTAINER_PADDING;
    scrollViewRef.current?.scrollTo({ x: offset, animated: true });
  };

  const renderUnitSelector = () => (
    <View style={styles.unitSelectorWrapper}>
      <ScrollView 
        ref={scrollViewRef}
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.unitSelectorContainer,
          Platform.OS === 'android' && { paddingHorizontal: (SCREEN_WIDTH - ITEM_WIDTH) / 2 }
        ]}
        snapToInterval={ITEM_WIDTH + ITEM_SPACING * 2}
        decelerationRate="fast"
        {...(Platform.OS === 'ios' ? {
          contentInset: {
            left: (SCREEN_WIDTH - ITEM_WIDTH) / 2 - CONTAINER_PADDING,
            right: (SCREEN_WIDTH - ITEM_WIDTH) / 2 - CONTAINER_PADDING,
          },
          contentOffset: { x: 0, y: 0 }
        } : {})}
      >
        {units.map((unitItem, index) => (
          <TouchableOpacity
            key={unitItem.value}
            style={[
              styles.unitItem,
              unit === unitItem.value && styles.selectedUnitItem
            ]}
            onPress={() => handleUnitSelect(unitItem.value, index)}
          >
            <Text style={[
              styles.unitText,
              unit === unitItem.value && styles.selectedUnitText
            ]}>
              {unitItem.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const deleteItem = async (id) => {
    const updatedItems = items.filter(item => item.id !== id);
    setItems(updatedItems);
    await updateListItems(listId, updatedItems);
  };

  const startEditing = (item) => {
    setEditingItem(item);
    setNewItemName(item.name);
    const [qty, unt] = item.quantity.split(' ');
    setQuantity(qty);
    setUnit(unt);
    setSelectedImage(item.image);
    setDescription(item.description || '');
    setVisible(true);
  };

  const editItem = async () => {
    if (!newItemName.trim() || !editingItem) return;

    const updatedItems = items.map(item => 
      item.id === editingItem.id 
        ? {
            ...item,
            name: newItemName.trim(),
            quantity: `${quantity} ${unit}`,
            image: selectedImage || item.image,
            description: description.trim(),
          }
        : item
    );

    setItems(updatedItems);
    await updateListItems(listId, updatedItems);
    setEditingItem(null);
    setNewItemName('');
    setQuantity('1');
    setUnit('pcs');
    setSelectedImage(null);
    setDescription('');
    setVisible(false);
  };

  const showItemDetails = (item) => {
    setSelectedItem(item);
    setDetailsModalVisible(true);
  };

  const renderRightActions = (progress, dragX, item) => {
    return (
      <View style={styles.swipeActionsContainer}>
        <View style={styles.swipeAction}>
          <TouchableOpacity 
            onPress={() => startEditing(item)}
            style={[styles.actionButton, styles.editButton]}>
            <IconButton icon="pencil" size={20} color="#FFF8E3" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => deleteItem(item.id)}
            style={[styles.actionButton, styles.deleteButton]}>
            <IconButton icon="delete" size={20} color="#FFF8E3" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <IconButton
            icon="arrow-left"
            size={24}
            color="#FFF8E3"
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.header}>{listTitle}</Text>
          <IconButton
            icon="share-variant-outline"
            size={24}
            color="#FFF8E3"
            onPress={() => console.log('Share')}
          />
        </View>
        {note && (
          <Text style={styles.noteText}>{note}</Text>
        )}
      </View>

      <GestureHandlerRootView style={{ flex: 1 }}>
        {items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No items in this list</Text>
            <Text style={styles.emptySubText}>Add your first item by tapping the + button</Text>
          </View>
        ) : (
          <ScrollView style={styles.listContainer}>
            {items.map((item) => (
              <Swipeable
                key={item.id}
                renderRightActions={(progress, dragX) => 
                  renderRightActions(progress, dragX, item)
                }
                rightThreshold={40}
                friction={2}
                overshootRight={false}>
                <TouchableOpacity
                  onPress={() => showItemDetails(item)}>
                  <Card style={styles.itemCard}>
                    <Card.Content style={styles.itemContent}>
                      <View style={styles.itemLeft}>
                        <CustomCheckbox
                          checked={item.checked}
                          onPress={() => toggleItem(item.id)}
                        />
                        {item.image && (
                          <Image 
                            source={{ uri: item.image }} 
                            style={styles.itemImage} 
                          />
                        )}
                        <View style={styles.itemTextContainer}>
                          <Text style={[
                            styles.itemName,
                            item.checked && styles.checkedItem
                          ]}>{item.name}</Text>
                          {item.description ? (
                            <Text style={styles.itemDescription} numberOfLines={1}>
                              {item.description}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                      <Text style={styles.quantity}>{item.quantity}</Text>
                    </Card.Content>
                  </Card>
                </TouchableOpacity>
              </Swipeable>
            ))}
          </ScrollView>
        )}
      </GestureHandlerRootView>

      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => {
            setVisible(false);
            setEditingItem(null);
            setNewItemName('');
            setQuantity('1');
            setUnit('pcs');
            setSelectedImage(null);
            setDescription('');
          }}
          contentContainerStyle={styles.modalContainer}>
          <ScrollView>
            <Text style={styles.modalTitle}>
              {editingItem ? 'Edit Item' : 'Add New Item'}
            </Text>
            <TouchableOpacity 
              style={styles.imagePickerButton} 
              onPress={pickImage}
            >
              {selectedImage ? (
                <Image 
                  source={{ uri: selectedImage }} 
                  style={styles.selectedImage} 
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <IconButton icon="camera" size={24} color="#E6A4B4" />
                  <Text style={styles.imagePlaceholderText}>Add Photo</Text>
                </View>
              )}
            </TouchableOpacity>
            <TextInput
              label="Item Name"
              value={newItemName}
              onChangeText={setNewItemName}
              style={styles.input}
              mode="outlined"
            />
            <View style={styles.quantityContainer}>
              <Text style={styles.inputLabel}>Quantity</Text>
              <TextInput
                value={quantity}
                onChangeText={setQuantity}
                style={styles.quantityInput}
                mode="outlined"
                keyboardType="numeric"
              />
              {renderUnitSelector()}
            </View>
            <TextInput
              label="Description (Optional)"
              value={description}
              onChangeText={setDescription}
              style={[styles.input, styles.descriptionInput]}
              mode="outlined"
              multiline
              numberOfLines={3}
            />
            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => {
                  setVisible(false);
                  setEditingItem(null);
                  setNewItemName('');
                  setQuantity('1');
                  setUnit('pcs');
                  setSelectedImage(null);
                  setDescription('');
                }}
                style={styles.modalButton}
                textColor="#E6A4B4">
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={editingItem ? editItem : addItem}
                style={[styles.modalButton, styles.addButton]}
                buttonColor="#E6A4B4"
                textColor="#FFF8E3">
                {editingItem ? 'Save Changes' : 'Add Item'}
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>

      <Portal>
        <Modal
          visible={detailsModalVisible}
          onDismiss={() => {
            setDetailsModalVisible(false);
            setSelectedItem(null);
          }}
          contentContainerStyle={styles.detailsModalContainer}>
          {selectedItem && (
            <Card style={styles.detailsCard}>
              {selectedItem.image && (
                <Card.Cover source={{ uri: selectedItem.image }} style={styles.detailsImage} />
              )}
              <Card.Content style={styles.detailsCardContent}>
                <Text style={styles.detailsTitle}>{selectedItem.name}</Text>
                <Text style={styles.detailsQuantity}>Quantity: {selectedItem.quantity}</Text>
                {selectedItem.description && (
                  <>
                    <Text style={styles.descriptionLabel}>Description:</Text>
                    <Text style={styles.descriptionText}>{selectedItem.description}</Text>
                  </>
                )}
              </Card.Content>
              <Card.Actions style={styles.detailsCardActions}>
                <Button
                  mode="contained"
                  onPress={() => setDetailsModalVisible(false)}
                  buttonColor="#E6A4B4"
                  textColor="#FFF8E3"
                  style={styles.detailsCloseButton}>
                  Close
                </Button>
              </Card.Actions>
            </Card>
          )}
        </Modal>
      </Portal>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setVisible(true)}
        color="#FFF8E3"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5EEE6',
  },
  headerContainer: {
    backgroundColor: '#E6A4B4',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF8E3',
    textAlign: 'center',
    flex: 1,
  },
  noteText: {
    color: '#FFF8E3',
    fontSize: 14,
    marginTop: 8,
    marginLeft: 48,
    marginRight: 48,
    opacity: 0.9,
  },
  listContainer: {
    flex: 1,
    padding: 14,
  },
  itemCard: {
    marginBottom: 12,
    backgroundColor: '#FFF8E3',
    elevation: 2,
    borderRadius: 12,
    marginHorizontal: 2,
  },
  itemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    height: 56,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    marginLeft: 8,
    color: '#333',
    transition: 'all 0.3s ease',
  },
  checkedItem: {
    textDecorationLine: 'line-through',
    color: '#999',
    fontStyle: 'italic',
  },
  quantity: {
    fontSize: 14,
    color: '#E6A4B4',
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 16,
    backgroundColor: '#E6A4B4',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
  },
  modalContainer: {
    backgroundColor: '#F5EEE6',
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#FFF8E3',
  },
  inputLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  unitSelectorWrapper: {
    height: 60,
    justifyContent: 'center',
  },
  unitSelectorContainer: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  unitItem: {
    width: ITEM_WIDTH,
    paddingVertical: 10,
    marginHorizontal: ITEM_SPACING,
    borderRadius: 20,
    backgroundColor: '#FFF8E3',
    borderWidth: 1,
    borderColor: '#E6A4B4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedUnitItem: {
    backgroundColor: '#E6A4B4',
  },
  unitText: {
    fontSize: 16,
    color: '#E6A4B4',
    fontWeight: '500',
  },
  selectedUnitText: {
    color: '#FFF8E3',
  },
  quantityContainer: {
    marginBottom: 24,
  },
  quantityInput: {
    marginBottom: 16,
    backgroundColor: '#FFF8E3',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
  addButton: {
    borderColor: '#E6A4B4',
  },
  swipeActionsContainer: {
    width: 160,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 56,
    marginBottom: 12,
    marginLeft: 2,
  },
  swipeAction: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 2,
  },
  actionButton: {
    width: 79,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  editButton: {
    backgroundColor: '#F3D7CA',
  },
  deleteButton: {
    backgroundColor: '#E6A4B4',
  },
  imagePickerButton: {
    width: '100%',
    height: 120,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFF8E3',
    borderWidth: 1,
    borderColor: '#E6A4B4',
    borderStyle: 'dashed',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: '#E6A4B4',
    fontSize: 14,
    marginTop: 4,
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 8,
  },
  itemTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  itemDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  descriptionInput: {
    marginBottom: 24,
    backgroundColor: '#FFF8E3',
    height: 80,
  },
  detailsModalContainer: {
    margin: 20,
  },
  detailsCard: {
    backgroundColor: '#F5EEE6',
    overflow: 'hidden',
  },
  detailsImage: {
    backgroundColor: '#F5EEE6',
    height: Dimensions.get('window').width - 40,
    width: Dimensions.get('window').width - 40,
  },
  detailsCardContent: {
    padding: 16,
  },
  detailsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  detailsQuantity: {
    fontSize: 18,
    color: '#E6A4B4',
    marginBottom: 16,
  },
  descriptionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  detailsCardActions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  detailsCloseButton: {
    flex: 1,
  },
  checkboxContainer: {
    marginRight: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E6A4B4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    margin: 0,
    padding: 0,
  },
  swipeableContainer: {
    overflow: 'hidden',
  },
});

export default ListDetailsScreen; 