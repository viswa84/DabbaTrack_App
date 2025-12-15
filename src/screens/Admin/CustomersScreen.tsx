import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/layout';

type CustomersQueryData = {
  customers: {
    id: string;
    name: string;
    phone: string;
    planName: string;
    vegType: string;
    status: string;
    address: string;
    boxesThisMonth: number;
    isPaid: boolean;
  }[];
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

const CREATE_CUSTOMER = gql`
  mutation CreateCustomer($name: String!, $phone: String!, $vegType: String!, $planName: String!, $planPrice: Float!) {
    createCustomer(name: $name, phone: $phone, vegType: $vegType, planName: $planName, planPrice: $planPrice) {
      id
      name
      phone
      vegType
      planName
      planPrice
      status
      address
      boxesThisMonth
      isPaid
    }
  }
`;

export const CustomersScreen = () => {
  const { data } = useQuery<CustomersQueryData>(CUSTOMERS_QUERY);
  const [query, setQuery] = useState('');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPlan, setNewPlan] = useState('Classic Veg');
  const [newVeg, setNewVeg] = useState('VEG');
  const [newPrice, setNewPrice] = useState('4500');
  const [createCustomer] = useMutation(CREATE_CUSTOMER, { refetchQueries: [{ query: CUSTOMERS_QUERY }] });

  const filtered = useMemo(() => {
    const list = data?.customers ?? [];
    if (!query) {
      return list;
    }
    const lowered = query.toLowerCase();
    return list.filter((customer: any) => customer.name.toLowerCase().includes(lowered) || customer.phone.includes(query));
  }, [data, query]);

  return (
    <Screen>
      <SectionHeader title="Customers" actionLabel={`${filtered.length} total`} />
      <TextInput
        placeholder="Search name or phone"
        placeholderTextColor={colors.textSecondary}
        value={query}
        onChangeText={setQuery}
        style={styles.search}
      />
      <Card>
        <SectionHeader title="Quick create user" />
        <View style={styles.addForm}>
          <TextInput
            placeholder="Name"
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
            value={newName}
            onChangeText={setNewName}
          />
          <TextInput
            placeholder="Phone"
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
            keyboardType="phone-pad"
            value={newPhone}
            onChangeText={setNewPhone}
          />
          <View style={styles.row}>
            <TextInput
              placeholder="Plan name"
              placeholderTextColor={colors.textSecondary}
              style={[styles.input, styles.half]}
              value={newPlan}
              onChangeText={setNewPlan}
            />
            <TextInput
              placeholder="Veg/Non-veg/Jain"
              placeholderTextColor={colors.textSecondary}
              style={[styles.input, styles.half]}
              value={newVeg}
              onChangeText={setNewVeg}
            />
          </View>
          <TextInput
            placeholder="Plan price"
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
            keyboardType="numeric"
            value={newPrice}
            onChangeText={setNewPrice}
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={() =>
              createCustomer({
                variables: { name: newName || 'New User', phone: newPhone || '9000000000', vegType: newVeg || 'VEG', planName: newPlan || 'Plan', planPrice: Number(newPrice || 0) },
              }).finally(() => {
                setNewName('');
                setNewPhone('');
              })
            }
          >
            <Text style={styles.addButtonText}>Create user</Text>
          </TouchableOpacity>
        </View>
      </Card>
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
              <Text style={styles.phone}>+91 {customer.phone}</Text>
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
          <Text style={styles.plan}>
            {customer.planName} · {customer.vegType}
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
    </Screen>
  );
};

const styles = StyleSheet.create({
  search: {
    backgroundColor: colors.card,
    borderRadius: spacing.md,
    padding: spacing.md,
    color: colors.textPrimary,
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
  addForm: {
    gap: spacing.xs,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: spacing.md,
    padding: spacing.sm,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  half: {
    flex: 1,
  },
  addButton: {
    backgroundColor: colors.brandPrimary,
    borderRadius: spacing.md,
    padding: spacing.sm,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
