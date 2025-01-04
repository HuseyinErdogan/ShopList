import AsyncStorage from '@react-native-async-storage/async-storage';

const LISTS_KEY = '@shopping_lists';
const ITEMS_KEY = '@list_items';

export const saveList = async (list) => {
  try {
    const existingListsJson = await AsyncStorage.getItem(LISTS_KEY);
    const existingLists = existingListsJson ? JSON.parse(existingListsJson) : [];
    
    const newList = {
      ...list,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      itemCount: list.items ? list.items.length : 0,
    };
    
    const updatedLists = [newList, ...existingLists];
    await AsyncStorage.setItem(LISTS_KEY, JSON.stringify(updatedLists));
    
    if (list.items) {
      await AsyncStorage.setItem(`${ITEMS_KEY}_${newList.id}`, JSON.stringify(list.items));
    }
    
    return newList;
  } catch (error) {
    console.error('Error saving list:', error);
    throw error;
  }
};

export const getLists = async () => {
  try {
    const listsJson = await AsyncStorage.getItem(LISTS_KEY);
    return listsJson ? JSON.parse(listsJson) : [];
  } catch (error) {
    console.error('Error getting lists:', error);
    return [];
  }
};

export const getListItems = async (listId) => {
  try {
    const itemsJson = await AsyncStorage.getItem(`${ITEMS_KEY}_${listId}`);
    return itemsJson ? JSON.parse(itemsJson) : [];
  } catch (error) {
    console.error('Error getting list items:', error);
    return [];
  }
};

export const updateListItems = async (listId, items) => {
  try {
    await AsyncStorage.setItem(`${ITEMS_KEY}_${listId}`, JSON.stringify(items));
    
    // Update item count in the list
    const listsJson = await AsyncStorage.getItem(LISTS_KEY);
    const lists = listsJson ? JSON.parse(listsJson) : [];
    const updatedLists = lists.map(list => 
      list.id === listId ? { ...list, itemCount: items.length } : list
    );
    await AsyncStorage.setItem(LISTS_KEY, JSON.stringify(updatedLists));
  } catch (error) {
    console.error('Error updating list items:', error);
    throw error;
  }
};

export const deleteList = async (listId) => {
  try {
    const listsJson = await AsyncStorage.getItem(LISTS_KEY);
    const lists = listsJson ? JSON.parse(listsJson) : [];
    const updatedLists = lists.filter(list => list.id !== listId);
    await AsyncStorage.setItem(LISTS_KEY, JSON.stringify(updatedLists));
    await AsyncStorage.removeItem(`${ITEMS_KEY}_${listId}`);
  } catch (error) {
    console.error('Error deleting list:', error);
    throw error;
  }
}; 