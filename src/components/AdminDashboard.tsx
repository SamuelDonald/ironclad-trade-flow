import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  FileCheck,
  Eye,
  BarChart3,
  MessageCircle,
  Send,
  Paperclip,
  File,
  X,
  ArrowLeft
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AdminUserSearch } from "@/components/AdminUserSearch";
import { useNavigate } from "react-router-dom";
import { OverviewPanel } from "./admin/OverviewPanel";
import { UsersPanel } from "./admin/UsersPanel";
import { KYCPanel } from "./admin/KYCPanel";

type AdminSection = 'overview' | 'users' | 'transactions' | 'trades' | 'kyc' | 'support' | 'audit-logs';

interface AdminStats {
  totalUsers: number;
  activeTraders: number;
  totalDeposits: number;
  totalWithdrawals: number;
  pendingTransactions: number;
  activeTrades: number;
  pendingKyc: number;
  totalAssets: number;
}

export const AdminDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Real data states
  const [liveStats, setLiveStats] = useState<AdminStats>({
    totalUsers: 0,
    activeTraders: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    pendingTransactions: 0,
    activeTrades: 0,
    pendingKyc: 0,
    totalAssets: 0
  });
  const [users, setUsers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Load real data
  useEffect(() => {
    loadOverviewData();
    loadUsersData();
    loadTransactionsData();
    loadTradesData();
    loadSupportData();
  }, []);

  // Real-time support messages subscription
  useEffect(() => {
    if (!selectedConversation) return;
    
    const channel = supabase
      .channel('admin_messages_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
          filter: `conversation_id=eq.${selectedConversation}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as any]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation]);

  // Real-time support conversations subscription
  useEffect(() => {
    const channel = supabase
      .channel('admin_conversations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_conversations'
        },
        () => {
          loadSupportData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadOverviewData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await supabase.functions.invoke('admin-operations', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (response.data) {
        setLiveStats(response.data);
      }
    } catch (error) {
      console.error('Error loading overview data:', error);
    }
  };

  const loadUsersData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('https://jgedidtpqfashojqagbd.functions.supabase.co/admin-operations/users', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error loading users data:', error);
    }
  };

  const loadTransactionsData = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { action: 'transactions' },
      });

      if (error) throw error;

      if (data) {
        setTransactions(data);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load transactions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTradesData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('https://jgedidtpqfashojqagbd.functions.supabase.co/admin-operations/trades', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error('Error loading transactions data:', error);
    }
  };

  const loadTradesData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('https://jgedidtpqfashojqagbd.functions.supabase.co/admin-operations/trades', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setTrades(data);
      }
    } catch (error) {
      console.error('Error loading trades data:', error);
    }
  };

  const loadSupportData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('https://jgedidtpqfashojqagbd.functions.supabase.co/admin-support/conversations', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (response.ok) {
        const data = await response.json();
        // Enrich with user_profile for easier access
        const enrichedData = data.map((conv: any) => ({
          ...conv,
          user_profile: {
            full_name: conv.user_name,
            email: conv.user_email
          }
        }));
        setConversations(enrichedData);
      }
    } catch (error) {
      console.error('Error loading support data:', error);
    }
  };

  const updateUserBalance = async (userId: string, balances: any) => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`https://jgedidtpqfashojqagbd.functions.supabase.co/admin-operations/users/${userId}/balances`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify(balances)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "User balance updated successfully",
        });
        loadUsersData();
      }
    } catch (error) {
      console.error('Error updating user balance:', error);
      toast({
        title: "Error",
        description: "Failed to update user balance",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 5MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const uploadAttachment = async (conversationId: string, file: File) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Not authenticated');

      const fileName = `admin/${conversationId}/${Date.now()}_${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('support-attachments')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('support-attachments')
        .getPublicUrl(fileName);

      return {
        name: file.name,
        url: publicUrl,
        size: file.size,
        type: file.type
      };
    } catch (error) {
      console.error('Error uploading attachment:', error);
      toast({
        title: "Error",
        description: "Failed to upload attachment",
        variant: "destructive",
      });
      return null;
    }
  };

  const sendSupportMessage = async () => {
    if (!selectedConversation || (!newMessage.trim() && !selectedFile)) return;

    try {
      setUploading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      let attachments: any[] = [];

      if (selectedFile) {
        const attachment = await uploadAttachment(selectedConversation, selectedFile);
        if (attachment) {
          attachments.push(attachment);
        }
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }

      const response = await fetch(`https://jgedidtpqfashojqagbd.functions.supabase.co/admin-support/conversations/${selectedConversation}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ 
          message: newMessage,
          attachments: attachments.length > 0 ? attachments : undefined
        })
      });

      if (response.ok) {
        setNewMessage('');
        loadSupportData();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleStartConversation = async (userId: string, userName: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const subject = `Admin-initiated conversation with ${userName}`;
      const initialMessage = 'Hello, how can we help you?';

      const response = await fetch('https://jgedidtpqfashojqagbd.functions.supabase.co/admin-support/start', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ 
          user_id: userId, 
          subject, 
          initial_message: initialMessage 
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: "Conversation started with user",
        });
        loadSupportData();
        setSelectedConversation(data.conversation_id);
        setMessages([{ sender: 'admin', body: initialMessage, created_at: new Date().toISOString() }]);
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive",
      });
    }
  };

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'transactions', label: 'Transactions', icon: DollarSign },
    { id: 'trades', label: 'Trades', icon: TrendingUp },
    { id: 'kyc', label: 'KYC Review', icon: FileCheck },
    { id: 'support', label: 'Support', icon: MessageCircle },
    { id: 'audit-logs', label: 'Audit Logs', icon: Eye },
  ] as const;

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: users.length.toLocaleString(), color: "text-blue-600", bgColor: "bg-blue-50" },
          { label: "Active Trades", value: trades.length.toLocaleString(), color: "text-green-600", bgColor: "bg-green-50" },
          { label: "Transactions", value: transactions.length, color: "text-yellow-600", bgColor: "bg-yellow-50" },
          { label: "Support Tickets", value: conversations.length, color: "text-red-600", bgColor: "bg-red-50" },
        ].map((stat, idx) => (
          <Card key={idx} className={`${stat.bgColor} border-0`}>
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Users</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {users.slice(0, 5).map((user) => (
              <div key={user.id} className="flex justify-between items-center">
                <span className="text-sm">{user.full_name || user.email}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span>System Status:</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">Online</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Total Users:</span>
              <span className="font-semibold">{users.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Last Updated:</span>
              <span className="text-sm text-muted-foreground">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewPanel />;
      case 'users':
        return <UsersPanel />;
      case 'kyc':
        return <KYCPanel />;
      case 'transactions':
        return (
          <Card>
            <CardHeader>
              <CardTitle>User Management ({users.length} total)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-semibold">{user.full_name || 'No name'}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Joined: {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      {user.portfolio_balances?.[0] && (
                        <div className="space-y-1">
                          <p className="text-sm">Cash: ${user.portfolio_balances[0].cash_balance}</p>
                          <p className="text-sm">Total: ${user.portfolio_balances[0].total_value}</p>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              const newCash = prompt('Enter new cash balance:', user.portfolio_balances[0].cash_balance);
                              const newInvested = prompt('Enter new invested amount:', user.portfolio_balances[0].invested_amount);
                              const newMargin = prompt('Enter new free margin:', user.portfolio_balances[0].free_margin);
                              if (newCash && newInvested && newMargin) {
                                updateUserBalance(user.id, {
                                  cashBalance: parseFloat(newCash),
                                  investedAmount: parseFloat(newInvested),
                                  freeMargin: parseFloat(newMargin)
                                });
                              }
                            }}
                            disabled={loading}
                          >
                            Edit Balance
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      case 'transactions':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Transaction Management ({transactions.length} total)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.slice(0, 10).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-semibold">{transaction.type} - {transaction.method}</p>
                      <p className="text-sm text-muted-foreground">
                        User: {transaction.profiles?.full_name || transaction.profiles?.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">${transaction.amount}</p>
                      <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      case 'trades':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Trading Oversight ({trades.length} total)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trades.slice(0, 10).map((trade) => (
                  <div key={trade.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-semibold">{trade.symbol} - {trade.type.toUpperCase()}</p>
                      <p className="text-sm text-muted-foreground">
                        User: {trade.profiles?.full_name || trade.profiles?.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(trade.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{trade.shares} shares @ ${trade.price}</p>
                      <p className="text-sm text-muted-foreground">Total: ${trade.total_amount}</p>
                      <Badge variant={trade.status === 'completed' ? 'default' : 'secondary'}>
                        {trade.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      case 'support':
        return (
          <div className="space-y-6">
            {/* User Search */}
            <Card>
              <CardHeader>
                <CardTitle>Search Users</CardTitle>
              </CardHeader>
              <CardContent>
                <AdminUserSearch onStartConversation={handleStartConversation} />
              </CardContent>
            </Card>

            {/* Conversations and Chat */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Conversations List */}
              <Card>
                <CardHeader>
                  <CardTitle>Support Conversations ({conversations.length})</CardTitle>
                </CardHeader>
                <CardContent className="max-h-96 overflow-y-auto">
                  <div className="space-y-2">
                   {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedConversation === conversation.id 
                          ? 'bg-primary/10 border-primary' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => {
                        setSelectedConversation(conversation.id);
                        setMessages(conversation.support_messages || []);
                      }}
                    >
                      <p className="font-medium">{conversation.subject || 'No subject'}</p>
                      
                      {/* User Info */}
                      <div className="mt-2 mb-1 p-2 bg-blue-50 rounded border border-blue-200">
                        <p className="text-sm font-semibold text-blue-900">
                          {conversation.user_profile?.full_name || 'Unknown User'}
                        </p>
                        <p className="text-xs text-blue-700">
                          {conversation.user_profile?.email || 'No email'}
                        </p>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {conversation.support_messages?.length || 0} messages
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(conversation.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                  {conversations.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">No conversations yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Chat Interface */}
            <Card>
              <CardHeader>
                <CardTitle>Chat</CardTitle>
                {selectedConversation && conversations.find(c => c.id === selectedConversation)?.user_profile && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="font-semibold text-blue-900">
                      Chatting with: {conversations.find(c => c.id === selectedConversation)?.user_profile?.full_name}
                    </p>
                    <p className="text-sm text-blue-700">
                      {conversations.find(c => c.id === selectedConversation)?.user_profile?.email}
                    </p>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {selectedConversation ? (
                  <div className="space-y-4">
                    {/* Messages */}
                    <div className="max-h-64 overflow-y-auto space-y-3">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              message.sender === 'admin'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm">{message.body}</p>
                            
                            {/* Attachments */}
                            {message.attachments && message.attachments.length > 0 && (
                              <div className="mt-2 space-y-2">
                                {message.attachments.map((attachment: any, idx: number) => (
                                  <div key={idx}>
                                    {attachment.type?.startsWith('image/') ? (
                                      <img 
                                        src={attachment.url} 
                                        alt={attachment.name} 
                                        className="max-w-sm rounded border"
                                      />
                                    ) : (
                                      <a 
                                        href={attachment.url} 
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm underline hover:opacity-80"
                                      >
                                        <File className="h-4 w-4" />
                                        {attachment.name} ({Math.round(attachment.size / 1024)}KB)
                                      </a>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            <p className="text-xs opacity-70 mt-1">
                              {new Date(message.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Selected File Preview */}
                    {selectedFile && (
                      <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                        <File className="h-4 w-4" />
                        <span className="text-sm flex-1">{selectedFile.name}</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    {/* Message Input */}
                    <div className="flex gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        hidden
                        accept="image/*,.pdf,.doc,.docx"
                        onChange={handleFileSelect}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Textarea
                        placeholder="Type your reply..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1"
                        rows={3}
                        disabled={uploading}
                      />
                      <Button 
                        onClick={sendSupportMessage} 
                        disabled={(!newMessage.trim() && !selectedFile) || uploading}
                        size="sm"
                      >
                        {uploading ? '...' : <Send className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">Select a conversation to view messages</p>
                  </div>
                )}
              </CardContent>
            </Card>
            </div>
          </div>
        );
      case 'audit-logs':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">View all administrative actions and system changes.</p>
              <div className="text-center py-8">
                <p className="text-muted-foreground">No audit logs available</p>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return renderOverview();
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button Header */}
      <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      </div>

      {/* Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? "default" : "ghost"}
                  size="sm"
                  className="flex-col h-16 p-2"
                  onClick={() => setActiveSection(item.id as AdminSection)}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-xs text-center leading-tight">{item.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      {renderSection()}
    </div>
  );
};