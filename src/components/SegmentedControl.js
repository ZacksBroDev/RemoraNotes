import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export const SegmentedControl = ({ 
  segments, 
  selectedIndex, 
  onSelectionChange,
  style 
}) => {
  const theme = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: 2,
      ...theme.shadows.small,
    },
    segment: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.borderRadius.sm,
      minHeight: theme.touchTargets.small,
    },
    selectedSegment: {
      backgroundColor: theme.colors.primary,
      ...theme.shadows.small,
    },
    segmentText: {
      ...theme.typography.callout,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    selectedSegmentText: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
  });

  return (
    <View style={[styles.container, style]}>
      {segments.map((segment, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.segment,
            selectedIndex === index && styles.selectedSegment,
          ]}
          onPress={() => onSelectionChange(index)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.segmentText,
              selectedIndex === index && styles.selectedSegmentText,
            ]}
          >
            {segment.emoji ? `${segment.emoji} ${segment.title}` : segment.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
