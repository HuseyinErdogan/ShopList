import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Switch, List, Divider, Button, useTheme, Badge } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = () => {
  const [darkMode, setDarkMode] = useState(false);
  const theme = useTheme();

  const clearAllData = async () => {
    try {
      await AsyncStorage.clear();
      // You might want to add a confirmation dialog here
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Settings</Text>
        <Text style={styles.subHeaderText}>Customize your shopping experience</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <List.Item
          title="Dark Mode"
          description="Enable dark theme for the app"
          left={props => <List.Icon {...props} icon="theme-light-dark" color="#E6A4B4" />}
          right={() => (
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              color="#E6A4B4"
            />
          )}
        />
      </View>

      <Divider style={styles.divider} />

      <View style={styles.section}>
        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionTitle}>Shopping Features</Text>
          <Badge style={styles.comingSoonBadge}>Coming Soon</Badge>
        </View>
        <List.Item
          title="Show Price Totals"
          description="Display total prices for each list"
          left={props => <List.Icon {...props} icon="currency-usd" color="#CCCCCC" />}
          right={() => (
            <Switch
              disabled
              value={false}
              color="#CCCCCC"
            />
          )}
        />
        <List.Item
          title="Auto Calculate"
          description="Automatically calculate totals when prices change"
          left={props => <List.Icon {...props} icon="calculator" color="#CCCCCC" />}
          right={() => (
            <Switch
              disabled
              value={false}
              color="#CCCCCC"
            />
          )}
        />
        <List.Item
          title="Smart Categories"
          description="Automatically categorize items as you add them"
          left={props => <List.Icon {...props} icon="tag-multiple" color="#CCCCCC" />}
          right={() => (
            <Switch
              disabled
              value={false}
              color="#CCCCCC"
            />
          )}
        />
        <List.Item
          title="Shopping History"
          description="Track your shopping patterns and get insights"
          left={props => <List.Icon {...props} icon="chart-line" color="#CCCCCC" />}
          right={() => (
            <Switch
              disabled
              value={false}
              color="#CCCCCC"
            />
          )}
        />
      </View>

      <Divider style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        <List.Item
          title="Export Data"
          description="Export your lists as CSV"
          left={props => <List.Icon {...props} icon="export" color="#E6A4B4" />}
          onPress={() => {/* Implement export functionality */}}
        />
        <List.Item
          title="Import Data"
          description="Import lists from CSV"
          left={props => <List.Icon {...props} icon="import" color="#E6A4B4" />}
          onPress={() => {/* Implement import functionality */}}
        />
      </View>

      <Divider style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <List.Item
          title="Version"
          description="1.0.0"
          left={props => <List.Icon {...props} icon="information" color="#E6A4B4" />}
        />
      </View>

      <View style={styles.dangerZone}>
        <Text style={styles.dangerTitle}>Danger Zone</Text>
        <Button
          mode="contained"
          onPress={clearAllData}
          style={styles.dangerButton}
          labelStyle={styles.dangerButtonText}
        >
          Clear All Data
        </Button>
      </View>
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
});

export default SettingsScreen; 