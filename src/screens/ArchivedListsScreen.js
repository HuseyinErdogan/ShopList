import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { Card, Text, IconButton, Searchbar, Dialog, Portal, Button } from 'react-native-paper';
import { getArchivedLists, unarchiveList, deleteList, calculateListTotal } from '../utils/storage';
import { formatPrice, getCurrencySymbol } from '../utils/currency';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const ArchivedListsScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [archivedLists, setArchivedLists] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLists, setFilteredLists] = useState([]);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [selectedListId, setSelectedListId] = useState(null);

  useEffect(() => {
    loadArchivedLists();
  }, []);

  useEffect(() => {
    filterLists();
  }, [searchQuery, archivedLists]);

  const loadArchivedLists = async () => {
    try {
      const lists = await getArchivedLists();
      
      // Her arşivlenmiş liste için toplam fiyatı hesapla
      const listsWithTotals = await Promise.all(lists.map(async (list) => {
        const total = await calculateListTotal(list.id);
        return {
          ...list,
          totalPrice: total
        };
      }));
      
      setArchivedLists(listsWithTotals);
    } catch (error) {
      console.error('Error loading archived lists:', error);
      setArchivedLists([]);
    }
  };

  const filterLists = () => {
    if (!searchQuery) {
      setFilteredLists(archivedLists);
      return;
    }

    const filtered = archivedLists.filter(list =>
      list.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredLists(filtered);
  };

  const handleUnarchive = async (listId) => {
    try {
      await unarchiveList(listId);
      await loadArchivedLists();
      Alert.alert('Success', 'List has been unarchived successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to unarchive list');
    }
  };

  const showDeleteDialog = (listId) => {
    setSelectedListId(listId);
    setDeleteDialogVisible(true);
  };

  const hideDeleteDialog = () => {
    setDeleteDialogVisible(false);
    setSelectedListId(null);
  };

  const handleDelete = async () => {
    try {
      await deleteList(selectedListId);
      await loadArchivedLists();
      hideDeleteDialog();
      Alert.alert('Success', 'List has been deleted successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete list');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>{t('archived.title')}</Text>
        <View style={{ width: 48 }} />
      </View>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder={t('archived.searchPlaceholder')}
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      <ScrollView style={styles.listContainer}>
        {filteredLists.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="archive-off-outline"
              size={80}
              color="#E6A4B4"
            />
            <Text style={styles.emptyText}>
              {searchQuery ? t('archived.empty.noMatchingLists') : t('archived.empty.noLists')}
            </Text>
            <Text style={styles.emptySubText}>
              {searchQuery ? t('archived.empty.tryDifferent') : t('archived.empty.archiveFirst')}
            </Text>
          </View>
        ) : (
          filteredLists.map((list) => (
            <Card
              key={list.id}
              style={styles.card}
            >
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleContainer}>
                    {list.tag && (
                      <View style={[styles.tagIndicator, { backgroundColor: list.tag.color }]}>
                        <MaterialCommunityIcons
                          name={list.tag.icon}
                          size={16}
                          color="#FFF8E3"
                        />
                      </View>
                    )}
                    <Text style={styles.cardTitle}>{list.title}</Text>
                  </View>
                  <View style={styles.actionButtons}>
                    <IconButton
                      icon="archive-arrow-up-outline"
                      size={24}
                      onPress={() => handleUnarchive(list.id)}
                    />
                    <IconButton
                      icon="delete-outline"
                      size={24}
                      onPress={() => showDeleteDialog(list.id)}
                    />
                  </View>
                </View>
                <View style={styles.cardDetails}>
                  <Text style={styles.cardDate}>{formatDate(list.createdAt)}</Text>
                  <View style={styles.cardInfo}>
                    <View style={styles.itemCountContainer}>
                      <IconButton
                        icon="shopping-outline"
                        size={16}
                        color="#E6A4B4"
                        style={styles.itemCountIcon}
                      />
                      <Text style={styles.itemCount}>
                        {list.itemCount} {t('archived.list.items')}
                      </Text>
                    </View>
                    {list.totalPrice > 0 && (
                      <View style={[styles.priceContainer, { backgroundColor: 'rgba(230, 164, 180, 0.1)' }]}>
                        <Text style={styles.priceText}>
                          {formatPrice(list.totalPrice)}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={hideDeleteDialog}>
          <Dialog.Title>{t('home.deleteDialog.title')}</Dialog.Title>
          <Dialog.Content>
            <Text>{t('home.deleteDialog.message')}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDeleteDialog}>{t('home.deleteDialog.cancel')}</Button>
            <Button onPress={handleDelete} textColor="#DC2626">{t('home.deleteDialog.delete')}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  searchContainer: {
    padding: 16,
  },
  searchBar: {
    backgroundColor: '#FFF8E3',
    elevation: 0,
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    backgroundColor: '#FFF8E3',
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  tagIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(230, 164, 180, 0.1)',
    borderRadius: 12,
    paddingRight: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingRight: 8,
  },
  itemCountIcon: {
    margin: 0,
  },
  priceIcon: {
    margin: 0,
  },
  cardDate: {
    color: '#666',
  },
  itemCount: {
    color: '#E6A4B4',
    fontWeight: '500',
  },
  priceText: {
    color: '#E6A4B4',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 20,
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default ArchivedListsScreen; 