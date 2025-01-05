import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, IconButton, Snackbar } from 'react-native-paper';
import { saveList } from '../utils/storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const TAGS = [
  { id: 'grocery', icon: 'cart', label: 'Market', color: '#4CAF50' },
  { id: 'home', icon: 'home', label: 'Ev', color: '#2196F3' },
  { id: 'gift', icon: 'gift', label: 'Hediye', color: '#E91E63' },
  { id: 'clothing', icon: 'tshirt-crew', label: 'Giyim', color: '#9C27B0' },
  { id: 'health', icon: 'medical-bag', label: 'Sağlık', color: '#F44336' },
  { id: 'books', icon: 'book-open-page-variant', label: 'Kitap/Kırtasiye', color: '#FF9800' },
  { id: 'electronics', icon: 'laptop', label: 'Elektronik', color: '#607D8B' },
  { id: 'hobby', icon: 'palette', label: 'Hobi', color: '#795548' },
];

const CreateListScreen = ({ navigation }) => {
  const [listTitle, setListTitle] = useState('');
  const [note, setNote] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [error, setError] = useState('');

  const handleCreateList = async () => {
    if (!listTitle.trim()) {
      setError('Please enter a list title');
      return;
    }

    if (!selectedTag) {
      setError('Please select a category');
      return;
    }

    try {
      const newList = await saveList({
        title: listTitle,
        note: note,
        items: [],
        tag: selectedTag,
      });

      navigation.replace('ListDetails', {
        listId: newList.id,
        listTitle: newList.title,
        note: newList.note,
        tag: newList.tag,
      });
    } catch (err) {
      setError('Failed to create list. Please try again.');
    }
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
          <Text style={styles.header}>Create New List</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>List Title</Text>
          <TextInput
            value={listTitle}
            onChangeText={setListTitle}
            style={styles.input}
            placeholder="Enter list title"
            placeholderTextColor="#999"
            mode="outlined"
            outlineColor="#E6A4B4"
            activeOutlineColor="#E6A4B4"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.tagsContainer}>
            {TAGS.map((tag) => (
              <TouchableOpacity
                key={tag.id}
                style={[
                  styles.tagButton,
                  selectedTag?.id === tag.id && styles.selectedTagButton,
                  { borderColor: tag.color }
                ]}
                onPress={() => setSelectedTag(tag)}
              >
                <MaterialCommunityIcons
                  name={tag.icon}
                  size={24}
                  color={selectedTag?.id === tag.id ? '#FFF8E3' : tag.color}
                  style={styles.tagIcon}
                />
                <Text style={[
                  styles.tagLabel,
                  selectedTag?.id === tag.id && styles.selectedTagLabel,
                  { color: selectedTag?.id === tag.id ? '#FFF8E3' : tag.color }
                ]}>
                  {tag.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Note (Optional)</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            style={[styles.input, styles.noteInput]}
            placeholder="Add a note about your list"
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
          Create List
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
  headerContainer: {
    backgroundColor: '#E6A4B4',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingVertical: 16,
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
    paddingHorizontal: 8,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF8E3',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  input: {
    backgroundColor: '#FFF8E3',
    fontSize: 16,
  },
  noteInput: {
    height: 120,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 4,
  },
  tagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E3',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: '45%',
    maxWidth: '45%',
  },
  selectedTagButton: {
    backgroundColor: '#E6A4B4',
    borderColor: '#E6A4B4',
  },
  tagIcon: {
    marginRight: 8,
  },
  tagLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedTagLabel: {
    color: '#FFF8E3',
  },
  createButton: {
    marginTop: 20,
    backgroundColor: '#E6A4B4',
    paddingVertical: 8,
    borderRadius: 12,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF8E3',
  },
  snackbar: {
    backgroundColor: '#E6A4B4',
  },
});

export default CreateListScreen; 