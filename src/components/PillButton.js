import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../theme/ThemeContext";

export const PillButton = ({
  title,
  emoji,
  onPress,
  variant = "primary", // 'primary', 'secondary', 'outline', 'danger'
  size = "medium", // 'small', 'medium', 'large'
  disabled = false,
  style,
}) => {
  const theme = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: disabled
            ? theme.colors.textTertiary
            : theme.colors.primary,
          borderColor: "transparent",
        };
      case "secondary":
        return {
          backgroundColor: disabled
            ? theme.colors.surface
            : theme.colors.gentle,
          borderColor: "transparent",
        };
      case "outline":
        return {
          backgroundColor: "transparent",
          borderColor: disabled
            ? theme.colors.textTertiary
            : theme.colors.primary,
        };
      case "danger":
        return {
          backgroundColor: disabled
            ? theme.colors.textTertiary
            : theme.colors.error,
          borderColor: "transparent",
        };
      default:
        return {
          backgroundColor: theme.colors.primary,
          borderColor: "transparent",
        };
    }
  };

  const getTextColor = () => {
    if (disabled) {
      return variant === "outline" ? theme.colors.textTertiary : "#FFFFFF99";
    }

    switch (variant) {
      case "outline":
        return theme.colors.primary;
      default:
        return "#FFFFFF";
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return {
          paddingVertical: theme.spacing.xs,
          paddingHorizontal: theme.spacing.md,
          minHeight: theme.touchTargets.small,
        };
      case "large":
        return {
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.xl,
          minHeight: theme.touchTargets.large,
        };
      default: // medium
        return {
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.lg,
          minHeight: theme.touchTargets.medium,
        };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case "small":
        return theme.typography.footnote;
      case "large":
        return theme.typography.headline;
      default:
        return theme.typography.callout;
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();
  const textSize = getTextSize();

  const styles = StyleSheet.create({
    button: {
      ...sizeStyles,
      backgroundColor: variantStyles.backgroundColor,
      borderWidth: variant === "outline" ? 1 : 0,
      borderColor: variantStyles.borderColor,
      borderRadius: theme.borderRadius.xl,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      ...(!disabled && variant !== "outline" ? theme.shadows.small : {}),
    },
    text: {
      ...textSize,
      color: getTextColor(),
      fontWeight: "600",
      textAlign: "center",
    },
    emoji: {
      fontSize: textSize.fontSize + 2,
      marginRight: emoji ? theme.spacing.xs : 0,
    },
  });

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={disabled ? 1 : 0.8}
    >
      {emoji && <Text style={styles.emoji}>{emoji}</Text>}
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};
