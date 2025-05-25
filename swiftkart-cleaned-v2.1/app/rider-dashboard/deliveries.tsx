import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useThemeStore } from '@/store/theme-store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Search, 
  Filter, 
  Truck, 
  ChevronRight, 
  Clock, 
  CheckCircle, 
  Navigation, 
  MapPin, 
  XCircle,
  DollarSign
} from 'lucide-react-native';
import { getStatusColor, formatStatus, formatDate } from '@/utils/status-utils';

// Mock deliveries data
const mockDeliveries = [
  {
    id: 'delivery-101',
    orderId: 'order-101',
    vendor: {
      id: 'vendor-1',
      name: 'Fresh Eats',
      address: '123 Main St, Old Harbor, CA',
      coordinates: {
        latitude: 37.7749,
        longitude: -122.4194,
      },
    },
    customer: {
      id: 'user-1',
      name: 'John Doe',
      address: '456 Market St, Old Harbor, CA',
      coordinates: {
        latitude: 37.7833,
        longitude: -122.4167,
      },
    },
    distance: 2.4,
    earnings: 8.50,
    status: 'assigned',
    createdAt: '2023-05-16T14:30:00.000Z',
  },
  {
    id: 'delivery-102',
    orderId: 'order-102',
    vendor: {
      id: 'vendor-2',
      name: 'Quick Mart',
      address: '789 Oak St, Old Harbor, CA',
      coordinates: {
        latitude: 37.7694,
        longitude: -122.4862,
      },
    },
    customer: {
      id: 'user-2',
      name: 'Jane Smith',
      address: '101 Pine St, Old Harbor, CA',
      coordinates: {
        latitude: 37.7924,
        longitude: -122.4102,
      },
    },
    distance: 3.2,
    earnings: 9.25,
    status: 'picked_up',
    createdAt: '2023-05-16T15:00:00.000Z',
  },
  {
    id: 'delivery-103',
    orderId: 'order-103',
    vendor: {
      id: 'vendor-3',
      name: 'MediCare Pharmacy',
      address: '222 Health St, Old Harbor, CA',
      coordinates: {
        latitude: 37.7834,
        longitude: -122.4330,
      },
    },
    customer: {
      id: 'user-3',
      name: 'Mike Johnson',
      address: '333 Wellness Ave, Old Harbor, CA',
      coordinates: {
        latitude: 37.7896,
        longitude: -122.4258,
      },
    },
    distance: 1.8,
    earnings: 7.75,
    status: 'delivered',
    createdAt: '2023-05-16T15:30:00.000Z',
  },
  {
    id: 'delivery-104',
    orderId: 'order-104',
    vendor: {
      id: 'vendor-4',
      name: 'Tech Store',
      address: '444 Gadget Blvd, Old Harbor, CA',
      coordinates: {
        latitude: 37.7759,
        longitude: -122.4245,
      },
    },
    customer: {
      id: 'user-4',
      name: 'Sarah Williams',
      address: '555 Digital Dr, Old Harbor, CA',
      coordinates: {
        latitude: 37.7731,
        longitude: -122.4098,
      },
    },
    distance: 4.1,
    earnings: 10.25,
    status: 'assigned',
    createdAt: '2023-05-16T16:00:00.000Z',
  },
  {
    id: 'delivery-105',
    orderId: 'order-105',
    vendor: {
      id: 'vendor-1',
      name: 'Fresh Eats',
      address: '123 Main St, Old Harbor, CA',
      coordinates: {
        latitude: 37.7749,
        longitude: -122.4194,
      },
    },
    customer: {
      id: 'user-5',
      name: 'David Brown',
      address: '666 Flavor St, Old Harbor, CA',
      coordinates: {
        latitude: 37.7831,
        longitude: -122.4181,
      },
    },
    distance: 2.8,
    earnings: 8.95,
    status: 'cancelled',
    createdAt: '2023-05-16T16:30:00.000Z',
  },
];

export default function DeliveriesScreen() {
  const { colors } = useThemeStore();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  
  // Filter deliveries based on search query and selected status
  const filteredDeliveries = mockDeliveries.filter(delivery => {
    const matchesSearch = 
      delivery.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === null || delivery.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });
  
  const handleDeliveryPress = (deliveryId: string) => {
    router.push(`/rider-dashboard/delivery/${deliveryId}`);
  };
  
  const handleNavigateToDelivery = (delivery: any) => {
    // In a real app, this would open the map with directions
    if (Platform.OS === 'web') {
      // For web, open Google Maps in a new tab
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${delivery.customer.coordinates.latitude},${delivery.customer.coordinates.longitude}`,
        '_blank'
      );
    } else {
      // For mobile, navigate to the map screen with coordinates
      router.push({
        pathname: '/rider-dashboard/map',
        params: {
          latitude: delivery.customer.coordinates.latitude,
          longitude: delivery.customer.coordinates.longitude,
          deliveryId: delivery.id,
        },
      });
    }
  };
  
  const updateDeliveryStatus = (deliveryId: string, newStatus: string) => {
    // In a real app, this would update the delivery status in the backend
    alert(`Delivery ${deliveryId} updated to ${newStatus}`);
  };
  
  const getStatusIcon = (status: string, colors: any) => {
    switch (status) {
      case 'assigned':
        return <Clock size={16} color={getStatusColor(status, colors)} />;
      case 'picked_up':
        return <Navigation size={16} color={getStatusColor(status, colors)} />;
      case 'delivered':
        return <CheckCircle size={16} color={getStatusColor(status, colors)} />;
      case 'cancelled':
        return <XCircle size={16} color={getStatusColor(status, colors)} />;
      default:
        return <Clock size={16} color={getStatusColor(status, colors)} />;
    }
  };
  
  const renderDeliveryItem = ({ item }: { item: any }) => (
    <Card
      style={styles.deliveryCard}
      onPress={() => handleDeliveryPress(item.id)}
      elevation={1}
    >
      <View style={styles.deliveryHeader}>
        <View style={styles.deliveryInfo}>
          <Text style={[styles.deliveryId, { color: colors.text }]}>
            #{item.id.split('-')[1]}
          </Text>
          <Text style={[styles.deliveryDate, { color: colors.muted }]}>
            {formatDate(item.createdAt)}
          </Text>
        </View>
        
        <View style={styles.statusContainer}>
          {getStatusIcon(item.status, colors)}
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(item.status, colors) },
            ]}
          >
            {formatStatus(item.status)}
          </Text>
        </View>
      </View>
      
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      
      <View style={styles.deliveryDetails}>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.muted }]}>
            Pickup:
          </Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            {item.vendor.name}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.muted }]}>
            Deliver to:
          </Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            {item.customer.name}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.muted }]}>
            Address:
          </Text>
          <Text
            style={[styles.detailValue, { color: colors.text }]}
            numberOfLines={1}
          >
            {item.customer.address}
          </Text>
        </View>
        
        <View style={styles.deliveryFooter}>
          <View style={styles.footerItem}>
            <MapPin size={14} color={colors.muted} />
            <Text style={[styles.footerText, { color: colors.muted }]}>
              {item.distance} km
            </Text>
          </View>
          
          <View style={styles.footerItem}>
            <DollarSign size={14} color={colors.primary} />
            <Text style={[styles.footerText, { color: colors.primary }]}>
              ${item.earnings.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.deliveryActions}>
        {item.status === 'assigned' && (
          <View style={styles.statusButtons}>
            <Button
              title="Pick Up"
              onPress={() => updateDeliveryStatus(item.id, 'picked_up')}
              variant="primary"
              size="sm"
              style={{ marginRight: 8 }}
            />
            <Button
              title="Navigate"
              onPress={() => handleNavigateToDelivery(item)}
              variant="outline"
              size="sm"
              leftIcon={<Navigation size={16} color={colors.primary} />}
            />
          </View>
        )}
        
        {item.status === 'picked_up' && (
          <View style={styles.statusButtons}>
            <Button
              title="Deliver"
              onPress={() => updateDeliveryStatus(item.id, 'delivered')}
              variant="primary"
              size="sm"
              style={{ marginRight: 8 }}
            />
            <Button
              title="Navigate"
              onPress={() => handleNavigateToDelivery(item)}
              variant="outline"
              size="sm"
              leftIcon={<Navigation size={16} color={colors.primary} />}
            />
          </View>
        )}
        
        {(item.status === 'delivered' || item.status === 'cancelled') && (
          <Button
            title="View Details"
            onPress={() => handleDeliveryPress(item.id)}
            variant="outline"
            size="sm"
            rightIcon={<ChevronRight size={16} color={colors.primary} />}
          />
        )}
      </View>
    </Card>
  );
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: 'My Deliveries' }} />
      
      <View style={styles.header}>
        <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
          <Search size={20} color={colors.muted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search deliveries..."
            placeholderTextColor={colors.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>
      
      <View style={styles.filterContainer}>
        <Text style={[styles.filterLabel, { color: colors.text }]}>
          Filter by status:
        </Text>
        <ScrollableFilters 
          selectedStatus={selectedStatus} 
          setSelectedStatus={setSelectedStatus}
          colors={colors}
        />
      </View>
      
      <FlatList
        data={filteredDeliveries}
        keyExtractor={(item) => item.id}
        renderItem={renderDeliveryItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Truck size={48} color={colors.muted} />
            <Text style={[styles.emptyText, { color: colors.text }]}>
              No deliveries found
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.muted }]}>
              Try adjusting your search or filters
            </Text>
          </View>
        }
      />
    </View>
  );
}

function ScrollableFilters({ selectedStatus, setSelectedStatus, colors }: any) {
  const filters = [
    { id: null, label: 'All' },
    { id: 'assigned', label: 'Assigned' },
    { id: 'picked_up', label: 'Picked Up' },
    { id: 'delivered', label: 'Delivered' },
    { id: 'cancelled', label: 'Cancelled' },
  ];
  
  return (
    <FlatList
      data={filters}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[
            styles.filterOption,
            selectedStatus === item.id && { 
              backgroundColor: item.id 
                ? getStatusColor(item.id, colors) + '20' 
                : colors.primary + '20' 
            },
          ]}
          onPress={() => setSelectedStatus(item.id)}
        >
          <Text
            style={[
              styles.filterText,
              { 
                color: selectedStatus === item.id 
                  ? (item.id ? getStatusColor(item.id, colors) : colors.primary) 
                  : colors.text 
              },
            ]}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      )}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filtersScrollContent}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  filtersScrollContent: {
    paddingRight: 16,
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginRight: 8,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  deliveryCard: {
    marginBottom: 12,
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  deliveryInfo: {
    flex: 1,
  },
  deliveryId: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  deliveryDate: {
    fontSize: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginBottom: 12,
  },
  deliveryDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 14,
    width: 70,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  deliveryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '500',
  },
  deliveryActions: {
    alignItems: 'flex-end',
  },
  statusButtons: {
    flexDirection: 'row',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});