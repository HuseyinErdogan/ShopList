import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Dimensions, Platform, Image } from 'react-native';
import { Text, IconButton, FAB, Card, Portal, Modal, TextInput, Button, Chip, Searchbar } from 'react-native-paper';
import { getListItems, updateListItems } from '../utils/storage';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';

// Ana kategorilere göre alt etiketler
const SUB_TAGS = {
  grocery: [
    { id: 'fruits', label: 'Fruits', icon: 'fruit-cherries' },
    { id: 'vegetables', label: 'Vegetables', icon: 'carrot' },
    { id: 'dairy', label: 'Dairy & Eggs', icon: 'cheese' },
    { id: 'meat', label: 'Meat & Seafood', icon: 'food-steak' },
    { id: 'bakery', label: 'Bakery', icon: 'bread-slice' },
    { id: 'drinks', label: 'Beverages', icon: 'bottle-soda' },
    { id: 'snacks', label: 'Snacks', icon: 'cookie' },
    { id: 'pantry', label: 'Pantry', icon: 'food-variant' },
    { id: 'frozen', label: 'Frozen Foods', icon: 'snowflake' },
    { id: 'cleaning', label: 'Cleaning', icon: 'spray-bottle' },
  ],
  home: [
    { id: 'furniture', label: 'Furniture', icon: 'sofa' },
    { id: 'decoration', label: 'Decor', icon: 'lamp' },
    { id: 'kitchen', label: 'Kitchen', icon: 'pot-steam' },
    { id: 'bathroom', label: 'Bathroom', icon: 'shower' },
    { id: 'bedroom', label: 'Bedroom', icon: 'bed' },
    { id: 'storage', label: 'Storage', icon: 'box' },
    { id: 'lighting', label: 'Lighting', icon: 'ceiling-light' },
    { id: 'cleaning_supplies', label: 'Cleaning Supplies', icon: 'broom' },
  ],
  clothing: [
    { id: 'tops', label: 'Tops', icon: 'tshirt-crew' },
    { id: 'bottoms', label: 'Bottoms', icon: 'archive' },
    { id: 'dresses', label: 'Dresses', icon: 'hanger' },
    { id: 'outerwear', label: 'Outerwear', icon: 'jacket' },
    { id: 'shoes', label: 'Shoes', icon: 'shoe-heel' },
    { id: 'accessories', label: 'Accessories', icon: 'glasses' },
    { id: 'activewear', label: 'Activewear', icon: 'run' },
    { id: 'underwear', label: 'Underwear', icon: 'tag' },
  ],
  electronics: [
    { id: 'computer', label: 'Computers', icon: 'laptop' },
    { id: 'phone', label: 'Phones & Tablets', icon: 'cellphone' },
    { id: 'gaming', label: 'Gaming', icon: 'gamepad-variant' },
    { id: 'tv_audio', label: 'TV & Audio', icon: 'television' },
    { id: 'cameras', label: 'Cameras', icon: 'camera' },
    { id: 'accessories', label: 'Accessories', icon: 'headphones' },
    { id: 'smart_home', label: 'Smart Home', icon: 'home-automation' },
    { id: 'office', label: 'Office Equipment', icon: 'printer' },
  ],
  health: [
    { id: 'medicine', label: 'Medicine', icon: 'pill' },
    { id: 'vitamins', label: 'Vitamins', icon: 'medication' },
    { id: 'personal_care', label: 'Personal Care', icon: 'face-man-shimmer' },
    { id: 'skincare', label: 'Skincare', icon: 'lotion' },
    { id: 'haircare', label: 'Hair Care', icon: 'hair-dryer' },
    { id: 'dental', label: 'Dental Care', icon: 'tooth' },
    { id: 'fitness', label: 'Fitness', icon: 'dumbbell' },
    { id: 'first_aid', label: 'First Aid', icon: 'bandage' },
  ],
  books: [
    { id: 'fiction', label: 'Fiction', icon: 'book-open-variant' },
    { id: 'nonfiction', label: 'Non-Fiction', icon: 'book-open-page-variant' },
    { id: 'academic', label: 'Academic', icon: 'school' },
    { id: 'magazines', label: 'Magazines', icon: 'newspaper' },
    { id: 'children', label: 'Children Books', icon: 'book-child' },
    { id: 'stationery', label: 'Stationery', icon: 'pencil' },
    { id: 'art_supplies', label: 'Art Supplies', icon: 'palette' },
    { id: 'office_supplies', label: 'Office Supplies', icon: 'office-building' },
  ],
  hobby: [
    { id: 'art', label: 'Art & Craft', icon: 'palette' },
    { id: 'music', label: 'Music', icon: 'music' },
    { id: 'photography', label: 'Photography', icon: 'camera' },
    { id: 'collectibles', label: 'Collectibles', icon: 'trophy' },
    { id: 'games', label: 'Board Games', icon: 'dice-multiple' },
    { id: 'crafting', label: 'Crafting', icon: 'scissors-cutting' },
    { id: 'instruments', label: 'Instruments', icon: 'guitar-acoustic' },
    { id: 'modeling', label: 'Modeling', icon: 'puzzle' },
  ],
  gift: [
    { id: 'birthday', label: 'Birthday', icon: 'cake-variant' },
    { id: 'anniversary', label: 'Anniversary', icon: 'heart' },
    { id: 'wedding', label: 'Wedding', icon: 'ring' },
    { id: 'holiday', label: 'Holiday', icon: 'pine-tree' },
    { id: 'thank_you', label: 'Thank You', icon: 'hand-heart' },
    { id: 'baby', label: 'Baby Shower', icon: 'baby-carriage' },
    { id: 'graduation', label: 'Graduation', icon: 'school' },
    { id: 'housewarming', label: 'Housewarming', icon: 'home-heart' },
  ],
  sports: [
    { id: 'fitness', label: 'Fitness', icon: 'dumbbell' },
    { id: 'outdoor', label: 'Outdoor Sports', icon: 'hiking' },
    { id: 'team_sports', label: 'Team Sports', icon: 'basketball' },
    { id: 'water_sports', label: 'Water Sports', icon: 'swim' },
    { id: 'cycling', label: 'Cycling', icon: 'bike' },
    { id: 'running', label: 'Running', icon: 'run' },
    { id: 'yoga', label: 'Yoga', icon: 'yoga' },
    { id: 'equipment', label: 'Equipment', icon: 'weight' },
  ],
  kids: [
    { id: 'toys', label: 'Toys', icon: 'toy-brick' },
    { id: 'clothing', label: 'Clothing', icon: 'hanger' },
    { id: 'school', label: 'School Supplies', icon: 'backpack' },
    { id: 'books', label: 'Books', icon: 'book-child' },
    { id: 'baby_care', label: 'Baby Care', icon: 'baby' },
    { id: 'games', label: 'Games', icon: 'gamepad-variant' },
    { id: 'art_craft', label: 'Art & Craft', icon: 'palette' },
    { id: 'outdoor', label: 'Outdoor Play', icon: 'kite' },
  ],
  pets: [
    { id: 'food', label: 'Pet Food', icon: 'food-bowl' },
    { id: 'toys', label: 'Toys', icon: 'dog-side' },
    { id: 'care', label: 'Care & Grooming', icon: 'dog-service' },
    { id: 'health', label: 'Health', icon: 'medical-bag' },
    { id: 'accessories', label: 'Accessories', icon: 'collar' },
    { id: 'bedding', label: 'Bedding', icon: 'bed' },
    { id: 'cleaning', label: 'Cleaning', icon: 'broom' },
    { id: 'travel', label: 'Travel', icon: 'car-side' },
  ],
  garden: [
    { id: 'plants', label: 'Plants', icon: 'flower' },
    { id: 'tools', label: 'Tools', icon: 'shovel' },
    { id: 'furniture', label: 'Outdoor Furniture', icon: 'chair-rolling' },
    { id: 'decor', label: 'Garden Decor', icon: 'lantern' },
    { id: 'lighting', label: 'Outdoor Lighting', icon: 'outdoor-lamp' },
    { id: 'soil', label: 'Soil & Fertilizers', icon: 'leaf' },
    { id: 'pots', label: 'Pots & Planters', icon: 'pot' },
    { id: 'equipment', label: 'Equipment', icon: 'lawn-mower' },
  ],
};

const TAG_THEMES = {
  grocery: {
    primary: '#4CAF50',
    pastel: '#F7F9F7',
    surface: '#FFFFFF',
    border: 'rgba(76, 175, 80, 0.12)',
  },
  home: {
    primary: '#2196F3',
    pastel: '#F7F9FB',
    surface: '#FFFFFF',
    border: 'rgba(33, 150, 243, 0.12)',
  },
  gift: {
    primary: '#E91E63',
    pastel: '#F9F7F8',
    surface: '#FFFFFF',
    border: 'rgba(233, 30, 99, 0.12)',
  },
  clothing: {
    primary: '#9C27B0',
    pastel: '#F9F7FA',
    surface: '#FFFFFF',
    border: 'rgba(156, 39, 176, 0.12)',
  },
  health: {
    primary: '#F44336',
    pastel: '#F9F7F7',
    surface: '#FFFFFF',
    border: 'rgba(244, 67, 54, 0.12)',
  },
  books: {
    primary: '#FF9800',
    pastel: '#F9F7F6',
    surface: '#FFFFFF',
    border: 'rgba(255, 152, 0, 0.12)',
  },
  electronics: {
    primary: '#607D8B',
    pastel: '#F7F8F9',
    surface: '#FFFFFF',
    border: 'rgba(96, 125, 139, 0.12)',
  },
  hobby: {
    primary: '#795548',
    pastel: '#F8F7F6',
    surface: '#FFFFFF',
    border: 'rgba(121, 85, 72, 0.12)',
  },
};

const DEFAULT_THEME = {
  primary: '#E6A4B4',
  pastel: '#F8F7F7',
  surface: '#FFFFFF',
  border: 'rgba(230, 164, 180, 0.12)',
};

const getTagTheme = (tagId) => {
  return tagId ? TAG_THEMES[tagId] || DEFAULT_THEME : DEFAULT_THEME;
};

const getTagShadowStyle = (tagColor) => {
  if (!tagColor) return {};
  
  return Platform.select({
    ios: {
      shadowColor: tagColor,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.15,
      shadowRadius: 3.5,
    },
    android: {
      elevation: 3,
    },
  });
};

const CustomCheckbox = ({ checked, onPress, theme = DEFAULT_THEME }) => {
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
        [theme.surface, theme.primary]
      ),
      borderColor: theme.primary,
    };
  });

  return (
    <TouchableOpacity onPress={onPress} style={styles.checkboxContainer}>
      <Animated.View style={[styles.checkbox, animatedStyle]}>
        {checked && (
          <IconButton
            icon="check"
            size={16}
            iconColor={theme.surface}
            style={styles.checkIcon}
          />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const AddItemForm = React.memo(({ onSubmit, onClose, editingItem = null, tag, subTags, theme = DEFAULT_THEME }) => {
  const [formData, setFormData] = useState({
    name: editingItem?.name || '',
    quantity: editingItem?.quantity?.split(' ')[0] || '1',
    unit: editingItem?.quantity?.split(' ')[1] || 'pcs',
    image: editingItem?.image || null,
    description: editingItem?.description || '',
    subTag: editingItem?.subTag || null,
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
      description: formData.description.trim(),
      subTag: formData.subTag,
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
    <View style={[styles.modalContent, { backgroundColor: theme.pastel }]}>
      <View style={[styles.modalHeader, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <IconButton
          icon="close"
          size={24}
          iconColor="#666"
          onPress={onClose}
        />
        <Text style={styles.modalTitle}>
          {editingItem ? 'Edit Item' : 'Add New Item'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        <TouchableOpacity 
          style={[styles.imagePickerButton, { 
            backgroundColor: theme.surface,
            borderColor: theme.border
          }]} 
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
                color={theme.primary}
                style={{ margin: 0 }}
              />
              <Text style={[styles.imagePlaceholderText, { color: theme.primary }]}>Add Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Item Name</Text>
          <TextInput
            value={formData.name}
            onChangeText={(value) => handleChange('name', value)}
            style={[styles.input, { backgroundColor: theme.surface }]}
            placeholder="Enter item name"
            placeholderTextColor="#999"
            mode="outlined"
            outlineColor={theme.border}
            activeOutlineColor={theme.primary}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Quantity</Text>
          <View style={styles.quantityRow}>
            <TextInput
              value={formData.quantity}
              onChangeText={(value) => handleChange('quantity', value)}
              style={[styles.input, { flex: 0.4, backgroundColor: theme.surface }]}
              placeholder="1"
              placeholderTextColor="#999"
              mode="outlined"
              outlineColor={theme.border}
              activeOutlineColor={theme.primary}
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
                      { 
                        backgroundColor: theme.surface,
                        borderColor: theme.border
                      },
                      formData.unit === unit.value && {
                        backgroundColor: theme.primary,
                        borderColor: theme.primary
                      }
                    ]}
                    onPress={() => handleChange('unit', unit.value)}
                  >
                    <Text style={[
                      styles.unitButtonText,
                      { color: theme.primary },
                      formData.unit === unit.value && { color: theme.surface }
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
            style={[styles.input, styles.descriptionInput, { backgroundColor: theme.surface }]}
            placeholder="Add a description"
            placeholderTextColor="#999"
            mode="outlined"
            outlineColor={theme.border}
            activeOutlineColor={theme.primary}
            multiline
            numberOfLines={3}
          />
        </View>

        {subTags && subTags.length > 0 && (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Category</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.subTagsRow}
            >
              {subTags.map((subTag) => (
                <TouchableOpacity
                  key={subTag.id}
                  style={[
                    styles.subTagButton,
                    { 
                      backgroundColor: theme.surface,
                      borderColor: theme.border
                    },
                    formData.subTag === subTag.id && {
                      backgroundColor: theme.primary,
                      borderColor: theme.primary
                    }
                  ]}
                  onPress={() => handleChange('subTag', subTag.id)}
                >
                  <MaterialCommunityIcons
                    name={subTag.icon}
                    size={20}
                    color={formData.subTag === subTag.id ? theme.surface : theme.primary}
                  />
                  <Text style={[
                    styles.subTagButtonText,
                    { color: theme.primary },
                    formData.subTag === subTag.id && { color: theme.surface }
                  ]}>
                    {subTag.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      <View style={[styles.modalFooter, { backgroundColor: theme.pastel }]}>
        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.submitButton}
          buttonColor={theme.primary}
          textColor={theme.surface}
        >
          {editingItem ? 'Save Changes' : 'Add Item'}
        </Button>
      </View>
    </View>
  );
});

const ListDetailsScreen = ({ route, navigation }) => {
  const { listId, listTitle, note, tag } = route.params;
  const [items, setItems] = useState([]);
  const [visible, setVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubTags, setSelectedSubTags] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const theme = getTagTheme(tag?.id);

  useEffect(() => {
    loadItems();
  }, [listId]);

  useEffect(() => {
    filterItems();
  }, [items, searchQuery, selectedSubTags]);

  const loadItems = async () => {
    const loadedItems = await getListItems(listId);
    setItems(loadedItems);
  };

  const filterItems = () => {
    let filtered = [...items];
    
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedSubTags.length > 0) {
      filtered = filtered.filter(item => 
        selectedSubTags.includes(item.subTag)
      );
    }

    setFilteredItems(filtered);
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
          style={[styles.actionButton, { backgroundColor: theme.primary }]}>
          <IconButton 
            icon="pencil" 
            size={24} 
            iconColor={theme.surface}
            style={{ margin: 0, width: 56, height: 56 }} 
          />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => deleteItem(item.id)}
          style={[styles.actionButton, { backgroundColor: 'rgba(244, 67, 54, 0.9)' }]}>
          <IconButton 
            icon="delete" 
            size={24} 
            iconColor={theme.surface}
            style={{ margin: 0, width: 56, height: 56 }} 
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.pastel }]}>
      <View style={[styles.header, { backgroundColor: theme.pastel }]}>
        <View style={styles.headerLeft}>
          <IconButton
            icon="arrow-left"
            size={24}
            color="#333"
            onPress={() => navigation.goBack()}
          />
          <View>
            <Text style={styles.headerTitle}>{listTitle}</Text>
            {tag && (
              <View style={styles.tagRow}>
                <MaterialCommunityIcons
                  name={tag.icon}
                  size={16}
                  color={tag.color}
                />
                <Text style={[styles.tagText, { color: tag.color }]}>{tag.label}</Text>
              </View>
            )}
          </View>
        </View>
        <IconButton
          icon="share-variant-outline"
          size={24}
          color="#333"
          onPress={() => console.log('Share')}
        />
      </View>

      {note && (
        <Text style={styles.noteText}>{note}</Text>
      )}

      <View style={styles.filterContainer}>
        <Searchbar
          placeholder="Search items"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[styles.searchBar, { backgroundColor: theme.surface }]}
          inputStyle={styles.searchInput}
          iconColor={theme.primary}
        />
      </View>

      {tag && SUB_TAGS[tag.id] && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.subTagsScroll}
          contentContainerStyle={styles.subTagsContainer}
        >
          {SUB_TAGS[tag.id].map((subTag) => (
            <Chip
              key={subTag.id}
              selected={selectedSubTags.includes(subTag.id)}
              onPress={() => {
                setSelectedSubTags(prev => 
                  prev.includes(subTag.id)
                    ? prev.filter(id => id !== subTag.id)
                    : [...prev, subTag.id]
                )
              }}
              style={[
                styles.subTagChip,
                { backgroundColor: theme.surface, borderColor: theme.border },
                selectedSubTags.includes(subTag.id) && { backgroundColor: theme.primary }
              ]}
              textStyle={[
                styles.subTagText,
                { color: theme.primary },
                selectedSubTags.includes(subTag.id) && styles.selectedSubTagText
              ]}
              icon={() => (
                <MaterialCommunityIcons
                  name={subTag.icon}
                  size={16}
                  color={selectedSubTags.includes(subTag.id) ? '#FFF8E3' : theme.primary}
                />
              )}
            >
              {subTag.label}
            </Chip>
          ))}
        </ScrollView>
      )}

      {filteredItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons 
            name="cart-outline" 
            size={120} 
            color={theme.primary}
          />
          <Text style={[styles.emptyStateTitle, { color: theme.primary }]}>
            {searchQuery || selectedSubTags.length > 0 
              ? 'No matching items found'
              : 'Your shopping list is empty'}
          </Text>
          <Text style={[styles.emptyStateSubtitle, { color: theme.primary }]}>
            {searchQuery || selectedSubTags.length > 0 
              ? 'Try different filters'
              : 'Add some items to get started!'}
          </Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
        >
          <GestureHandlerRootView>
            {filteredItems.map((item) => (
              <Swipeable
                key={item.id}
                renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}
                rightThreshold={40}
              >
                <TouchableOpacity
                  onPress={() => showItemDetails(item)}
                  style={styles.cardWrapper}
                >
                  <Card style={[
                    styles.itemCard,
                    { 
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                    },
                    getTagShadowStyle(theme.primary)
                  ]}>
                    <Card.Content style={styles.itemContent}>
                      <View style={styles.itemMain}>
                        <View style={styles.itemLeft}>
                          <CustomCheckbox
                            checked={item.checked}
                            onPress={() => toggleItem(item.id)}
                            theme={theme}
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
                            {item.subTag && SUB_TAGS[tag?.id] && (
                              <View style={styles.itemSubTagContainer}>
                                <MaterialCommunityIcons
                                  name={SUB_TAGS[tag.id].find(st => st.id === item.subTag)?.icon}
                                  size={12}
                                  color={tag.color}
                                />
                                <Text style={[styles.itemSubTag, { color: tag.color }]}>
                                  {SUB_TAGS[tag.id].find(st => st.id === item.subTag)?.label}
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>
                        <View style={styles.quantityContainer}>
                          <Text style={[styles.quantity, { color: tag?.color }]}>{item.quantity}</Text>
                        </View>
                      </View>
                    </Card.Content>
                  </Card>
                </TouchableOpacity>
              </Swipeable>
            ))}
          </GestureHandlerRootView>
        </ScrollView>
      )}

      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => {
            setVisible(false);
            setEditingItem(null);
          }}
          contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.pastel }]}>
          <ScrollView>
            <AddItemForm
              onSubmit={handleSubmitItem}
              onClose={() => {
                setVisible(false);
                setEditingItem(null);
              }}
              editingItem={editingItem}
              tag={tag}
              subTags={SUB_TAGS[tag?.id] || []}
              theme={theme}
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
            <Card style={[styles.detailsCard, getTagShadowStyle(tag?.color)]}>
              {selectedItem.image && (
                <Card.Cover source={{ uri: selectedItem.image }} style={styles.detailsImage} />
              )}
              <Card.Content style={styles.detailsCardContent}>
                <Text style={styles.detailsTitle}>{selectedItem.name}</Text>
                <Text style={[styles.detailsQuantity, { color: tag?.color }]}>
                  Quantity: {selectedItem.quantity}
                </Text>
                {selectedItem.subTag && SUB_TAGS[tag?.id] && (
                  <Chip
                    style={[styles.detailsSubTag, { borderColor: tag.color }]}
                    textStyle={{ color: tag.color }}
                    icon={() => (
                      <MaterialCommunityIcons
                        name={SUB_TAGS[tag.id].find(st => st.id === selectedItem.subTag)?.icon}
                        size={16}
                        color={tag.color}
                      />
                    )}
                  >
                    {SUB_TAGS[tag.id].find(st => st.id === selectedItem.subTag)?.label}
                  </Chip>
                )}
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
                  buttonColor={tag?.color || "#E6A4B4"}
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
        style={[styles.fab, { backgroundColor: theme.primary }]}
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#F5EEE6',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    letterSpacing: 0.5,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '600',
  },
  noteText: {
    color: '#666',
    fontSize: 14,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  searchBar: {
    backgroundColor: '#FFF8E3',
    borderRadius: 12,
    elevation: 0,
  },
  searchInput: {
    fontSize: 16,
  },
  subTagsScroll: {
    maxHeight: 40,
    marginBottom: 12,
  },
  subTagsContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  subTagChip: {
    backgroundColor: '#FFF8E3',
  },
  subTagText: {
    fontSize: 12,
  },
  selectedSubTagText: {
    color: '#FFF8E3',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 20,
    paddingTop: 8,
  },
  cardWrapper: {
    height: 80,
    marginBottom: 12,
    marginHorizontal: 2,
  },
  itemCard: {
    height: '100%',
    backgroundColor: '#FFF8E3',
    borderRadius: 16,
    borderWidth: Platform.OS === 'ios' ? 0 : 1,
    borderColor: 'rgba(230, 164, 180, 0.1)',
  },
  itemContent: {
    height: '100%',
    padding: 12,
    paddingHorizontal: 16,
  },
  itemMain: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  itemTextContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  itemName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  checkedItem: {
    textDecorationLine: 'line-through',
    color: '#999',
    fontStyle: 'italic',
  },
  itemDescription: {
    fontSize: 12,
    color: '#666',
  },
  itemSubTagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itemSubTag: {
    fontSize: 11,
    fontWeight: '500',
  },
  quantityContainer: {
    backgroundColor: 'rgba(230, 164, 180, 0.08)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  quantity: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemImage: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  checkboxContainer: {
    marginRight: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    margin: 0,
    padding: 0,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  modalContainer: {
    backgroundColor: '#F5EEE6',
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  detailsModalContainer: {
    margin: 20,
  },
  detailsCard: {
    backgroundColor: '#F5EEE6',
    borderRadius: 16,
    overflow: 'hidden',
  },
  detailsImage: {
    height: 200,
    backgroundColor: '#F5EEE6',
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
    marginBottom: 16,
  },
  detailsSubTag: {
    alignSelf: 'flex-start',
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
  swipeActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  emptyContainer: {
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
  modalContent: {
    flex: 1,
    backgroundColor: '#F5EEE6',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF8E3',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(230, 164, 180, 0.2)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  formContainer: {
    padding: 20,
  },
  imagePickerButton: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFF8E3',
    borderWidth: 1,
    borderColor: '#E6A4B4',
    borderStyle: 'dashed',
    marginBottom: 20,
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
    gap: 8,
  },
  imagePlaceholderText: {
    fontSize: 14,
    color: '#E6A4B4',
    fontWeight: '500',
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
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  unitSelector: {
    flex: 1,
  },
  unitSelectorScroll: {
    paddingVertical: 4,
    gap: 8,
    flexDirection: 'row',
  },
  unitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFF8E3',
    borderWidth: 1,
    borderColor: '#E6A4B4',
    minWidth: 50,
    alignItems: 'center',
  },
  selectedUnitButton: {
    backgroundColor: '#E6A4B4',
    borderColor: '#E6A4B4',
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
    textAlignVertical: 'top',
  },
  subTagsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  subTagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E3',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  selectedSubTagButton: {
    backgroundColor: '#E6A4B4',
    borderColor: '#E6A4B4',
  },
  subTagButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedSubTagButtonText: {
    color: '#FFF8E3',
  },
  modalFooter: {
    padding: 20,
    paddingTop: 0,
    backgroundColor: '#F5EEE6',
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 6,
  },
});

export default ListDetailsScreen; 