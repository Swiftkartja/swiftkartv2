import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch, RefreshControl } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useThemeStore } from '@/store/theme-store';
import { useAuthStore } from '@/store/auth-store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Star, 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle,
  ChevronRight,
  Settings,
  BarChart,
  Edit,
  AlertCircle
} from 'lucide-react-native';

// Mock data for vendor dashboard
const mockStats = {
  revenue: 1245.67,
  orders: 32,
  customers: 18,
  rating: 4.7,
};

const mockRecentOrders = [
  {
    id: 'order-101',
    customer: 'John Doe',
    items: 3,
    total: 38.97,
    status: 'pending',
    time: '10 mins ago',
  },
  {
    id: 'order-102',
    customer: 'Jane Smith',
    items: 2,
    total: 24.98,
    status: 'confirmed',
    time: '25 mins ago',
  },
  {
    id: 'order-103',
    customer: 'Mike Johnson',
    items: 1,
    total: 12.99,
    status: 'preparing',
    time: '45 mins ago',
  },
  {
    id: 'order-104',
    customer: 'Sarah Williams',
    items: 4,
    total: 52.96,
    status: 'ready_for_pickup',
    time: '1 hour ago',
  },
];

export default function VendorDashboardScreen() {
  const { colors } = useThemeStore();
  const { user, updateUser } = useAuthStore();
  const router = useRouter();
  
  const [isStoreOpen, setIsStoreOpen] = useState(user?.vendorInfo?.isOpen || false);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  
  useEffect(() => {
    // Count pending orders
    const pending = mockRecentOrders.filter(order => 
      order.status === 'pending' || order.status === 'confirmed'
    ).length;
    setPendingOrdersCount(pending);
  }, []);
  
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate a refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);
  
  const handleOrderPress = (orderId: string) => {
    router.push(`/vendor-dashboard/order/${orderId}`);
  };
  
  const handleViewAllOrders = () => {
    router.push('/vendor-dashboard/orders');
  };
  
  const handleManageProducts = () => {
    router.push('/vendor-dashboard/products');
  };
  
  const handleManageProfile = () => {
    router.push('/vendor-dashboard/profile');
  };
  
  const handleViewAnalytics = () => {
    router.push('/vendor-dashboard/analytics');
  };
  
  const handleStoreSettings = () => {
    router.push('/vendor-dashboard/settings');
  };
  
  const toggleStoreOpen = () => {
    const newStatus = !isStoreOpen;
    setIsStoreOpen(newStatus);
    
    // Update store status
    if (user?.vendorInfo) {
      updateUser({
        vendorInfo: {
          ...user.vendorInfo,
          isOpen: newStatus,
        },
      });
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return colors.warning;
      case 'confirmed':
        return colors.info;
      case 'preparing':
        return colors.primary;
      case 'ready_for_pickup':
        return colors.success;
      case 'cancelled':
        return colors.error;
      default:
        return colors.muted;
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} color={getStatusColor(status)} />;
      case 'confirmed':
        return <CheckCircle size={16} color={getStatusColor(status)} />;
      case 'preparing':
        return <Package size={16} color={getStatusColor(status)} />;
      case 'ready_for_pickup':
        return <CheckCircle size={16} color={getStatusColor(status)} />;
      case 'cancelled':
        return <XCircle size={16} color={getStatusColor(status)} />;
      default:
        return <Clock size={16} color={getStatusColor(status)} />;
    }
  };
  
  const updateOrderStatus = (orderId: string, newStatus: string) => {
    // In a real app, this would update the order status in the backend
    console.log(`Updating order ${orderId} to ${newStatus}`);
    // For now, we'll just show a success message
    alert(`Order ${orderId} updated to ${newStatus}`);
  };
  
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Stack.Screen options={{ title: 'Vendor Dashboard' }} />
      
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.text }]}>
            Welcome back, {user?.vendorInfo?.name || user?.name || 'Vendor'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Here's what's happening with your store today
          </Text>
        </View>
        
        <View style={styles.storeToggle}>
          <Text style={[styles.storeStatus, { color: isStoreOpen ? colors.success : colors.error }]}>
            {isStoreOpen ? 'Store Open' : 'Store Closed'}
          </Text>
          <Switch
            value={isStoreOpen}
            onValueChange={toggleStoreOpen}
            trackColor={{ false: colors.error + '50', true: colors.success + '50' }}
            thumbColor={isStoreOpen ? colors.success : colors.error}
          />
        </View>
      </View>
      
      {/* Alert for pending orders */}
      {pendingOrdersCount > 0 && (
        <View style={[styles.alertContainer, { backgroundColor: colors.warning + '20' }]}>
          <AlertCircle size={20} color={colors.warning} />
          <Text style={[styles.alertText, { color: colors.text }]}>
            You have {pendingOrdersCount} pending order{pendingOrdersCount > 1 ? 's' : ''} to process
          </Text>
          <TouchableOpacity onPress={handleViewAllOrders}>
            <Text style={[styles.alertAction, { color: colors.primary }]}>View</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <Card
            style={[styles.statCard, { backgroundColor: colors.primary + '10' }]}
            elevation={0}
          >
            <View style={styles.statIconContainer}>
              <TrendingUp size={20} color={colors.primary} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              ${mockStats.revenue.toFixed(2)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>
              Revenue
            </Text>
          </Card>
          
          <Card
            style={[styles.statCard, { backgroundColor: colors.info + '10' }]}
            elevation={0}
          >
            <View style={[styles.statIconContainer, { backgroundColor: colors.info + '20' }]}>
              <ShoppingBag size={20} color={colors.info} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {mockStats.orders}
            </Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>
              Orders
            </Text>
          </Card>
        </View>
        
        <View style={styles.statsRow}>
          <Card
            style={[styles.statCard, { backgroundColor: colors.warning + '10' }]}
            elevation={0}
          >
            <View style={[styles.statIconContainer, { backgroundColor: colors.warning + '20' }]}>
              <Users size={20} color={colors.warning} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {mockStats.customers}
            </Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>
              Customers
            </Text>
          </Card>
          
          <Card
            style={[styles.statCard, { backgroundColor: colors.success + '10' }]}
            elevation={0}
          >
            <View style={[styles.statIconContainer, { backgroundColor: colors.success + '20' }]}>
              <Star size={20} color={colors.success} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {mockStats.rating}
            </Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>
              Rating
            </Text>
          </Card>
        </View>
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Recent Orders
          </Text>
          <TouchableOpacity onPress={handleViewAllOrders}>
            <Text style={[styles.viewAll, { color: colors.primary }]}>
              View All
            </Text>
          </TouchableOpacity>
        </View>
        
        {mockRecentOrders.map((order) => (
          <Card
            key={order.id}
            style={styles.orderCard}
            onPress={() => handleOrderPress(order.id)}
            elevation={1}
          >
            <View style={styles.orderHeader}>
              <View style={styles.orderInfo}>
                <Text style={[styles.orderId, { color: colors.text }]}>
                  #{order.id.split('-')[1]}
                </Text>
                <Text style={[styles.orderTime, { color: colors.muted }]}>
                  {order.time}
                </Text>
              </View>
              
              <View style={styles.statusContainer}>
                {getStatusIcon(order.status)}
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(order.status) },
                  ]}
                >
                  {order.status.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
            </View>
            
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            
            <View style={styles.orderDetails}>
              <View>
                <Text style={[styles.customerName, { color: colors.text }]}>
                  {order.customer}
                </Text>
                <Text style={[styles.itemsCount, { color: colors.muted }]}>
                  {order.items} {order.items === 1 ? 'item' : 'items'}
                </Text>
              </View>
              
              <View style={styles.orderTotal}>
                <Text style={[styles.totalLabel, { color: colors.muted }]}>
                  Total:
                </Text>
                <Text style={[styles.totalValue, { color: colors.primary }]}>
                  ${order.total.toFixed(2)}
                </Text>
              </View>
            </View>
            
            <View style={styles.orderActions}>
              {order.status === 'pending' && (
                <View style={styles.statusButtons}>
                  <Button
                    title="Confirm"
                    onPress={() => updateOrderStatus(order.id, 'confirmed')}
                    variant="primary"
                    size="sm"
                    style={{ marginRight: 8 }}
                  />
                  <Button
                    title="Reject"
                    onPress={() => updateOrderStatus(order.id, 'cancelled')}
                    variant="danger"
                    size="sm"
                  />
                </View>
              )}
              
              {order.status === 'confirmed' && (
                <Button
                  title="Start Preparing"
                  onPress={() => updateOrderStatus(order.id, 'preparing')}
                  variant="primary"
                  size="sm"
                  fullWidth
                />
              )}
              
              {order.status === 'preparing' && (
                <Button
                  title="Mark as Ready"
                  onPress={() => updateOrderStatus(order.id, 'ready_for_pickup')}
                  variant="primary"
                  size="sm"
                  fullWidth
                />
              )}
              
              {order.status === 'ready_for_pickup' && (
                <Button
                  title="View Details"
                  onPress={() => handleOrderPress(order.id)}
                  variant="outline"
                  size="sm"
                  rightIcon={<ChevronRight size={16} color={colors.primary} />}
                />
              )}
              
              {order.status === 'cancelled' && (
                <Text style={[styles.cancelledText, { color: colors.error }]}>
                  This order has been cancelled
                </Text>
              )}
            </View>
          </Card>
        ))}
      </View>
      
      <View style={styles.quickActions}>
        <Text style={[styles.actionsTitle, { color: colors.text }]}>
          Quick Actions
        </Text>
        
        <View style={styles.actionButtons}>
          <Button
            title="Manage Products"
            onPress={handleManageProducts}
            leftIcon={<Package size={18} color="#FFFFFF" />}
            style={styles.actionButton}
          />
          
          <Button
            title="Store Profile"
            onPress={handleManageProfile}
            leftIcon={<Edit size={18} color="#FFFFFF" />}
            style={styles.actionButton}
          />
          
          <Button
            title="Analytics"
            onPress={handleViewAnalytics}
            leftIcon={<BarChart size={18} color="#FFFFFF" />}
            style={styles.actionButton}
          />
          
          <Button
            title="Settings"
            onPress={handleStoreSettings}
            leftIcon={<Settings size={18} color="#FFFFFF" />}
            variant="secondary"
            style={styles.actionButton}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  storeToggle: {
    alignItems: 'center',
  },
  storeStatus: {
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '500',
  },
  alertContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    marginTop: 16,
    marginBottom: 0,
    padding: 12,
    borderRadius: 8,
  },
  alertText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  alertAction: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  statsContainer: {
    padding: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '500',
  },
  orderCard: {
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  orderTime: {
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
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  itemsCount: {
    fontSize: 12,
  },
  orderTotal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  totalLabel: {
    fontSize: 14,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  orderActions: {
    alignItems: 'flex-end',
  },
  statusButtons: {
    flexDirection: 'row',
  },
  cancelledText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  quickActions: {
    padding: 20,
    paddingTop: 0,
    marginBottom: 30,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    marginBottom: 12,
  },
});