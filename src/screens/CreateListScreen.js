import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { TextInput, Button, Text, IconButton, Snackbar } from 'react-native-paper';
import { saveList } from '../utils/storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_PADDING = 20;
const GRID_SPACING = 12;
const BUTTON_WIDTH = (SCREEN_WIDTH - (GRID_PADDING * 2) - GRID_SPACING) / 2;

const TAGS = [
  { id: 'grocery', icon: 'cart', label: 'Groceries', color: '#4CAF50' },
  { id: 'home', icon: 'home', label: 'Home & Living', color: '#2196F3' },
  { id: 'gift', icon: 'gift', label: 'Gifts', color: '#E91E63' },
  { id: 'clothing', icon: 'tshirt-crew', label: 'Fashion', color: '#9C27B0' },
  { id: 'health', icon: 'medical-bag', label: 'Health & Beauty', color: '#F44336' },
  { id: 'books', icon: 'book-open-page-variant', label: 'Books & Stationery', color: '#FF9800' },
  { id: 'electronics', icon: 'laptop', label: 'Electronics', color: '#607D8B' },
  { id: 'hobby', icon: 'palette', label: 'Hobbies', color: '#795548' },
  { id: 'sports', icon: 'basketball', label: 'Sports', color: '#00BCD4' },
  { id: 'kids', icon: 'baby-face', label: 'Kids & Toys', color: '#8BC34A' },
  { id: 'pets', icon: 'paw', label: 'Pet Supplies', color: '#FF5722' },
  { id: 'garden', icon: 'flower', label: 'Garden & Outdoor', color: '#009688' },
];

const CategoryButton = ({ tag, isSelected, onPress }) => (
  <TouchableOpacity
    style={[
      styles.tagButton,
      isSelected && styles.selectedTagButton,
      { borderColor: tag.color },
      isSelected && { backgroundColor: tag.color }
    ]}
    onPress={onPress}
  >
    <MaterialCommunityIcons
      name={tag.icon}
      size={22}
      color={isSelected ? '#FFF8E3' : tag.color}
      style={styles.tagIcon}
    />
    <Text 
      style={[
        styles.tagLabel,
        isSelected && styles.selectedTagLabel,
        { color: isSelected ? '#FFF8E3' : tag.color }
      ]}
      numberOfLines={1}
      ellipsizeMode="tail"
    >
      {tag.label}
    </Text>
  </TouchableOpacity>
);

const CreateListScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [listTitle, setListTitle] = useState('');
  const [note, setNote] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [error, setError] = useState('');

  const handleCreateList = async () => {
    if (!listTitle.trim()) {
      setError(t('createList.errors.titleRequired'));
      return;
    }

    try {
      const newList = await saveList({
        title: listTitle,
        note: note,
        items: [],
        tag: selectedTag || null,
      });

      navigation.replace('ListDetails', {
        listId: newList.id,
        listTitle: newList.title,
        note: newList.note,
        tag: newList.tag,
      });
    } catch (err) {
      setError(t('createList.errors.createFailed'));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          color="#333"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
        <Text style={styles.headerTitle}>{t('createList.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('createList.listTitle.label')}</Text>
          <TextInput
            value={listTitle}
            onChangeText={setListTitle}
            style={styles.input}
            placeholder={t('createList.listTitle.placeholder')}
            placeholderTextColor="#999"
            mode="outlined"
            outlineColor="#E6A4B4"
            activeOutlineColor="#E6A4B4"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('createList.category.label')}</Text>
          <View style={styles.tagsContainer}>
            {TAGS.map((tag) => (
              <CategoryButton
                key={tag.id}
                tag={{
                  ...tag,
                  label: t(`home.tags.${tag.id}`)
                }}
                isSelected={selectedTag?.id === tag.id}
                onPress={() => setSelectedTag(tag)}
              />
            ))}
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('createList.note.label')}</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            style={[styles.input, styles.noteInput]}
            placeholder={t('createList.note.placeholder')}
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            mode="outlined"
            outlineColor="#E6A4B4"
            activeOutlineColor="#E6A4B4"
          />
        </View>

        <Button
          mode="contained"
          onPress={handleCreateList}
          style={styles.createButton}
          labelStyle={styles.buttonLabel}
        >
          {t('createList.button')}
        </Button>
      </ScrollView>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        duration={3000}
        style={styles.snackbar}
      >
        {error}
      </Snackbar>
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
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#FFF8E3',
    borderRadius: 12,
  },
  formContainer: {
    flex: 1,
    padding: GRID_PADDING,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: '#FFF8E3',
    fontSize: 16,
    borderRadius: 12,
  },
  noteInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  tagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E3',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    width: BUTTON_WIDTH,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  selectedTagButton: {
    borderColor: 'transparent',
  },
  tagIcon: {
    marginRight: 8,
    width: 22,
  },
  tagLabel: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  selectedTagLabel: {
    color: '#FFF8E3',
  },
  createButton: {
    marginTop: 12,
    marginBottom: 32,
    backgroundColor: '#E6A4B4',
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF8E3',
    letterSpacing: 0.5,
  },
  snackbar: {
    backgroundColor: '#E6A4B4',
  },
});

export default CreateListScreen; 