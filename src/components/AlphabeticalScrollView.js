import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export const AlphabeticalScrollView = ({ data, renderItem, style }) => {
  const theme = useTheme();
  const scrollViewRef = useRef(null);
  const [itemPositions, setItemPositions] = useState({});

  // Group data by first letter
  const groupedData = data.reduce((acc, item) => {
    const firstLetter = item.name.charAt(0).toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(item);
    return acc;
  }, {});

  // Create sorted alphabet
  const alphabet = Object.keys(groupedData).sort();
  const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const handleLetterPress = (letter) => {
    const position = itemPositions[letter];
    if (position !== undefined && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: position, animated: true });
    }
  };

  const handleSectionLayout = (letter, event) => {
    const { y } = event.nativeEvent.layout;
    setItemPositions(prev => ({ ...prev, [letter]: y }));
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'row',
    },
    scrollContainer: {
      flex: 1,
    },
    alphabetContainer: {
      position: 'absolute',
      right: 0,
      top: 0,
      bottom: 0,
      width: 24,
      justifyContent: 'center',
      backgroundColor: theme.colors.background + 'E0',
      zIndex: 1,
    },
    letterButton: {
      paddingVertical: 1,
      paddingHorizontal: 4,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 16,
    },
    letterText: {
      fontSize: 10,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    letterTextDisabled: {
      color: theme.colors.textSecondary,
      opacity: 0.5,
    },
    sectionHeader: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    sectionHeaderText: {
      ...theme.typography.headline,
      color: theme.colors.primary,
      fontWeight: '600',
    },
  });

  return (
    <View style={[styles.container, style]}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {alphabet.map((letter) => (
          <View
            key={letter}
            onLayout={(event) => handleSectionLayout(letter, event)}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>{letter}</Text>
            </View>
            {groupedData[letter].map((item) => renderItem(item))}
          </View>
        ))}
      </ScrollView>
      
      <View style={styles.alphabetContainer}>
        {allLetters.map((letter) => {
          const hasData = alphabet.includes(letter);
          return (
            <TouchableOpacity
              key={letter}
              style={styles.letterButton}
              onPress={() => hasData && handleLetterPress(letter)}
              disabled={!hasData}
            >
              <Text
                style={[
                  styles.letterText,
                  !hasData && styles.letterTextDisabled,
                ]}
              >
                {letter}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
