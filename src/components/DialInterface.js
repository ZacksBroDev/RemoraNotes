import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, PanGestureHandler } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export const DialInterface = ({ options, onSelect, style }) => {
  const theme = useTheme();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleOptionPress = (index) => {
    setSelectedIndex(index);
    if (onSelect) {
      onSelect(options[index], index);
    }
  };

  const radius = 100;
  const centerX = radius + 20;
  const centerY = radius + 20;

  const styles = StyleSheet.create({
    container: {
      width: (radius + 20) * 2,
      height: (radius + 20) * 2,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    center: {
      position: 'absolute',
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
    },
    centerText: {
      color: theme.colors.background,
      fontSize: 24,
    },
    option: {
      position: 'absolute',
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: theme.colors.card,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    optionSelected: {
      backgroundColor: theme.colors.primary,
      transform: [{ scale: 1.2 }],
    },
    optionText: {
      fontSize: 20,
      textAlign: 'center',
    },
    optionLabel: {
      position: 'absolute',
      fontSize: 12,
      color: theme.colors.text,
      fontWeight: '600',
      textAlign: 'center',
    },
  });

  return (
    <View style={[styles.container, style]}>
      {/* Center button */}
      <TouchableOpacity style={styles.center}>
        <Text style={styles.centerText}>⚡</Text>
      </TouchableOpacity>

      {/* Option buttons arranged in a circle */}
      {options.map((option, index) => {
        const angle = (index * 2 * Math.PI) / options.length - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle) - 25;
        const y = centerY + radius * Math.sin(angle) - 25;
        
        const labelX = centerX + (radius + 35) * Math.cos(angle) - 20;
        const labelY = centerY + (radius + 35) * Math.sin(angle) - 10;

        return (
          <React.Fragment key={index}>
            <TouchableOpacity
              style={[
                styles.option,
                { left: x, top: y },
                selectedIndex === index && styles.optionSelected,
              ]}
              onPress={() => handleOptionPress(index)}
            >
              <Text style={styles.optionText}>{option.emoji}</Text>
            </TouchableOpacity>
            
            <Text
              style={[
                styles.optionLabel,
                { left: labelX, top: labelY, width: 40 }
              ]}
            >
              {option.label}
            </Text>
          </React.Fragment>
        );
      })}
    </View>
  );
};
