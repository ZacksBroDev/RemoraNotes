import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export const ListRow = ({ 
  title,
  subtitle,
  emoji,
  rightElement,
  color,
  onPress,
  style
}) => {
  const theme = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surfaceSecondary,
      borderRadius: theme.borderRadius.lg,
      marginVertical: theme.spacing.xs,
      marginHorizontal: theme.spacing.md,
      ...theme.shadows.small,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      minHeight: theme.touchTargets.large,
    },
    colorIndicator: {
      width: 4,
      height: 32,
      borderRadius: 2,
      marginRight: theme.spacing.md,
    },
    emoji: {
      fontSize: 24,
      marginRight: theme.spacing.md,
    },
    textContainer: {
      flex: 1,
    },
    title: {
      ...theme.typography.headline,
      color: theme.colors.text,
      marginBottom: 2,
    },
    subtitle: {
      ...theme.typography.subhead,
      color: theme.colors.textSecondary,
    },
    rightContainer: {
      alignItems: 'flex-end',
      justifyContent: 'center',
    },
  });

  const Row = (
    <View style={[styles.container, style]}>
      <View style={styles.content}>
        {color && (
          <View 
            style={[
              styles.colorIndicator, 
              { backgroundColor: color }
            ]} 
          />
        )}
        
        {emoji && (
          <Text style={styles.emoji}>{emoji}</Text>
        )}
        
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={2}>
              {subtitle}
            </Text>
          )}
        </View>
        
        {rightElement && (
          <View style={styles.rightContainer}>
            {rightElement}
          </View>
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity 
        onPress={onPress} 
        activeOpacity={0.8}
        style={{ backgroundColor: 'transparent' }}
      >
        {Row}
      </TouchableOpacity>
    );
  }

  return Row;
};
