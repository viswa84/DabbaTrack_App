import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import React, { useMemo, useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/layout';

type Customer = {
  id: string;
  name: string;
  phone: string;
  planName: string;
  vegType: string;
  status: string;
  address: string;
  boxesThisMonth: number;
  isPaid: boolean;
};

type CustomersQueryData = {
  customers: Customer[];
  planBreakdown: { label: string; customers: number; percentage: number }[];
};

const CUSTOMERS_QUERY = gql`
  query AdminCustomers {
    customers {
      id
      name
      phone
      planName
      vegType
      status
      address
      boxesThisMonth
      isPaid
    }
    planBreakdown {
      label
      customers
      percentage
    }
  }
`;

type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

export const CustomersScreen = () => {
  const { data } = useQuery<CustomersQueryData>(CUSTOMERS_QUERY);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [showForm, setShowForm] = useState(false);

  // New customer form state (reusable for edit later)
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [prefersLunch, setPrefersLunch] = useState(true);
  const [prefersDinner, setPrefersDinner] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Local list to represent new customers (since API for create/edit will come later)
  const [localCustomers, setLocalCustomers] = useState<Customer[]>([]);

  const combinedList = useMemo(() => [...(data?.customers ?? []), ...localCustomers], [data, localCustomers]);
  const totalCount = combinedList.length;

  const filtered = useMemo(() => {
    const lowered = query.toLowerCase();
    const searched = combinedList.filter(
      (customer) =>
        customer.name.toLowerCase().includes(lowered) || customer.phone.includes(query),
    );
    if (statusFilter === 'ALL') return searched;
    return searched.filter((customer) =>
      statusFilter === 'ACTIVE' ? customer.status === 'ACTIVE' : customer.status !== 'ACTIVE',
    );
  }, [combinedList, query, statusFilter]);

  const resetForm = () => {
    setNewName('');
    setNewPhone('');
    setNewDescription('');
    setPrefersLunch(true);
    setPrefersDinner(false);
    setIsActive(true);
  };

  const handleCreateLocal = () => {
    const id = `LOCAL-${Date.now()}`;
    setLocalCustomers((prev) => [
      {
        id,
        name: newName || 'New customer',
        phone: newPhone || '9000000000',
        planName:
          prefersLunch && prefersDinner
            ? 'Lunch + Dinner'
            : prefersLunch
              ? 'Lunch'
              : 'Dinner',
        vegType: 'VEG',
        status: isActive ? 'ACTIVE' : 'INACTIVE',
        address: newDescription || 'Description pending',
        boxesThisMonth: 0,
        isPaid: false,
      },
      ...prev,
    ]);
    resetForm();
    setShowForm(false);
  };

  const toggleCheckbox = (value: boolean, setter: (v: boolean) => void) => setter(!value);

  return (
    <Screen>
      <View style={styles.headerRow}>
        <SectionHeader title="Customers" actionLabel={`${totalCount} total`} />
        <TouchableOpacity style={styles.addFab} onPress={() => setShowForm(true)} activeOpacity={0.9}>
          <Text style={styles.addFabText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filtersRow}>
        {(['ALL', 'ACTIVE', 'INACTIVE'] as StatusFilter[]).map((status) => (
          <TouchableOpacity
            key={status}
            style={[styles.filterChip, statusFilter === status && styles.filterChipActive]}
            onPress={() => setStatusFilter(status)}
          >
            <Text
              style={[
                styles.filterChipText,
                statusFilter === status && styles.filterChipTextActive,
              ]}
            >
              {status === 'ALL' ? 'All' : status === 'ACTIVE' ? 'Active' : 'Inactive'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        placeholder="Search name or phone"
        placeholderTextColor={colors.textSecondary}
        value={query}
        onChangeText={setQuery}
        style={styles.search}
      />

      {data?.planBreakdown && (
        <View style={styles.planChips}>
          {data.planBreakdown.map((plan) => (
            <Text key={plan.label} style={styles.planChip}>
              {plan.label}: {plan.customers} ({plan.percentage}%)
            </Text>
          ))}
        </View>
      )}

      {filtered.map((customer) => (
        <Card key={customer.id}>
          <View style={styles.header}>
            <View>
              <Text style={styles.name}>{customer.name}</Text>
            </View>
            <Text
              style={[
                styles.status,
                { color: customer.status === 'ACTIVE' ? colors.success : colors.info },
              ]}
            >
              {customer.status}
            </Text>
          </View>
          <Text style={styles.phone}>+91 {customer.phone}</Text>
          <Text style={styles.plan}>
            {customer.planName} Aú {customer.vegType}
          </Text>
          <Text style={styles.address}>{customer.address}</Text>
          <View style={styles.footer}>
            <Text style={styles.boxes}>Boxes: {customer.boxesThisMonth}</Text>
            <Text style={{ color: customer.isPaid ? colors.success : colors.warning }}>
              {customer.isPaid ? 'Paid' : 'Unpaid'}
            </Text>
          </View>
        </Card>
      ))}

      <Modal visible={showForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add customer</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowForm(false);
                  resetForm();
                }}
              >
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <TextInput
                style={styles.input}
                placeholder="Full name"
                placeholderTextColor={colors.textSecondary}
                value={newName}
                onChangeText={setNewName}
              />
              <TextInput
                style={styles.input}
                placeholder="Phone number"
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
                maxLength={10}
                value={newPhone}
                onChangeText={(v) => setNewPhone(v.replace(/\D/g, '').slice(0, 10))}
              />
              <TextInput
                style={styles.input}
                placeholder="Description / address"
                placeholderTextColor={colors.textSecondary}
                value={newDescription}
                onChangeText={setNewDescription}
              />

              <View style={styles.checkboxRow}>
                <TouchableOpacity
                  style={[styles.checkbox, prefersLunch && styles.checkboxActive]}
                  onPress={() => toggleCheckbox(prefersLunch, setPrefersLunch)}
                >
                  <Text style={styles.checkboxLabel}>Lunch</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.checkbox, prefersDinner && styles.checkboxActive]}
                  onPress={() => toggleCheckbox(prefersDinner, setPrefersDinner)}
                >
                  <Text style={styles.checkboxLabel}>Dinner</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.activeToggle, isActive && styles.activeToggleOn]}
                onPress={() => setIsActive((prev) => !prev)}
                activeOpacity={0.85}
              >
                <View
                  style={[
                    styles.activeDot,
                    isActive ? styles.activeDotOn : styles.activeDotOff,
                  ]}
                />
                <Text style={styles.activeLabel}>{isActive ? 'Active' : 'Inactive'}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.modalCta} onPress={handleCreateLocal} activeOpacity={0.9}>
              <Text style={styles.modalCtaText}>Save customer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Screen>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  search: {
    backgroundColor: colors.card,
    borderRadius: spacing.md,
    padding: spacing.md,
    color: colors.textPrimary,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  filterChipActive: {
    borderColor: colors.brandPrimary,
    backgroundColor: 'rgba(249,115,22,0.12)',
  },
  filterChipText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: colors.brandPrimary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  name: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  phone: {
    color: colors.textSecondary,
  },
  status: {
    fontWeight: '600',
  },
  plan: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  planChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  planChip: {
    fontSize: 12,
    color: colors.textSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  address: {
    color: colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  boxes: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  addFab: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.brandPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.brandPrimary,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
  },
  addFabText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: spacing.lg,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  closeText: {
    color: colors.textSecondary,
    fontSize: 18,
  },
  modalBody: {
    gap: spacing.sm,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: spacing.md,
    padding: spacing.sm,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  checkboxRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  checkbox: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.card,
  },
  checkboxActive: {
    borderColor: colors.brandPrimary,
    backgroundColor: 'rgba(249,115,22,0.12)',
  },
  checkboxLabel: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  activeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  activeToggleOn: {
    borderColor: colors.success,
    backgroundColor: 'rgba(34,197,94,0.12)',
  },
  activeDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  activeDotOn: {
    backgroundColor: colors.success,
  },
  activeDotOff: {
    backgroundColor: colors.border,
  },
  activeLabel: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  modalCta: {
    backgroundColor: colors.brandPrimary,
    borderRadius: spacing.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  modalCtaText: {
    color: '#fff',
    fontWeight: '800',
  },
});
