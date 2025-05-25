import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useThemeStore } from '@/store/theme-store';
import { Send, Paperclip, X, Image as ImageIcon } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

// Mock chat data
const mockChats: Record<string, {
  id: string;
  name: string;
  avatar: string;
  role: 'vendor' | 'rider' | 'admin' | 'customer';
  messages: Array<{
    id: string;
    text: string;
    sender: 'user' | 'other';
    timestamp: string;
    status: 'sent' | 'delivered' | 'read';
    attachments?: Array<{
      id: string;
      type: 'image' | 'document';
      url: string;
      name?: string;
    }>;
  }>;
}> = {
  'rider-1': {
    id: 'rider-1',
    name: 'Mike Johnson',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80',
    role: 'rider',
    messages: [
      {
        id: '1',
        text: 'Hello! I am your delivery rider for order #12345.',
        sender: 'other',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        status: 'read',
      },
      {
        id: '2',
        text: 'Hi Mike! How far are you from my location?',
        sender: 'user',
        timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(), // 25 minutes ago
        status: 'read',
      },
      {
        id: '3',
        text: 'I am about 10 minutes away. There is some traffic but I will be there soon.',
        sender: 'other',
        timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(), // 20 minutes ago
        status: 'read',
      },
      {
        id: '4',
        text: 'Great! Please call me when you arrive.',
        sender: 'user',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
        status: 'read',
      },
    ],
  },
  'vendor-1': {
    id: 'vendor-1',
    name: 'Fresh Eats',
    avatar: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80',
    role: 'vendor',
    messages: [
      {
        id: '1',
        text: 'Hello! Thank you for ordering from Fresh Eats.',
        sender: 'other',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        status: 'read',
      },
      {
        id: '2',
        text: 'Hi! I wanted to ask if you could make the dish less spicy?',
        sender: 'user',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.9).toISOString(), // 1.9 hours ago
        status: 'read',
      },
      {
        id: '3',
        text: 'Absolutely! We will make it mild for you.',
        sender: 'other',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.8).toISOString(), // 1.8 hours ago
        status: 'read',
      },
      {
        id: '4',
        text: 'Thank you so much!',
        sender: 'user',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.7).toISOString(), // 1.7 hours ago
        status: 'read',
      },
    ],
  },
  'admin': {
    id: 'admin',
    name: 'SwiftKart Support',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80',
    role: 'admin',
    messages: [
      {
        id: '1',
        text: 'Hello! Welcome to SwiftKart Support. How can I help you today?',
        sender: 'other',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        status: 'read',
      },
      {
        id: '2',
        text: 'Hi, I have a question about my recent order #12346. It shows as delivered but I haven\'t received it yet.',
        sender: 'user',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23.9).toISOString(), // 23.9 hours ago
        status: 'read',
      },
      {
        id: '3',
        text: 'I\'m sorry to hear that. Let me check the status for you. Can you please confirm your delivery address?',
        sender: 'other',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23.8).toISOString(), // 23.8 hours ago
        status: 'read',
      },
      {
        id: '4',
        text: 'It\'s 123 Main Street, Apt 4B, Kingston.',
        sender: 'user',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23.7).toISOString(), // 23.7 hours ago
        status: 'read',
      },
      {
        id: '5',
        text: 'Thank you. I\'ve checked with the rider and there was a mix-up. Your order will be delivered in the next 30 minutes. We\'ve added a $5 credit to your account for the inconvenience.',
        sender: 'other',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23.6).toISOString(), // 23.6 hours ago
        status: 'read',
      },
      {
        id: '6',
        text: 'Thank you for resolving this so quickly!',
        sender: 'user',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23.5).toISOString(), // 23.5 hours ago
        status: 'read',
      },
    ],
  },
  'vendor-delivery-101': {
    id: 'vendor-delivery-101',
    name: 'Fresh Eats',
    avatar: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80',
    role: 'vendor',
    messages: [
      {
        id: '1',
        text: 'Hello! I am picking up order #delivery-101 from your restaurant.',
        sender: 'user',
        timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10 minutes ago
        status: 'read',
      },
      {
        id: '2',
        text: 'Hi there! The order is almost ready. It will be done in about 5 minutes.',
        sender: 'other',
        timestamp: new Date(Date.now() - 1000 * 60 * 9).toISOString(), // 9 minutes ago
        status: 'read',
      },
      {
        id: '3',
        text: 'Great, I\'ll wait. Is there a specific pickup area?',
        sender: 'user',
        timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(), // 8 minutes ago
        status: 'read',
      },
      {
        id: '4',
        text: 'Yes, please come to the side entrance marked "Pickup". We\'ll have it ready for you.',
        sender: 'other',
        timestamp: new Date(Date.now() - 1000 * 60 * 7).toISOString(), // 7 minutes ago
        status: 'read',
      },
    ],
  },
  'customer-delivery-101': {
    id: 'customer-delivery-101',
    name: 'John Doe',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80',
    role: 'customer',
    messages: [
      {
        id: '1',
        text: 'Hello! I am your delivery rider for order #delivery-101. I\'ve picked up your order and am on my way.',
        sender: 'user',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
        status: 'read',
      },
      {
        id: '2',
        text: 'Hi! Thanks for the update. How long do you think it will take?',
        sender: 'other',
        timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(), // 4 minutes ago
        status: 'read',
      },
      {
        id: '3',
        text: 'I should be there in about 15 minutes. Traffic is light right now.',
        sender: 'user',
        timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(), // 3 minutes ago
        status: 'read',
      },
      {
        id: '4',
        text: 'Perfect! My apartment is a bit tricky to find. When you arrive at the building, please call me.',
        sender: 'other',
        timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(), // 2 minutes ago
        status: 'read',
      },
      {
        id: '5',
        text: 'Will do! See you soon.',
        sender: 'user',
        timestamp: new Date(Date.now() - 1000 * 60 * 1).toISOString(), // 1 minute ago
        status: 'delivered',
      },
    ],
  },
};

export default function ChatScreen() {
  const { colors } = useThemeStore();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [chat, setChat] = useState<typeof mockChats[keyof typeof mockChats] | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [attachments, setAttachments] = useState<Array<{
    id: string;
    type: 'image' | 'document';
    uri: string;
    name?: string;
  }>>([]);
  
  useEffect(() => {
    const loadChat = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const chatId = typeof id === 'string' ? id : '';
        const chatData = mockChats[chatId];
        
        if (!chatData) {
          throw new Error('Chat not found');
        }
        
        setChat(chatData);
      } catch (error) {
        console.error('Error loading chat:', error);
        Alert.alert('Error', 'Failed to load chat. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadChat();
  }, [id]);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [chat?.messages]);
  
  const handleSendMessage = async () => {
    if ((!message.trim() && attachments.length === 0) || !chat) return;
    
    setIsSending(true);
    
    try {
      // Create new message
      const newMessage = {
        id: Date.now().toString(),
        text: message.trim(),
        sender: 'user' as const,
        timestamp: new Date().toISOString(),
        status: 'sent' as const,
        attachments: attachments.length > 0 ? attachments : undefined,
      };
      
      // Update chat with new message
      setChat({
        ...chat,
        messages: [...chat.messages, newMessage],
      });
      
      // Clear input and attachments
      setMessage('');
      setAttachments([]);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate auto-reply after 2 seconds
      setTimeout(() => {
        let replyText = '';
        
        switch (chat.role) {
          case 'rider':
            replyText = 'I\'ll be there as soon as possible. Thanks for your patience!';
            break;
          case 'vendor':
            replyText = 'Thank you for your message. We\'ll take care of your request right away.';
            break;
          case 'admin':
            replyText = 'Thank you for contacting SwiftKart Support. We\'ll get back to you shortly.';
            break;
          case 'customer':
            replyText = 'Thanks for the update. I appreciate it!';
            break;
        }
        
        const autoReply = {
          id: (Date.now() + 1).toString(),
          text: replyText,
          sender: 'other' as const,
          timestamp: new Date().toISOString(),
          status: 'sent' as const,
        };
        
        setChat(prevChat => {
          if (!prevChat) return null;
          return {
            ...prevChat,
            messages: [...prevChat.messages, autoReply],
          };
        });
      }, 2000);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };
  
  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'You need to grant permission to access your photos.');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileName = asset.uri.split('/').pop() || 'image.jpg';
        
        setAttachments([...attachments, {
          id: Date.now().toString(),
          type: 'image',
          uri: asset.uri,
          name: fileName,
        }]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };
  
  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/plain'],
        copyToCacheDirectory: true,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        setAttachments([...attachments, {
          id: Date.now().toString(),
          type: 'document',
          uri: asset.uri,
          name: asset.name,
        }]);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document. Please try again.');
    }
  };
  
  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter(attachment => attachment.id !== id));
  };
  
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };
  
  // Group messages by date
  const groupedMessages = () => {
    if (!chat) return [];
    
    const groups: {
      date: string;
      messages: typeof chat.messages;
    }[] = [];
    
    let currentDate = '';
    let currentMessages: typeof chat.messages = [];
    
    chat.messages.forEach(message => {
      const messageDate = formatDate(message.timestamp);
      
      if (messageDate !== currentDate) {
        if (currentMessages.length > 0) {
          groups.push({
            date: currentDate,
            messages: currentMessages,
          });
        }
        
        currentDate = messageDate;
        currentMessages = [message];
      } else {
        currentMessages.push(message);
      }
    });
    
    if (currentMessages.length > 0) {
      groups.push({
        date: currentDate,
        messages: currentMessages,
      });
    }
    
    return groups;
  };
  
  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'Chat' }} />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading chat...
        </Text>
      </View>
    );
  }
  
  if (!chat) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'Chat' }} />
        <Text style={[styles.errorText, { color: colors.text }]}>
          Chat not found
        </Text>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.primary }]}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen 
          options={{ 
            title: chat.name,
            headerRight: () => (
              <Image
                source={{ uri: chat.avatar }}
                style={styles.headerAvatar}
              />
            ),
          }} 
        />
        
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {groupedMessages().map((group, groupIndex) => (
            <View key={groupIndex} style={styles.messageGroup}>
              <View style={styles.dateContainer}>
                <View style={[styles.dateLine, { backgroundColor: colors.border }]} />
                <Text style={[styles.dateText, { color: colors.muted, backgroundColor: colors.background }]}>
                  {group.date}
                </Text>
                <View style={[styles.dateLine, { backgroundColor: colors.border }]} />
              </View>
              
              {group.messages.map((msg, msgIndex) => (
                <View 
                  key={msg.id}
                  style={[
                    styles.messageContainer,
                    msg.sender === 'user' ? styles.userMessageContainer : styles.otherMessageContainer,
                  ]}
                >
                  {msg.sender === 'other' && (
                    <Image
                      source={{ uri: chat.avatar }}
                      style={styles.messageAvatar}
                    />
                  )}
                  
                  <View style={styles.messageContent}>
                    {msg.attachments && msg.attachments.length > 0 && (
                      <View style={styles.attachmentsContainer}>
                        {msg.attachments.map(attachment => (
                          <View 
                            key={attachment.id}
                            style={[
                              styles.attachmentPreview,
                              msg.sender === 'user' 
                                ? { backgroundColor: colors.primary + '20' }
                                : { backgroundColor: colors.subtle }
                            ]}
                          >
                            {attachment.type === 'image' ? (
                              <Image
                                source={{ uri: attachment.uri }}
                                style={styles.attachmentImage}
                                resizeMode="cover"
                              />
                            ) : (
                              <View style={styles.documentPreview}>
                                <Text 
                                  style={[
                                    styles.documentName,
                                    { color: msg.sender === 'user' ? colors.primary : colors.text }
                                  ]}
                                  numberOfLines={1}
                                  ellipsizeMode="middle"
                                >
                                  {attachment.name || 'Document'}
                                </Text>
                              </View>
                            )}
                          </View>
                        ))}
                      </View>
                    )}
                    
                    {msg.text.trim() !== '' && (
                      <View
                        style={[
                          styles.messageBubble,
                          msg.sender === 'user'
                            ? [styles.userBubble, { backgroundColor: colors.primary }]
                            : [styles.otherBubble, { backgroundColor: colors.card, borderColor: colors.border }],
                        ]}
                      >
                        <Text
                          style={[
                            styles.messageText,
                            { color: msg.sender === 'user' ? '#FFFFFF' : colors.text },
                          ]}
                        >
                          {msg.text}
                        </Text>
                      </View>
                    )}
                    
                    <Text
                      style={[
                        styles.messageTime,
                        { color: msg.sender === 'user' ? colors.primary + '80' : colors.muted },
                      ]}
                    >
                      {formatTime(msg.timestamp)}
                      {msg.sender === 'user' && (
                        <Text>
                          {' '}
                          {msg.status === 'read' ? '✓✓' : msg.status === 'delivered' ? '✓' : ''}
                        </Text>
                      )}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
        
        {attachments.length > 0 && (
          <View style={[styles.attachmentsPreviewContainer, { backgroundColor: colors.card }]}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.attachmentsPreviewContent}
            >
              {attachments.map(attachment => (
                <View key={attachment.id} style={styles.attachmentPreviewItem}>
                  {attachment.type === 'image' ? (
                    <Image
                      source={{ uri: attachment.uri }}
                      style={styles.attachmentPreviewImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.documentPreviewItem, { backgroundColor: colors.subtle }]}>
                      <Text style={[styles.documentPreviewName, { color: colors.text }]} numberOfLines={1}>
                        {attachment.name || 'Document'}
                      </Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={[styles.removeAttachmentButton, { backgroundColor: colors.error }]}
                    onPress={() => handleRemoveAttachment(attachment.id)}
                  >
                    <X size={12} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
        
        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.attachButton, { backgroundColor: colors.subtle }]}
            onPress={() => {
              Alert.alert(
                'Attach File',
                'Choose file type',
                [
                  {
                    text: 'Photo',
                    onPress: handlePickImage,
                  },
                  {
                    text: 'Document',
                    onPress: handlePickDocument,
                  },
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },
                ]
              );
            }}
          >
            <Paperclip size={20} color={colors.primary} />
          </TouchableOpacity>
          
          <TextInput
            style={[styles.input, { backgroundColor: colors.subtle, color: colors.text }]}
            placeholder="Type a message..."
            placeholderTextColor={colors.muted}
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={500}
          />
          
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: message.trim() || attachments.length > 0 ? colors.primary : colors.muted },
            ]}
            onPress={handleSendMessage}
            disabled={(!message.trim() && attachments.length === 0) || isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Send size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 16,
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageGroup: {
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateLine: {
    flex: 1,
    height: 1,
  },
  dateText: {
    fontSize: 12,
    paddingHorizontal: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '80%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  messageContent: {
    flexDirection: 'column',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  attachmentsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
    gap: 8,
  },
  attachmentPreview: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  attachmentImage: {
    width: 150,
    height: 100,
    borderRadius: 8,
  },
  documentPreview: {
    padding: 8,
    borderRadius: 8,
  },
  documentName: {
    fontSize: 12,
    maxWidth: 150,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  attachmentsPreviewContainer: {
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  attachmentsPreviewContent: {
    gap: 8,
  },
  attachmentPreviewItem: {
    position: 'relative',
    marginRight: 8,
  },
  attachmentPreviewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  documentPreviewItem: {
    width: 60,
    height: 60,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  documentPreviewName: {
    fontSize: 10,
    textAlign: 'center',
  },
  removeAttachmentButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});