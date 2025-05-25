import React from 'react';
import { Stack } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';

export default function VendorDashboardLayout() {
  const { checkAccess } = useAuthStore();
  
  // Verify that the user has vendor access
  if (!checkAccess(['vendor', 'admin'])) {
    return null;
  }
  
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: "Back",
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: "Vendor Dashboard",
          headerTitleStyle: { fontWeight: '600' }
        }} 
      />
      <Stack.Screen 
        name="orders" 
        options={{ 
          title: "Orders",
          headerTitleStyle: { fontWeight: '600' }
        }} 
      />
      <Stack.Screen 
        name="order/[id]" 
        options={{ 
          title: "Order Details",
          headerTitleStyle: { fontWeight: '600' }
        }} 
      />
      <Stack.Screen 
        name="products" 
        options={{ 
          title: "Products",
          headerTitleStyle: { fontWeight: '600' }
        }} 
      />
      <Stack.Screen 
        name="product/[id]" 
        options={{ 
          title: "Product Details",
          headerTitleStyle: { fontWeight: '600' }
        }} 
      />
      <Stack.Screen 
        name="add-product" 
        options={{ 
          title: "Add Product",
          headerTitleStyle: { fontWeight: '600' }
        }} 
      />
      <Stack.Screen 
        name="profile" 
        options={{ 
          title: "Store Profile",
          headerTitleStyle: { fontWeight: '600' }
        }} 
      />
      <Stack.Screen 
        name="analytics" 
        options={{ 
          title: "Analytics",
          headerTitleStyle: { fontWeight: '600' }
        }} 
      />
      <Stack.Screen 
        name="settings" 
        options={{ 
          title: "Store Settings",
          headerTitleStyle: { fontWeight: '600' }
        }} 
      />
      <Stack.Screen 
        name="customers" 
        options={{ 
          title: "Customers",
          headerTitleStyle: { fontWeight: '600' }
        }} 
      />
    </Stack>
  );
}