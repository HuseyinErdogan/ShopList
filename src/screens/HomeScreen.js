import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { FAB, Card, Text, useTheme, IconButton } from 'react-native-paper';
import { getLists, deleteList } from '../utils/storage';

const HomeScreen = ({ navigation }) => {
  const theme = useTheme();
  const [shoppingLists, setShoppingLists] = useState([]);

  useEffect(() => {
    loadLists();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadLists();
    });

    return unsubscribe;
  }, [navigation]);

  const loadLists = async () => {
    const lists = await getLists();
    setShoppingLists(lists);
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
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <View style={{ width: 40 }} />
          <Text style={styles.header}>My Shopping Lists</Text>
          <IconButton
            icon="bell-outline"
            size={24}
            color="#FFF8E3"
            onPress={() => console.log('Notifications')}
          />
        </View>
      </View>
      
      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {shoppingLists.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No shopping lists yet</Text>
            <Text style={styles.emptySubText}>Create your first list by tapping the + button</Text>
          </View>
        ) : (
          shoppingLists.map((list) => (
            <Card
              key={list.id}
              style={styles.card}
              onPress={() => navigation.navigate('ListDetails', {
                listId: list.id,
                listTitle: list.title,
                note: list.note
              })}
            >
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{list.title}</Text>
                  <IconButton
                    icon="delete-outline"
                    size={24}
                    onPress={() => handleDeleteList(list.id)}
                    style={styles.optionsButton}
                  />
                </View>
                <View style={styles.cardDetails}>
                  <Text style={styles.cardDate}>{formatDate(list.createdAt)}</Text>
                  <Text style={styles.itemCount}>{list.itemCount} items</Text>
                </View>
              </Card.Content>
            </Card>
          ))
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
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF8E3',
    textAlign: 'center',
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    backgroundColor: '#FFF8E3',
    elevation: 4,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cardDate: {
    color: '#666',
  },
  itemCount: {
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
  optionsButton: {
    margin: -8,
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
});

export default HomeScreen; 