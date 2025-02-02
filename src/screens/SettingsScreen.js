import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform, Alert, ActivityIndicator } from 'react-native';
import { Text, Switch, List, Divider, Button, useTheme, Badge, Dialog, Portal } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { getLists, getListItems, saveList, updateListItems } from '../utils/storage';
import { useTranslation } from 'react-i18next';

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
};

const SettingsScreen = () => {
  const { t } = useTranslation();
  const [darkMode, setDarkMode] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const debugStorageData = async () => {
    try {
      const lists = await getLists();
      console.log('\n=== DEBUG: ALL LISTS ===');
      lists.forEach(list => {
        console.log('\nList:', {
          id: list.id,
          name: list.name,
          title: list.title,
          category: list.category,
          metadata: list.metadata
        });
      });

      console.log('\n=== DEBUG: ALL ITEMS ===');
      for (const list of lists) {
        const items = await getListItems(list.id);
        console.log(`\nItems for list ${list.id}:`);
        items.forEach(item => {
          console.log('Item:', {
            name: item.name,
            category: item.category,
            metadata: item.metadata
          });
        });
      }
    } catch (error) {
      console.error('Debug error:', error);
    }
  };

  const exportData = async () => {
    try {
      // Get all lists
      const lists = await getLists();
      let exportData = [];

      // Get items for each list and format data
      for (const list of lists) {
        const items = await getListItems(list.id);
        
        // Liste adını ve kategorisini kontrol et
        const listName = list.name || list.title || 'Untitled List';
        let listCategory = 'General';

        // Liste kategorisini tag'den al
        if (list.tag && list.tag.label) {
          listCategory = list.tag.label;
        }
        
        const formattedItems = items.map(item => {
          let itemCategory = 'Uncategorized';

          // Ürün kategorisini subTag'den al
          if (item.subTag && SUB_TAGS[list.tag?.id]) {
            const subTagInfo = SUB_TAGS[list.tag.id].find(st => st.id === item.subTag);
            if (subTagInfo) {
              itemCategory = subTagInfo.label;
            }
          }

          return {
            name: item.name || '',
            quantity: item.quantity || '1 pcs',
            category: itemCategory,
            completed: item.checked || false
          };
        });

        exportData.push({
          listName,
          listCategory,
          createdAt: list.createdAt,
          items: formattedItems
        });
      }

      // Convert to CSV format with list category
      const csvContent = exportData.map(list => {
        const listHeader = `"${list.listName}","${list.listCategory}","${list.createdAt}"\n`;
        const itemsContent = list.items.map(item => 
          `"${item.name}","${item.quantity}","${item.category}","${item.completed}"`
        ).join('\n');
        return `${listHeader}${itemsContent}\n---\n`;
      }).join('');

      // Save to file
      const fileName = `shopping_lists_${new Date().toISOString().split('T')[0]}.csv`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(filePath, csvContent);

      // Share file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath);
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const importData = async () => {
    try {
      setLoading(true);
      
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/csv'
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const file = result.assets[0];
        const content = await FileSystem.readAsStringAsync(file.uri);
        const lists = content.split('---\n').filter(Boolean);

        for (const listContent of lists) {
          const lines = listContent.trim().split('\n').filter(Boolean);
          
          if (lines.length < 2) continue;

          // Parse list header
          const headerParts = lines[0].split(',');
          const listName = headerParts[0]?.replace(/"/g, '') || 'Imported List';
          const listCategory = headerParts[1]?.replace(/"/g, '') || 'Groceries';

          // Find matching tag
          const matchingTag = TAGS.find(tag => tag.label === listCategory) || TAGS[0];

          // Parse items
          const items = [];
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            const parts = line.split(',').map(str => str.replace(/"/g, ''));
            const [name, quantity, category] = parts;

            // Find matching subTag based on category name
            let subTag = null;
            if (SUB_TAGS[matchingTag.id]) {
              // Önce tam eşleşme dene
              let matchingSubTag = SUB_TAGS[matchingTag.id].find(st => 
                st.label.toLowerCase() === category.toLowerCase()
              );

              // Tam eşleşme yoksa, içeren kelimeleri dene
              if (!matchingSubTag) {
                matchingSubTag = SUB_TAGS[matchingTag.id].find(st => 
                  category.toLowerCase().includes(st.label.toLowerCase()) ||
                  st.label.toLowerCase().includes(category.toLowerCase())
                );
              }

              if (matchingSubTag) {
                subTag = matchingSubTag.id;
              }
            }

            items.push({
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              name: name || 'Untitled Item',
              quantity: quantity || '1 pcs',
              category: category,
              subTag: subTag,
              checked: parts[3] === 'true'
            });
          }

          // Create and save new list
          const newList = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: listName,
            title: listName,
            tag: matchingTag,
            items: items
          };

          console.log('Importing list:', {
            name: newList.name,
            tag: newList.tag,
            items: items.map(item => ({
              name: item.name,
              category: item.category,
              subTag: item.subTag
            }))
          });

          await saveList(newList);
        }

        Alert.alert(
          'Success',
          'Your shopping lists have been imported successfully!',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error importing data:', error);
      Alert.alert(
        'Import Failed',
        'There was an error importing your data. Please make sure the file is in the correct format.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const clearAllData = async () => {
    try {
      await AsyncStorage.clear();
      setShowConfirmDialog(false);
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E6A4B4" />
        </View>
      )}
      <View style={styles.header}>
        <Text style={styles.headerText}>{t('settings.header.title')}</Text>
        <Text style={styles.subHeaderText}>{t('settings.header.subtitle')}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionTitle}>{t('settings.premium.title')}</Text>
          <Badge style={styles.comingSoonBadge}>{t('settings.premium.comingSoon')}</Badge>
        </View>
        <List.Item
          title={t('settings.premium.darkMode.title')}
          description={t('settings.premium.darkMode.description')}
          left={props => <List.Icon {...props} icon="theme-light-dark" color="#E6A4B4" />}
        />
        <List.Item
          title={t('settings.premium.priceTracking.title')}
          description={t('settings.premium.priceTracking.description')}
          left={props => <List.Icon {...props} icon="currency-usd" color="#E6A4B4" />}
        />
        <List.Item
          title={t('settings.premium.receiptScanner.title')}
          description={t('settings.premium.receiptScanner.description')}
          left={props => <List.Icon {...props} icon="camera" color="#E6A4B4" />}
        />
        <List.Item
          title={t('settings.premium.smartCategories.title')}
          description={t('settings.premium.smartCategories.description')}
          left={props => <List.Icon {...props} icon="tag-multiple" color="#E6A4B4" />}
        />
        <List.Item
          title={t('settings.premium.analytics.title')}
          description={t('settings.premium.analytics.description')}
          left={props => <List.Icon {...props} icon="chart-line" color="#E6A4B4" />}
        />
        <List.Item
          title={t('settings.premium.cloudSync.title')}
          description={t('settings.premium.cloudSync.description')}
          left={props => <List.Icon {...props} icon="cloud-sync" color="#E6A4B4" />}
        />
        <List.Item
          title={t('settings.premium.collaboration.title')}
          description={t('settings.premium.collaboration.description')}
          left={props => <List.Icon {...props} icon="account-group" color="#E6A4B4" />}
        />
        <List.Item
          title={t('settings.premium.budget.title')}
          description={t('settings.premium.budget.description')}
          left={props => <List.Icon {...props} icon="wallet" color="#E6A4B4" />}
        />
        <List.Item
          title={t('settings.premium.suggestions.title')}
          description={t('settings.premium.suggestions.description')}
          left={props => <List.Icon {...props} icon="lightbulb" color="#E6A4B4" />}
        />
      </View>

      <Divider style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.data.title')}</Text>
        <List.Item
          title={t('settings.data.export.title')}
          description={t('settings.data.export.description')}
          left={props => <List.Icon {...props} icon="export" color="#E6A4B4" />}
          onPress={exportData}
        />
        <List.Item
          title={t('settings.data.import.title')}
          description={t('settings.data.import.description')}
          left={props => <List.Icon {...props} icon="import" color="#E6A4B4" />}
          onPress={importData}
        />
      </View>

      <Divider style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.about.title')}</Text>
        <List.Item
          title={t('settings.about.version')}
          description="1.0.0"
          left={props => <List.Icon {...props} icon="information" color="#E6A4B4" />}
        />
      </View>

      <View style={styles.dangerZone}>
        <Text style={styles.dangerTitle}>{t('settings.danger.title')}</Text>
        <Button
          mode="contained"
          onPress={() => setShowConfirmDialog(true)}
          style={styles.dangerButton}
          labelStyle={styles.dangerButtonText}
        >
          {t('settings.danger.clearData')}
        </Button>
      </View>

      <Portal>
        <Dialog visible={showConfirmDialog} onDismiss={() => setShowConfirmDialog(false)}>
          <Dialog.Title>{t('settings.danger.dialog.title')}</Dialog.Title>
          <Dialog.Content>
            <Text>{t('settings.danger.dialog.message')}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowConfirmDialog(false)}>{t('settings.danger.dialog.cancel')}</Button>
            <Button onPress={clearAllData} textColor="#DC2626">{t('settings.danger.dialog.confirm')}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5EEE6',
  },
  header: {
    padding: 20,
    backgroundColor: '#F5EEE6',
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subHeaderText: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    padding: 16,
    backgroundColor: '#FFF8E3',
    marginHorizontal: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#E6A4B4',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  comingSoonBadge: {
    backgroundColor: '#E6A4B4',
    fontSize: 12,
    color: '#FFF8E3',
  },
  divider: {
    height: 1,
    backgroundColor: 'transparent',
  },
  dangerZone: {
    padding: 20,
    marginTop: 4,
    marginBottom: 40,
    backgroundColor: '#FFF5F5',
    borderRadius: 16,
    marginHorizontal: 16,
    shadowColor: '#DC2626',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 16,
  },
  dangerButton: {
    backgroundColor: '#DC2626',
  },
  dangerButtonText: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5EEE6',
  },
});

export default SettingsScreen; 