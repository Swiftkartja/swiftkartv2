import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useThemeStore } from '@/store/theme-store';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Navigation, CheckCircle, Phone, MessageSquare, MapPin } from 'lucide-react-native';
import { MapView } from '@/components/maps/MapView';
import { MapMarker, Route } from '@/types';
import * as Location from 'expo-location';

// Mock delivery data
const mockDelivery = {
  id: 'delivery-101',
  vendor: {
    name: 'Fresh Eats',
    address: '123 Market St, Old Harbor, CA',
    phone: '+1234567890',
    coordinates: {
      latitude: 18.0179,
      longitude: -76.8099,
    },
  },
  customer: {
    name: 'John Doe',
    address: '456 Main St, Old Harbor, CA',
    phone: '+1987654321',
    coordinates: {
      latitude: 18.0233,
      longitude: -76.8167,
    },
  },
  status: 'assigned',
  items: [
    { name: 'Chicken Salad', quantity: 1, price: 12.99 },
    { name: 'Fresh Juice', quantity: 2, price: 4.99 },
  ],
  total: 22.97,
  distance: 2.4,
  earnings: 8.50,
};

export default function DeliveryMapScreen() {
  const { colors } = useThemeStore();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { deliveryId } = params;
  
  const [currentStatus, setCurrentStatus] = useState(mockDelivery.status);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [route, setRoute] = useState<Route | null>(null);
  const [mapReady, setMapReady] = useState(false);
  
  useEffect(() => {
    // In a real app, you would fetch the delivery details based on the ID
    // For now, we'll just use the mock data
    
    // Get user location
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Location permission is required for this feature.');
          setLoading(false);
          return;
        }
        
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        
        // Create markers
        const deliveryMarkers: MapMarker[] = [
          {
            id: 'vendor',
            coordinate: mockDelivery.vendor.coordinates,
            title: mockDelivery.vendor.name,
            description: 'Pickup location',
            type: 'pickup',
          },
          {
            id: 'customer',
            coordinate: mockDelivery.customer.coordinates,
            title: mockDelivery.customer.name,
            description: 'Delivery location',
            type: 'dropoff',
          },
        ];
        
        // Add rider marker (user location)
        if (location) {
          deliveryMarkers.push({
            id: 'rider',
            coordinate: {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            },
            title: 'Your Location',
            description: 'Current position',
            type: 'rider',
          });
          
          // Create route
          setRoute({
            origin: {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            },
            destination: mockDelivery.customer.coordinates,
            distance: mockDelivery.distance,
            duration: Math.round(mockDelivery.distance * 5), // Rough estimate: 5 min per km
          });
        }
        
        setMarkers(deliveryMarkers);
        setLoading(false);
      } catch (error) {
        console.error('Error getting location:', error);
        Alert.alert('Error', 'Failed to get your location. Please try again.');
        setLoading(false);
      }
    })();
  }, [deliveryId]);
  
  const handleBack = () => {
    router.back();
  };
  
  const handleUpdateStatus = (newStatus: string) => {
    setCurrentStatus(newStatus);
    
    // Show confirmation
    Alert.alert(
      newStatus === 'picked_up' ? 'Order Picked Up' : 'Order Delivered',
      newStatus === 'picked_up' 
        ? 'You have confirmed pickup from the vendor. Proceed to customer location.'
        : 'You have confirmed delivery to the customer. Great job!',
      [{ text: 'OK' }]
    );
    
    // In a real app, you would update the status in the backend
  };
  
  const handleCallVendor = () => {
    // In a real app, this would initiate a phone call
    if (Platform.OS === 'web') {
      window.open(`tel:${mockDelivery.vendor.phone}`);
    } else {
      // Use Linking API for native platforms
      import('expo-linking').then(Linking => {
        Linking.openURL(`tel:${mockDelivery.vendor.phone}`);
      });
    }
  };
  
  const handleCallCustomer = () => {
    // In a real app, this would initiate a phone call
    if (Platform.OS === 'web') {
      window.open(`tel:${mockDelivery.customer.phone}`);
    } else {
      // Use Linking API for native platforms
      import('expo-linking').then(Linking => {
        Linking.openURL(`tel:${mockDelivery.customer.phone}`);
      });
    }
  };
  
  const handleChatWithVendor = () => {
    router.push(`/chat/vendor-${mockDelivery.id}`);
  };
  
  const handleChatWithCustomer = () => {
    router.push(`/chat/customer-${mockDelivery.id}`);
  };
  
  const handleMapReady = () => {
    setMapReady(true);
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Custom header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Delivery #{mockDelivery.id.split('-')[1]}
        </Text>
        <View style={{ width: 24 }} />
      </View>
      
      {/* Map container */}
      <View style={styles.mapContainer}>
        {loading ? (
          <View style={[styles.loadingContainer, { backgroundColor: colors.subtle }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.text }]}>
              Loading delivery details...
            </Text>
          </View>
        ) : (
          <MapView
            markers={markers}
            route={route}
            showUserLocation={true}
            style={styles.map}
            onMapReady={handleMapReady}
            interactive={true}
          />
        )}
      </View>
      
      {/* Delivery info */}
      <View style={styles.deliveryInfo}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Pickup Location
          </Text>
          <View style={[styles.locationCard, { backgroundColor: colors.card }]}>
            <View style={styles.locationHeader}>
              <Text style={[styles.locationName, { color: colors.text }]}>
                {mockDelivery.vendor.name}
              </Text>
              <View style={styles.locationActions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
                  onPress={handleCallVendor}
                >
                  <Phone size={16} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
                  onPress={handleChatWithVendor}
                >
                  <MessageSquare size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={[styles.locationAddress, { color: colors.muted }]}>
              {mockDelivery.vendor.address}
            </Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Delivery Location
          </Text>
          <View style={[styles.locationCard, { backgroundColor: colors.card }]}>
            <View style={styles.locationHeader}>
              <Text style={[styles.locationName, { color: colors.text }]}>
                {mockDelivery.customer.name}
              </Text>
              <View style={styles.locationActions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
                  onPress={handleCallCustomer}
                >
                  <Phone size={16} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
                  onPress={handleChatWithCustomer}
                >
                  <MessageSquare size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={[styles.locationAddress, { color: colors.muted }]}>
              {mockDelivery.customer.address}
            </Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Order Summary
          </Text>
          <View style={[styles.orderSummary, { backgroundColor: colors.card }]}>
            {mockDelivery.items.map((item, index) => (
              <View key={index} style={styles.orderItem}>
                <Text style={[styles.orderItemName, { color: colors.text }]}>
                  {item.quantity}x {item.name}
                </Text>
                <Text style={[styles.orderItemPrice, { color: colors.text }]}>
                  ${(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.orderTotal}>
              <Text style={[styles.orderTotalLabel, { color: colors.text }]}>
                Total
              </Text>
              <Text style={[styles.orderTotalValue, { color: colors.primary }]}>
                ${mockDelivery.total.toFixed(2)}
              </Text>
            </View>
            <View style={styles.earningsInfo}>
              <Text style={[styles.earningsLabel, { color: colors.success }]}>
                Your Earnings
              </Text>
              <Text style={[styles.earningsValue, { color: colors.success }]}>
                ${mockDelivery.earnings.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </View>
      
      {/* Action buttons */}
      <View style={styles.actions}>
        {currentStatus === 'assigned' && (
          <Button
            title="Picked Up from Vendor"
            onPress={() => handleUpdateStatus('picked_up')}
            leftIcon={<Navigation size={18} color="#FFFFFF" />}
            fullWidth
          />
        )}
        
        {currentStatus === 'picked_up' && (
          <Button
            title="Delivered to Customer"
            onPress={() => handleUpdateStatus('completed')}
            leftIcon={<CheckCircle size={18} color="#FFFFFF" />}
            fullWidth
          />
        )}
        
        {currentStatus === 'completed' && (
          <View style={styles.completedMessage}>
            <CheckCircle size={24} color={colors.success} />
            <Text style={[styles.completedText, { color: colors.success }]}>
              Delivery completed successfully!
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  mapContainer: {
    height: 250,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  deliveryInfo: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  locationCard: {
    padding: 12,
    borderRadius: 8,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '500',
  },
  locationActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationAddress: {
    fontSize: 14,
  },
  orderSummary: {
    padding: 12,
    borderRadius: 8,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderItemName: {
    fontSize: 14,
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  orderTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  orderTotalValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  earningsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  earningsLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  earningsValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  actions: {
    padding: 16,
    paddingBottom: 32,
  },
  completedMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  completedText: {
    fontSize: 16,
    fontWeight: '600',
  },
});