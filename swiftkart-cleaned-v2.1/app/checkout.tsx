import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Alert,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useThemeStore } from '@/store/theme-store';
import { useCartStore } from '@/store/cart-store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  MapPin, 
  CreditCard, 
  Wallet, 
  ChevronRight, 
  Clock, 
  Plus,
  CheckCircle,
  Edit
} from 'lucide-react-native';
import { Address } from '@/types';
import PaymentService from '@/services/payment-service';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage key for addresses
const ADDRESSES_STORAGE_KEY = 'swiftkart_addresses';

// Delivery time slots
const deliveryTimeSlots = [
  { id: 'asap', label: 'As soon as possible', isDefault: true },
  { id: 'slot-1', label: 'Today, 2:00 PM - 3:00 PM', isDefault: false },
  { id: 'slot-2', label: 'Today, 3:00 PM - 4:00 PM', isDefault: false },
  { id: 'slot-3', label: 'Today, 4:00 PM - 5:00 PM', isDefault: false },
  { id: 'slot-4', label: 'Today, 5:00 PM - 6:00 PM', isDefault: false },
];

// Mock payment methods
const mockPaymentMethods = [
  {
    id: 'card-1',
    type: 'card',
    cardNumber: '•••• •••• •••• 4242',
    cardHolder: 'John Doe',
    expiryDate: '12/25',
    isDefault: true,
  },
  {
    id: 'wallet-1',
    type: 'wallet',
    balance: 250.75,
    isDefault: false,
  },
];

export default function CheckoutScreen() {
  const { colors } = useThemeStore();
  const { items, getCartTotal, clearCart } = useCartStore();
  const router = useRouter();
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<any>(
    mockPaymentMethods.find(method => method.isDefault) || null
  );
  
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<any>(
    deliveryTimeSlots.find(slot => slot.isDefault) || null
  );
  
  const [deliveryFee] = useState(2.99);
  const [tax, setTax] = useState(0);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  
  // Initialize payment service
  useEffect(() => {
    PaymentService.initialize();
  }, []);
  
  // Load addresses from storage
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const storedAddresses = await AsyncStorage.getItem(ADDRESSES_STORAGE_KEY);
        
        if (storedAddresses) {
          const parsedAddresses = JSON.parse(storedAddresses) as Address[];
          setAddresses(parsedAddresses);
          
          // Set default address
          const defaultAddress = parsedAddresses.find(addr => addr.isDefault);
          if (defaultAddress) {
            setSelectedAddress(defaultAddress);
          } else if (parsedAddresses.length > 0) {
            setSelectedAddress(parsedAddresses[0]);
          }
        }
      } catch (error) {
        console.error('Error loading addresses:', error);
      }
    };
    
    loadAddresses();
  }, []);
  
  // Update tax when cart items change
  useEffect(() => {
    const subtotal = getCartTotal();
    setTax(subtotal * 0.08); // 8% tax
  }, [items, getCartTotal]);
  
  const subtotal = getCartTotal();
  const total = subtotal + deliveryFee + tax;
  
  const handleSelectAddress = () => {
    router.push('/addresses');
  };
  
  const handleSelectPaymentMethod = () => {
    // In a real app, this would navigate to a payment method selection screen
    Alert.alert(
      'Select Payment Method',
      'Choose your payment method',
      [
        {
          text: 'Credit Card',
          onPress: () => setSelectedPaymentMethod(mockPaymentMethods[0]),
        },
        {
          text: 'Wallet',
          onPress: () => setSelectedPaymentMethod(mockPaymentMethods[1]),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };
  
  const handleSelectTimeSlot = () => {
    // In a real app, this would open a time slot selection modal
    Alert.alert(
      'Select Delivery Time',
      'Choose your preferred delivery time',
      deliveryTimeSlots.map(slot => ({
        text: slot.label,
        onPress: () => setSelectedTimeSlot(slot),
      })).concat([
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ])
    );
  };
  
  const handlePlaceOrder = async () => {
    // Validate checkout data
    if (!selectedAddress) {
      Alert.alert('Error', 'Please select a delivery address.');
      return;
    }
    
    if (!selectedPaymentMethod) {
      Alert.alert('Error', 'Please select a payment method.');
      return;
    }
    
    if (!selectedTimeSlot) {
      Alert.alert('Error', 'Please select a delivery time.');
      return;
    }
    
    try {
      setIsProcessingPayment(true);
      
      // Process payment with Fygaro
      const paymentResult = await PaymentService.createPayment({
        amount: total,
        currency: 'JMD',
        description: `Payment for order with ${items.length} items`,
        paymentMethod: selectedPaymentMethod.type as any,
        metadata: {
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          address: selectedAddress,
          deliveryTime: selectedTimeSlot,
          notes: orderNotes,
        },
      });
      
      if (paymentResult.status === 'completed') {
        // Payment successful
        Alert.alert(
          'Order Placed',
          'Your order has been placed successfully!',
          [
            {
              text: 'Track Order',
              onPress: () => {
                // Clear cart and navigate to track order
                clearCart();
                router.push('/track-order/latest');
              },
            },
          ]
        );
      } else {
        // Payment failed
        Alert.alert('Payment Failed', 'There was an error processing your payment. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again later.');
      console.error('Checkout error:', error);
    } finally {
      setIsProcessingPayment(false);
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: 'Checkout' }} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Delivery Address
          </Text>
          
          {selectedAddress ? (
            <Card style={styles.addressCard} elevation={1}>
              <View style={styles.addressHeader}>
                <Text style={[styles.addressTitle, { color: colors.text }]}>
                  {selectedAddress.title}
                </Text>
                <TouchableOpacity
                  style={[styles.editButton, { backgroundColor: colors.subtle }]}
                  onPress={handleSelectAddress}
                >
                  <Edit size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.addressDetails}>
                <MapPin size={16} color={colors.muted} />
                <Text style={[styles.addressText, { color: colors.text }]}>
                  {selectedAddress.address}, {selectedAddress.city}, {selectedAddress.state} {selectedAddress.zipCode}
                </Text>
              </View>
            </Card>
          ) : (
            <TouchableOpacity
              style={[styles.addButton, { borderColor: colors.border }]}
              onPress={handleSelectAddress}
            >
              <Plus size={20} color={colors.primary} />
              <Text style={[styles.addButtonText, { color: colors.primary }]}>
                Add Delivery Address
              </Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Payment Method
          </Text>
          
          {selectedPaymentMethod ? (
            <Card style={styles.paymentCard} elevation={1}>
              <View style={styles.paymentHeader}>
                <View style={styles.paymentInfo}>
                  {selectedPaymentMethod.type === 'card' ? (
                    <>
                      <CreditCard size={20} color={colors.primary} />
                      <Text style={[styles.paymentTitle, { color: colors.text }]}>
                        {selectedPaymentMethod.cardNumber}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Wallet size={20} color={colors.primary} />
                      <Text style={[styles.paymentTitle, { color: colors.text }]}>
                        Wallet Balance: ${selectedPaymentMethod.balance.toFixed(2)}
                      </Text>
                    </>
                  )}
                </View>
                <TouchableOpacity
                  style={[styles.editButton, { backgroundColor: colors.subtle }]}
                  onPress={handleSelectPaymentMethod}
                >
                  <Edit size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </Card>
          ) : (
            <TouchableOpacity
              style={[styles.addButton, { borderColor: colors.border }]}
              onPress={handleSelectPaymentMethod}
            >
              <Plus size={20} color={colors.primary} />
              <Text style={[styles.addButtonText, { color: colors.primary }]}>
                Add Payment Method
              </Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Delivery Time
          </Text>
          
          <Card style={styles.timeCard} elevation={1}>
            <TouchableOpacity
              style={styles.timeSelector}
              onPress={handleSelectTimeSlot}
            >
              <View style={styles.timeInfo}>
                <Clock size={20} color={colors.primary} />
                <Text style={[styles.timeText, { color: colors.text }]}>
                  {selectedTimeSlot ? selectedTimeSlot.label : 'Select delivery time'}
                </Text>
              </View>
              <ChevronRight size={20} color={colors.muted} />
            </TouchableOpacity>
          </Card>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Order Items
          </Text>
          
          <Card style={styles.itemsCard} elevation={1}>
            {items.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <Image
                  source={{ uri: item.image }}
                  style={styles.itemImage}
                  resizeMode="cover"
                />
                
                <View style={styles.itemDetails}>
                  <Text style={[styles.itemName, { color: colors.text }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.itemPrice, { color: colors.muted }]}>
                    ${item.price.toFixed(2)} x {item.quantity}
                  </Text>
                </View>
                
                <Text style={[styles.itemTotal, { color: colors.text }]}>
                  ${(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}
          </Card>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Delivery Notes
          </Text>
          
          <Card style={styles.notesCard} elevation={1}>
            <TextInput
              style={[
                styles.notesInput,
                { backgroundColor: colors.subtle, color: colors.text, borderColor: colors.border },
              ]}
              placeholder="Add notes for delivery (optional)"
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={3}
              value={orderNotes}
              onChangeText={setOrderNotes}
              textAlignVertical="top"
            />
          </Card>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Order Summary
          </Text>
          
          <Card style={styles.summaryCard} elevation={1}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.muted }]}>
                Subtotal
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                ${subtotal.toFixed(2)}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.muted }]}>
                Delivery Fee
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                ${deliveryFee.toFixed(2)}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.muted }]}>
                Tax
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                ${tax.toFixed(2)}
              </Text>
            </View>
            
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            
            <View style={styles.summaryRow}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>
                Total
              </Text>
              <Text style={[styles.totalValue, { color: colors.primary }]}>
                ${total.toFixed(2)}
              </Text>
            </View>
          </Card>
        </View>
        
        <View style={styles.placeOrderContainer}>
          <Button
            title={isProcessingPayment ? 'Processing...' : 'Place Order'}
            onPress={handlePlaceOrder}
            fullWidth
            style={styles.placeOrderButton}
            disabled={isProcessingPayment}
          >
            {isProcessingPayment && <ActivityIndicator size="small" color="#FFFFFF" />}
          </Button>
          
          <Text style={[styles.securePaymentText, { color: colors.muted }]}>
            Secure payments powered by Fygaro
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    padding: 16,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  addressCard: {
    marginBottom: 16,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressDetails: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  paymentCard: {
    marginBottom: 16,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentTitle: {
    fontSize: 16,
    marginLeft: 8,
  },
  timeCard: {
    marginBottom: 16,
  },
  timeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
    marginLeft: 8,
  },
  itemsCard: {
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 12,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '600',
  },
  notesCard: {
    marginBottom: 16,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
  },
  summaryCard: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  placeOrderContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  placeOrderButton: {
    marginBottom: 12,
  },
  securePaymentText: {
    fontSize: 12,
    textAlign: 'center',
  },
});