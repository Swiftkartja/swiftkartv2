import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Image, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useThemeStore } from '@/store/theme-store';
import { useAuthStore } from '@/store/auth-store';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { UserRole } from '@/types';
import { Mail, Lock, User, Truck, Store, ShieldCheck, ArrowLeft } from 'lucide-react-native';
import LottieView from 'lottie-react-native';

export default function LoginScreen() {
  const { colors } = useThemeStore();
  const router = useRouter();
  const { 
    login, 
    register, 
    isLoading, 
    resetPassword, 
    verifyResetCode, 
    updatePassword
  } = useAuthStore();
  
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const [error, setError] = useState('');
  
  // Forgot password states
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1); // 1: Email, 2: Verification, 3: New Password
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const handleAuth = async () => {
    try {
      setError('');
      
      if (!email || !password) {
        setError('Email and password are required');
        return;
      }
      
      if (isLogin) {
        await login(email, password, selectedRole);
      } else {
        if (!name) {
          setError('Name is required');
          return;
        }
        await register(name, email, password, selectedRole);
      }
      
      // Navigation is now handled in the AuthProvider in _layout.tsx
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    }
  };
  
  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError('');
  };
  
  const handleForgotPassword = async () => {
    try {
      setError('');
      
      if (forgotPasswordStep === 1) {
        if (!email) {
          setError('Email is required');
          return;
        }
        
        await resetPassword(email);
        setForgotPasswordStep(2);
        Alert.alert(
          "Reset Code Sent",
          "For this demo, the reset code is: 123456",
          [{ text: "OK" }]
        );
      } else if (forgotPasswordStep === 2) {
        if (!resetCode) {
          setError('Reset code is required');
          return;
        }
        
        const isValid = await verifyResetCode(email, resetCode);
        if (isValid) {
          setForgotPasswordStep(3);
        }
      } else if (forgotPasswordStep === 3) {
        if (!newPassword || !confirmPassword) {
          setError('Both password fields are required');
          return;
        }
        
        if (newPassword !== confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        
        if (newPassword.length < 8) {
          setError('Password must be at least 8 characters');
          return;
        }
        
        await updatePassword(email, newPassword);
        Alert.alert(
          "Password Reset Successful",
          "Your password has been reset. You can now log in with your new password.",
          [
            { 
              text: "OK", 
              onPress: () => {
                setIsForgotPassword(false);
                setForgotPasswordStep(1);
                setResetCode('');
                setNewPassword('');
                setConfirmPassword('');
                setPassword(newPassword); // Auto-fill the password field
              } 
            }
          ]
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed');
    }
  };
  
  const goBack = () => {
    if (forgotPasswordStep > 1) {
      setForgotPasswordStep(forgotPasswordStep - 1);
    } else {
      setIsForgotPassword(false);
    }
    setError('');
  };
  
  const roles: { role: UserRole; icon: React.ReactNode; label: string }[] = [
    { role: 'customer', icon: <User size={20} color={selectedRole === 'customer' ? '#FFFFFF' : colors.primary} />, label: 'Customer' },
    { role: 'vendor', icon: <Store size={20} color={selectedRole === 'vendor' ? '#FFFFFF' : colors.primary} />, label: 'Vendor' },
    { role: 'rider', icon: <Truck size={20} color={selectedRole === 'rider' ? '#FFFFFF' : colors.primary} />, label: 'Rider' },
    { role: 'admin', icon: <ShieldCheck size={20} color={selectedRole === 'admin' ? '#FFFFFF' : colors.primary} />, label: 'Admin' },
  ];
  
  const renderForgotPasswordContent = () => {
    switch (forgotPasswordStep) {
      case 1:
        return (
          <>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              Enter your email to receive a password reset code
            </Text>
            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              leftIcon={<Mail size={20} color={colors.muted} />}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Button
              title="Send Reset Code"
              onPress={handleForgotPassword}
              loading={isLoading}
              fullWidth
              style={styles.button}
            />
          </>
        );
      case 2:
        return (
          <>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              Enter the 6-digit code sent to your email
            </Text>
            <Input
              label="Reset Code"
              placeholder="Enter 6-digit code"
              value={resetCode}
              onChangeText={setResetCode}
              keyboardType="number-pad"
              maxLength={6}
            />
            <Button
              title="Verify Code"
              onPress={handleForgotPassword}
              loading={isLoading}
              fullWidth
              style={styles.button}
            />
          </>
        );
      case 3:
        return (
          <>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              Create a new password
            </Text>
            <Input
              label="New Password"
              placeholder="Enter new password"
              value={newPassword}
              onChangeText={setNewPassword}
              leftIcon={<Lock size={20} color={colors.muted} />}
              secureTextEntry
              showPasswordToggle
            />
            <Input
              label="Confirm Password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              leftIcon={<Lock size={20} color={colors.muted} />}
              secureTextEntry
              showPasswordToggle
            />
            <Button
              title="Reset Password"
              onPress={handleForgotPassword}
              loading={isLoading}
              fullWidth
              style={styles.button}
            />
          </>
        );
      default:
        return null;
    }
  };
  
  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          {/* Modern animated logo */}
          <View style={[styles.animationContainer, { backgroundColor: colors.primary + '10' }]}>
            {Platform.OS !== 'web' ? (
              <LottieView
                source={require('@/assets/animations/delivery-animation.json')}
                autoPlay
                loop
                style={styles.animation}
                speed={0.7}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.webAnimationFallback}>
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80' }}
                  style={styles.webAnimationImage}
                  resizeMode="cover"
                />
                <View style={[styles.animationOverlay, { backgroundColor: colors.primary + '40' }]} />
              </View>
            )}
          </View>
          
          <Text style={[styles.title, { color: colors.text }]}>SwiftKart</Text>
          {!isForgotPassword && (
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              {isLogin ? 'Sign in to your account' : 'Create a new account'}
            </Text>
          )}
        </View>
        
        <View style={styles.form}>
          {isForgotPassword ? (
            <>
              <View style={styles.forgotPasswordHeader}>
                <TouchableOpacity onPress={goBack} style={styles.backButton}>
                  <ArrowLeft size={20} color={colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.forgotPasswordTitle, { color: colors.text }]}>Reset Password</Text>
              </View>
              
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              
              {renderForgotPasswordContent()}
            </>
          ) : (
            <>
              {!isLogin && (
                <Input
                  label="Name"
                  placeholder="Enter your name"
                  value={name}
                  onChangeText={setName}
                  leftIcon={<User size={20} color={colors.muted} />}
                  autoCapitalize="words"
                />
              )}
              
              <Input
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                leftIcon={<Mail size={20} color={colors.muted} />}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              
              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                leftIcon={<Lock size={20} color={colors.muted} />}
                secureTextEntry
                showPasswordToggle
              />
              
              <Text style={[styles.roleLabel, { color: colors.text }]}>Select Role</Text>
              <View style={styles.roleContainer}>
                {roles.map((item) => (
                  <TouchableOpacity
                    key={item.role}
                    style={[
                      styles.roleItem,
                      {
                        backgroundColor: selectedRole === item.role ? colors.primary : 'transparent',
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => setSelectedRole(item.role)}
                  >
                    {item.icon}
                    <Text
                      style={[
                        styles.roleText,
                        {
                          color: selectedRole === item.role ? '#FFFFFF' : colors.text,
                        },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              
              <Button
                title={isLogin ? 'Sign In' : 'Sign Up'}
                onPress={handleAuth}
                loading={isLoading}
                fullWidth
                style={styles.button}
              />
              
              {isLogin && (
                <TouchableOpacity 
                  onPress={() => setIsForgotPassword(true)} 
                  style={styles.forgotPasswordLink}
                >
                  <Text style={{ color: colors.primary }}>Forgot Password?</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity onPress={toggleAuthMode} style={styles.toggleContainer}>
                <Text style={[styles.toggleText, { color: colors.muted }]}>
                  {isLogin ? "Don't have an account? " : 'Already have an account? '}
                  <Text style={{ color: colors.primary, fontWeight: '600' }}>
                    {isLogin ? 'Sign Up' : 'Sign In'}
                  </Text>
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  animationContainer: {
    width: 220,
    height: 220,
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  webAnimationFallback: {
    width: '100%',
    height: '100%',
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
  },
  webAnimationImage: {
    width: '100%',
    height: '100%',
  },
  animationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  roleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  roleItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
    gap: 8,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    marginTop: 10,
  },
  errorText: {
    color: '#F56565',
    marginBottom: 10,
    textAlign: 'center',
  },
  toggleContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 14,
  },
  forgotPasswordLink: {
    marginTop: 15,
    alignItems: 'center',
  },
  forgotPasswordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  forgotPasswordTitle: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginRight: 40, // To offset the back button and center the text
  },
});