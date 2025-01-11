import AsyncStorage from '@react-native-async-storage/async-storage';

const LISTS_KEY = '@shopping_lists';
const ITEMS_KEY = '@list_items';
const ARCHIVED_LISTS_KEY = '@archived_lists';

export const saveList = async (list) => {
  try {
    const existingListsJson = await AsyncStorage.getItem(LISTS_KEY);
    const existingLists = existingListsJson ? JSON.parse(existingListsJson) : [];
    
    const totalPrice = list.items ? list.items.reduce((total, item) => total + (item.price || 0), 0) : 0;
    
    const newList = {
      ...list,
      id: list.id || Date.now().toString(),
      title: list.title || list.name,
      createdAt: new Date().toISOString(),
      itemCount: list.items ? list.items.length : 0,
      totalPrice: totalPrice,
      isArchived: false,
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

export const getLists = async (includeArchived = false) => {
  try {
    const listsJson = await AsyncStorage.getItem(LISTS_KEY);
    const lists = listsJson ? JSON.parse(listsJson) : [];
    return includeArchived ? lists : lists.filter(list => !list.isArchived);
  } catch (error) {
    console.error('Error getting lists:', error);
    return [];
  }
};

export const getArchivedLists = async () => {
  try {
    const listsJson = await AsyncStorage.getItem(LISTS_KEY);
    const lists = listsJson ? JSON.parse(listsJson) : [];
    return lists.filter(list => list.isArchived);
  } catch (error) {
    console.error('Error getting archived lists:', error);
    return [];
  }
};

export const archiveList = async (listId) => {
  try {
    const listsJson = await AsyncStorage.getItem(LISTS_KEY);
    const lists = listsJson ? JSON.parse(listsJson) : [];
    const updatedLists = lists.map(list => 
      list.id === listId ? { ...list, isArchived: true } : list
    );
    await AsyncStorage.setItem(LISTS_KEY, JSON.stringify(updatedLists));
  } catch (error) {
    console.error('Error archiving list:', error);
    throw error;
  }
};

export const unarchiveList = async (listId) => {
  try {
    const listsJson = await AsyncStorage.getItem(LISTS_KEY);
    const lists = listsJson ? JSON.parse(listsJson) : [];
    const updatedLists = lists.map(list => 
      list.id === listId ? { ...list, isArchived: false } : list
    );
    await AsyncStorage.setItem(LISTS_KEY, JSON.stringify(updatedLists));
  } catch (error) {
    console.error('Error unarchiving list:', error);
    throw error;
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
    
    // Calculate total price
    const total = items.reduce((sum, item) => sum + (item.price || 0), 0);
    
    // Update item count and total price in the list
    const listsJson = await AsyncStorage.getItem(LISTS_KEY);
    const lists = listsJson ? JSON.parse(listsJson) : [];
    const updatedLists = lists.map(list => 
      list.id === listId ? { ...list, itemCount: items.length, totalPrice: total } : list
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

export const calculateListTotal = async (listId) => {
  try {
    const items = await getListItems(listId);
    return items.reduce((total, item) => total + (item.price || 0), 0);
  } catch (error) {
    console.error('Error calculating list total:', error);
    return 0;
  }
};

export const updateListTotal = async (listId) => {
  try {
    const total = await calculateListTotal(listId);
    const listsJson = await AsyncStorage.getItem(LISTS_KEY);
    const lists = listsJson ? JSON.parse(listsJson) : [];
    const updatedLists = lists.map(list => 
      list.id === listId ? { ...list, totalPrice: total } : list
    );
    await AsyncStorage.setItem(LISTS_KEY, JSON.stringify(updatedLists));
    return total;
  } catch (error) {
    console.error('Error updating list total:', error);
    throw error;
  }
}; 