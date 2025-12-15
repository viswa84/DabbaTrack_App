import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import React, { useState } from 'react';
import { StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { useAppContext } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/layout';
import { formatCurrency } from '../../utils/format';

type SettingsQueryData = {
  mealWindows: { meal: string; cutoffTime: string; price: number }[];
};

const SETTINGS_QUERY = gql`
  query SettingsData {
    mealWindows {
      meal
      cutoffTime
      price
    }
  }
`;

const UPDATE_MEAL = gql`
  mutation UpdateMealWindow($meal: String!, $cutoffTime: String!, $price: Float!) {
    updateMealWindow(meal: $meal, cutoffTime: $cutoffTime, price: $price) {
      meal
      cutoffTime
      price
    }
  }
`;

export const SettingsScreen = () => {
  const { logout } = useAppContext();
  const [autoReminders, setAutoReminders] = useState(true);
  const [enableWeekendPlan, setEnableWeekendPlan] = useState(false);
  const { data } = useQuery<SettingsQueryData>(SETTINGS_QUERY);
  const [updateMeal] = useMutation(UPDATE_MEAL, { refetchQueries: [{ query: SETTINGS_QUERY }] });

  const handleUpdateMeal = (meal: string, cutoffTime: string, price: number) => {
    updateMeal({ variables: { meal, cutoffTime, price } }).catch(() => undefined);
  };

  return (
    <Screen>
      <SectionHeader title="Settings" />
      <Card>
        <Text style={styles.label}>Cutoff times & pricing</Text>
        {data?.mealWindows?.map((meal) => (
          <View key={meal.meal} style={styles.mealRow}>
            <Text style={styles.mealTitle}>{meal.meal}</Text>
            <View style={styles.mealInputs}>
              <TextInput
                defaultValue={meal.cutoffTime}
                style={styles.smallInput}
                placeholder="HH:mm"
                placeholderTextColor={colors.textSecondary}
                onEndEditing={(e) => handleUpdateMeal(meal.meal, e.nativeEvent.text || meal.cutoffTime, meal.price)}
              />
              <TextInput
                defaultValue={String(meal.price)}
                style={styles.smallInput}
                keyboardType="numeric"
                placeholder="Price"
                placeholderTextColor={colors.textSecondary}
                onEndEditing={(e) =>
                  handleUpdateMeal(meal.meal, meal.cutoffTime, Number(e.nativeEvent.text || meal.price))
                }
              />
            </View>
            <Text style={styles.helper}>{formatCurrency(meal.price)} · cutoff {meal.cutoffTime}</Text>
          </View>
        ))}
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Send auto reminders</Text>
          <Switch value={autoReminders} onValueChange={setAutoReminders} thumbColor={colors.brandPrimary} />
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Weekend-only plan</Text>
          <Switch value={enableWeekendPlan} onValueChange={setEnableWeekendPlan} thumbColor={colors.brandPrimary} />
        </View>
      </Card>
      <Card>
        <SectionHeader title="Plan templates" />
        <View style={styles.template}>
          <Text style={styles.templateTitle}>Classic Veg</Text>
          <Text style={styles.templateSubtitle}>₹4500 · 2 meals/day</Text>
        </View>
        <View style={styles.template}>
          <Text style={styles.templateTitle}>Protein Power (Non-veg)</Text>
          <Text style={styles.templateSubtitle}>₹5200 · 2 meals/day</Text>
        </View>
        <Text style={styles.helper}>Future release: connect this screen to backend mutations.</Text>
      </Card>
      <Card>
        <Text style={styles.logoutTitle}>Session</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.9}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  label: {
    color: colors.textSecondary,
    textTransform: 'uppercase',
    fontSize: 12,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  switchLabel: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  template: {
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  templateTitle: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  templateSubtitle: {
    color: colors.textSecondary,
  },
  helper: {
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  logoutTitle: {
    color: colors.textSecondary,
    fontSize: 12,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  logoutButton: {
    backgroundColor: '#dc2626',
    paddingVertical: spacing.sm,
    borderRadius: spacing.md,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontWeight: '700',
  },
  mealRow: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  mealTitle: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  mealInputs: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  smallInput: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: spacing.md,
    padding: spacing.sm,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
