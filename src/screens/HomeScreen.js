import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';
import { FAB, Card, Text, useTheme, IconButton, Searchbar, Menu } from 'react-native-paper';
import { getLists, deleteList } from '../utils/storage';
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

const getTagShadowStyle = (tagColor) => {
  if (!tagColor) return {};
  
  return {
    shadowColor: tagColor,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.4,
    shadowRadius: 4.5,
    elevation: 6,
  };
};

const HomeScreen = ({ navigation }) => {
  const theme = useTheme();
  const [shoppingLists, setShoppingLists] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLists, setFilteredLists] = useState([]);
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [selectedTag, setSelectedTag] = useState(null);

  useEffect(() => {
    loadLists();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadLists();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    filterAndSortLists();
  }, [searchQuery, sortBy, selectedTag, shoppingLists]);

  const loadLists = async () => {
    const lists = await getLists();
    setShoppingLists(lists);
  };

  const filterAndSortLists = () => {
    let filtered = [...shoppingLists];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(list => 
        list.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply tag filter
    if (selectedTag) {
      filtered = filtered.filter(list => 
        list.tag?.id === selectedTag
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'items':
          return b.itemCount - a.itemCount;
        case 'date':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    setFilteredLists(filtered);
  };

  const handleDeleteList = async (listId) => {
    await deleteList(listId);
    loadLists();
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
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shopping Lists</Text>
        <IconButton
          icon="bell-outline"
          size={24}
          color="#E6A4B4"
          onPress={() => console.log('Notifications')}
        />
      </View>

      <View style={styles.filterContainer}>
        <Searchbar
          placeholder="Search lists"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor="#E6A4B4"
        />
        <Menu
          visible={sortMenuVisible}
          onDismiss={() => setSortMenuVisible(false)}
          anchor={
            <IconButton
              icon="sort-variant"
              size={24}
              color="#E6A4B4"
              style={styles.sortButton}
              onPress={() => setSortMenuVisible(true)}
            />
          }
        >
          <Menu.Item 
            onPress={() => { setSortBy('date'); setSortMenuVisible(false); }}
            title="Sort by Date"
            leadingIcon={sortBy === 'date' ? 'check' : 'calendar'}
          />
          <Menu.Item
            onPress={() => { setSortBy('name'); setSortMenuVisible(false); }}
            title="Sort by Name"
            leadingIcon={sortBy === 'name' ? 'check' : 'sort-alphabetical-ascending'}
          />
          <Menu.Item
            onPress={() => { setSortBy('items'); setSortMenuVisible(false); }}
            title="Sort by Items"
            leadingIcon={sortBy === 'items' ? 'check' : 'sort-numeric-descending'}
          />
        </Menu>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.tagsScroll}
        contentContainerStyle={styles.tagsContainer}
      >
        <TouchableOpacity
          style={[
            styles.tagChip,
            !selectedTag && [styles.selectedTagChip, { backgroundColor: '#E6A4B4' }],
            { borderColor: '#E6A4B4' }
          ]}
          onPress={() => setSelectedTag(null)}
        >
          <MaterialCommunityIcons
            name="tag-multiple"
            size={20}
            color={!selectedTag ? '#FFF8E3' : '#E6A4B4'}
          />
          <Text style={[
            styles.tagChipText,
            !selectedTag && styles.selectedTagChipText,
            { color: !selectedTag ? '#FFF8E3' : '#E6A4B4' }
          ]}>
            All
          </Text>
        </TouchableOpacity>
        {TAGS.map((tag) => (
          <TouchableOpacity
            key={tag.id}
            style={[
              styles.tagChip,
              selectedTag === tag.id && [styles.selectedTagChip, { backgroundColor: tag.color }],
              { borderColor: tag.color }
            ]}
            onPress={() => setSelectedTag(tag.id)}
          >
            <MaterialCommunityIcons
              name={tag.icon}
              size={20}
              color={selectedTag === tag.id ? '#FFF8E3' : tag.color}
            />
            <Text style={[
              styles.tagChipText,
              selectedTag === tag.id && styles.selectedTagChipText,
              { color: selectedTag === tag.id ? '#FFF8E3' : tag.color }
            ]}>
              {tag.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {filteredLists.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconButton
              icon="basket-off-outline"
              size={80}
              color="#E6A4B4"
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyText}>
              {searchQuery || selectedTag ? 'No matching lists found' : 'No shopping lists yet'}
            </Text>
            <Text style={styles.emptySubText}>
              {searchQuery || selectedTag ? 'Try different filters' : 'Create your first list by tapping the + button'}
            </Text>
          </View>
        ) : (
          filteredLists.map((list) => {
            const tagColor = TAGS.find(t => t.id === list.tag?.id)?.color;
            
            return (
              <Card
                key={list.id}
                style={[
                  styles.card,
                  getTagShadowStyle(tagColor)
                ]}
                onPress={() => navigation.navigate('ListDetails', {
                  listId: list.id,
                  listTitle: list.title,
                  note: list.note,
                  tag: list.tag
                })}
              >
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardTitleContainer}>
                      {list.tag && (
                        <View style={[styles.tagIndicator, { backgroundColor: tagColor }]}>
                          <MaterialCommunityIcons
                            name={list.tag.icon}
                            size={16}
                            color="#FFF8E3"
                          />
                        </View>
                      )}
                      <Text style={styles.cardTitle}>{list.title}</Text>
                    </View>
                    <IconButton
                      icon="delete-outline"
                      size={24}
                      onPress={() => handleDeleteList(list.id)}
                      style={styles.optionsButton}
                    />
                  </View>
                  <View style={styles.cardDetails}>
                    <Text style={styles.cardDate}>{formatDate(list.createdAt)}</Text>
                    <View style={styles.itemCountContainer}>
                      <IconButton
                        icon="shopping-outline"
                        size={16}
                        color={tagColor || "#E6A4B4"}
                        style={styles.itemCountIcon}
                      />
                      <Text style={[
                        styles.itemCount,
                        tagColor && { color: tagColor }
                      ]}>{list.itemCount} items</Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            );
          })
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('CreateList')}
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#F5EEE6',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    letterSpacing: 0.5,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
    gap: 8,
  },
  searchBar: {
    flex: 1,
    backgroundColor: '#FFF8E3',
    borderRadius: 12,
    elevation: 0,
    height: 46,
  },
  searchInput: {
    fontSize: 16,
  },
  sortButton: {
    backgroundColor: '#FFF8E3',
    borderRadius: 12,
  },
  tagsScroll: {
    maxHeight: 50,
    marginBottom: 8,
  },
  tagsContainer: {
    paddingHorizontal: 20,
    gap: 8,
    paddingVertical: 4,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E3',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E6A4B4',
    gap: 6,
  },
  selectedTagChip: {
    borderColor: 'transparent',
  },
  tagChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#E6A4B4',
  },
  selectedTagChipText: {
    color: '#FFF8E3',
  },
  listContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 12,
  },
  card: {
    marginBottom: 16,
    backgroundColor: '#FFF8E3',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4.5,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(230, 164, 180, 0.1)',
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
    letterSpacing: 0.3,
    flex: 1,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(230, 164, 180, 0.1)',
  },
  itemCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(230, 164, 180, 0.1)',
    borderRadius: 12,
    paddingRight: 8,
  },
  itemCountIcon: {
    margin: 0,
  },
  cardDate: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  itemCount: {
    color: '#E6A4B4',
    fontWeight: '600',
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    margin: 20,
    right: 0,
    bottom: 20,
    backgroundColor: '#E6A4B4',
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
  optionsButton: {
    margin: -8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyIcon: {
    margin: 0,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    color: '#666',
    marginBottom: 12,
    fontWeight: '600',
  },
  emptySubText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 22,
  },
});

export default HomeScreen; 