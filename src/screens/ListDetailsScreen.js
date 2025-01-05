import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { MaterialCommunityIcons } from '@expo/vector-icons';

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

const AddItemForm = React.memo(({ onSubmit, onClose, editingItem = null }) => {
  const [formData, setFormData] = useState({
    name: editingItem?.name || '',
    quantity: editingItem?.quantity?.split(' ')[0] || '1',
    unit: editingItem?.quantity?.split(' ')[1] || 'pcs',
    image: editingItem?.image || null,
    description: editingItem?.description || ''
  });

  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSubmit = useCallback(() => {
    if (!formData.name.trim()) return;

    const item = {
      id: editingItem?.id || Date.now().toString(),
      name: formData.name.trim(),
      quantity: `${formData.quantity} ${formData.unit}`,
      checked: editingItem?.checked || false,
      image: formData.image,
      description: formData.description.trim()
    };

    onSubmit(item);
  }, [formData, editingItem, onSubmit]);

  const handleImagePick = useCallback(async () => {
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
      handleChange('image', result.assets[0].uri);
    }
  }, []);

  const units = [
    { label: 'pcs', value: 'pcs' },
    { label: 'kg', value: 'kg' },
    { label: 'g', value: 'g' },
    { label: 'L', value: 'L' },
    { label: 'ml', value: 'ml' }
  ];

  return (
    <View style={styles.modalContent}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>
          {editingItem ? 'Edit Item' : 'Add New Item'}
        </Text>
        <IconButton
          icon="close"
          size={24}
          iconColor="#666"
          onPress={onClose}
        />
      </View>

      <View style={styles.formContainer}>
        <TouchableOpacity 
          style={styles.imagePickerButton} 
          onPress={handleImagePick}
        >
          {formData.image ? (
            <Image 
              source={{ uri: formData.image }} 
              style={styles.selectedImage} 
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <IconButton 
                icon="camera" 
                size={24} 
                color="#E6A4B4"
                style={{ margin: 0 }}
              />
              <Text style={styles.imagePlaceholderText}>Add Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Item Name</Text>
          <TextInput
            value={formData.name}
            onChangeText={(value) => handleChange('name', value)}
            style={styles.input}
            placeholder="Enter item name"
            placeholderTextColor="#999"
            mode="outlined"
            outlineColor="#E6A4B4"
            activeOutlineColor="#E6A4B4"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Quantity</Text>
          <View style={styles.quantityRow}>
            <TextInput
              value={formData.quantity}
              onChangeText={(value) => handleChange('quantity', value)}
              style={[styles.input, { flex: 0.4 }]}
              placeholder="Enter quantity"
              placeholderTextColor="#999"
              mode="outlined"
              outlineColor="#E6A4B4"
              activeOutlineColor="#E6A4B4"
              keyboardType="numeric"
            />
            <View style={styles.unitSelector}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.unitSelectorScroll}
              >
                {units.map((unit) => (
                  <TouchableOpacity
                    key={unit.value}
                    style={[
                      styles.unitButton,
                      formData.unit === unit.value && styles.selectedUnitButton
                    ]}
                    onPress={() => handleChange('unit', unit.value)}
                  >
                    <Text style={[
                      styles.unitButtonText,
                      formData.unit === unit.value && styles.selectedUnitButtonText
                    ]}>
                      {unit.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Description (Optional)</Text>
          <TextInput
            value={formData.description}
            onChangeText={(value) => handleChange('description', value)}
            style={[styles.input, styles.descriptionInput]}
            placeholder="Add a description"
            placeholderTextColor="#999"
            mode="outlined"
            outlineColor="#E6A4B4"
            activeOutlineColor="#E6A4B4"
            multiline
            numberOfLines={3}
          />
        </View>
      </View>

      <View style={styles.modalFooter}>
        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.submitButton}
          buttonColor="#E6A4B4"
          textColor="#FFF8E3"
        >
          {editingItem ? 'Save Changes' : 'Add Item'}
        </Button>
      </View>
    </View>
  );
});

const EmptyState = () => (
  <View style={styles.emptyStateContainer}>
    <MaterialCommunityIcons name="cart-outline" size={120} color="#E6A4B4" />
    <Text style={styles.emptyStateTitle}>Your shopping list is empty</Text>
    <Text style={styles.emptyStateSubtitle}>Add some items to get started!</Text>
  </View>
);

const ListDetailsScreen = ({ route, navigation }) => {
  const { listId, listTitle, note } = route.params;
  const [items, setItems] = useState([]);
  const [visible, setVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

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

  const handleSubmitItem = async (item) => {
    const updatedItems = editingItem 
      ? items.map(i => i.id === item.id ? item : i)
      : [...items, item];
    
    setItems(updatedItems);
    await updateListItems(listId, updatedItems);
    setVisible(false);
    setEditingItem(null);
  };

  const deleteItem = async (id) => {
    const updatedItems = items.filter(item => item.id !== id);
    setItems(updatedItems);
    await updateListItems(listId, updatedItems);
  };

  const startEditing = (item) => {
    setEditingItem(item);
    setVisible(true);
  };

  const showItemDetails = (item) => {
    setSelectedItem(item);
    setDetailsModalVisible(true);
  };

  const renderRightActions = (progress, dragX, item) => {
    return (
      <View style={styles.swipeActionsContainer}>
        <TouchableOpacity 
          onPress={() => startEditing(item)}
          style={[styles.actionButton, styles.editButton]}>
          <IconButton 
            icon="pencil" 
            size={24} 
            iconColor="#FFF8E3" 
            style={{ margin: 0, width: 56, height: 56 }} 
          />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => deleteItem(item.id)}
          style={[styles.actionButton, styles.deleteButton]}>
          <IconButton 
            icon="delete" 
            size={24} 
            iconColor="#FFF8E3" 
            style={{ margin: 0, width: 56, height: 56 }} 
          />
        </TouchableOpacity>
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

      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => {
            setVisible(false);
            setEditingItem(null);
          }}
          contentContainerStyle={styles.modalContainer}>
          <ScrollView>
            <AddItemForm
              onSubmit={handleSubmitItem}
              onClose={() => {
                setVisible(false);
                setEditingItem(null);
              }}
              editingItem={editingItem}
            />
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

      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <ScrollView style={styles.scrollView}>
          <GestureHandlerRootView>
            {items.map((item) => (
              <Swipeable
                key={item.id}
                renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}
                rightThreshold={40}
              >
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
          </GestureHandlerRootView>
        </ScrollView>
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {
          setEditingItem(null);
          setVisible(true);
        }}
        color="#FFF8E3"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5EEE6',
    borderTopWidth: 0,
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
    height: 56,
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
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF8E3',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(230, 164, 180, 0.2)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E6A4B4',
    letterSpacing: 0.5,
  },
  formContainer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 90 : 80,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF8E3',
    fontSize: 16,
    height: 40,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unitSelector: {
    flex: 1,
    height: 40,
  },
  unitSelectorScroll: {
    flexDirection: 'row',
    paddingHorizontal: 4,
  },
  unitButton: {
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FFF8E3',
    borderWidth: 1,
    borderColor: '#E6A4B4',
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  selectedUnitButton: {
    backgroundColor: '#E6A4B4',
  },
  unitButtonText: {
    fontSize: 14,
    color: '#E6A4B4',
    fontWeight: '500',
  },
  selectedUnitButtonText: {
    color: '#FFF8E3',
  },
  descriptionInput: {
    height: 100,
  },
  imagePickerButton: {
    width: '80%',
    aspectRatio: 1,
    maxHeight: 200,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFF8E3',
    borderWidth: 1,
    borderColor: '#E6A4B4',
    borderStyle: 'dashed',
    alignSelf: 'center',
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
    backgroundColor: '#FFF8E3',
    width: '100%',
    gap: 4,
  },
  imagePlaceholderText: {
    color: '#E6A4B4',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  modalFooter: {
    padding: 16,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F5EEE6',
    paddingBottom: Platform.OS === 'ios' ? 16 : 16,
    borderTopWidth: 0,
  },
  submitButton: {
    borderRadius: 8,
  },
  swipeableContainer: {
    overflow: 'hidden',
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
  swipeActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    gap: 4,
    paddingHorizontal: 4,
    marginBottom: 12,
    marginHorizontal: 2,
  },
  actionButton: {
    height: 56,
    width: 56,
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
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#E6A4B4',
    marginTop: 20,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#E6A4B4',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default ListDetailsScreen; 