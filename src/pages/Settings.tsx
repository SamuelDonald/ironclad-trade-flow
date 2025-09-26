import { useState } from "react";
import { Settings as SettingsIcon, Moon, Sun, Globe, Shield, User, UserCog, Users, Activity, DollarSign, BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    darkMode: false,
    language: "english",
    currency: "USD",
    notifications: true,
    autoSave: true,
    isAdmin: true // This would come from user auth context in real app
  });

  const handleSettingChange = (setting: string, value: any) => {
    setSettings(prev => ({ ...prev, [setting]: value }));
    toast({
      title: "Settings Updated",
      description: `${setting} has been updated successfully.`,
    });
  };

  const adminStats = {
    totalUsers: 15247,
    activeTraders: 8934,
    totalDeposits: 2450000,
    totalWithdrawals: 1890000,
    pendingTransactions: 127,
    activeTrades: 1534
  };

  return (
    <div className="container max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <SettingsIcon className="w-8 h-8" />
          Settings
        </h1>
        {settings.isAdmin && (
          <Badge variant="default" className="px-3 py-1">
            Administrator
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Customize your app experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent rounded-full">
                  {settings.darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </div>
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">Toggle dark theme</p>
                </div>
              </div>
              <Switch
                checked={settings.darkMode}
                onCheckedChange={(value) => handleSettingChange('darkMode', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent rounded-full">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium">Language</p>
                  <p className="text-sm text-muted-foreground">Select your preferred language</p>
                </div>
              </div>
              <Select value={settings.language} onValueChange={(value) => handleSettingChange('language', value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="spanish">Spanish</SelectItem>
                  <SelectItem value="french">French</SelectItem>
                  <SelectItem value="german">German</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent rounded-full">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium">Default Currency</p>
                  <p className="text-sm text-muted-foreground">Primary currency for display</p>
                </div>
              </div>
              <Select value={settings.currency} onValueChange={(value) => handleSettingChange('currency', value)}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="JPY">JPY</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto-save Settings</p>
                <p className="text-sm text-muted-foreground">Automatically save your preferences</p>
              </div>
              <Switch
                checked={settings.autoSave}
                onCheckedChange={(value) => handleSettingChange('autoSave', value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your account preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate("/profile")}
            >
              <User className="w-4 h-4 mr-3" />
              Profile Settings
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate("/profile?tab=security")}
            >
              <Shield className="w-4 h-4 mr-3" />
              Security & Privacy
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate("/profile?tab=notifications")}
            >
              <SettingsIcon className="w-4 h-4 mr-3" />
              Notification Preferences
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate("/wallet")}
            >
              <DollarSign className="w-4 h-4 mr-3" />
              Payment Methods
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Admin Section */}
      {settings.isAdmin && (
        <Card className="gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="w-5 h-5" />
              Admin Dashboard
            </CardTitle>
            <CardDescription>Administrative tools and platform management</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Admin Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              <div className="text-center p-3 bg-white/50 rounded-lg">
                <p className="text-2xl font-bold text-primary">{adminStats.totalUsers.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </div>
              <div className="text-center p-3 bg-white/50 rounded-lg">
                <p className="text-2xl font-bold text-profit">{adminStats.activeTraders.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Active Traders</p>
              </div>
              <div className="text-center p-3 bg-white/50 rounded-lg">
                <p className="text-2xl font-bold text-primary">${(adminStats.totalDeposits / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-muted-foreground">Total Deposits</p>
              </div>
              <div className="text-center p-3 bg-white/50 rounded-lg">
                <p className="text-2xl font-bold text-loss">${(adminStats.totalWithdrawals / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-muted-foreground">Total Withdrawals</p>
              </div>
              <div className="text-center p-3 bg-white/50 rounded-lg">
                <p className="text-2xl font-bold text-warning">{adminStats.pendingTransactions}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
              <div className="text-center p-3 bg-white/50 rounded-lg">
                <p className="text-2xl font-bold text-primary">{adminStats.activeTrades.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Active Trades</p>
              </div>
            </div>

            {/* Admin Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2"
                onClick={() => toast({ title: "User Management", description: "Opening user management panel..." })}
              >
                <Users className="w-6 h-6" />
                <span>Manage Users</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2"
                onClick={() => toast({ title: "Transactions", description: "Opening transaction monitoring..." })}
              >
                <DollarSign className="w-6 h-6" />
                <span>Monitor Transactions</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2"
                onClick={() => toast({ title: "Trading Activity", description: "Opening trading activity monitor..." })}
              >
                <Activity className="w-6 h-6" />
                <span>Trading Activity</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2"
                onClick={() => toast({ title: "Analytics", description: "Opening platform analytics..." })}
              >
                <BarChart3 className="w-6 h-6" />
                <span>Platform Analytics</span>
              </Button>
            </div>

            <div className="mt-6 p-4 bg-warning/10 rounded-lg border border-warning/20">
              <h4 className="font-semibold text-warning mb-2">Admin Functions</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => toast({ title: "User Reset", description: "User password reset functionality..." })}
                >
                  Reset User Passwords
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => toast({ title: "Account Management", description: "Account suspension/activation..." })}
                >
                  Suspend/Activate Accounts
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => toast({ title: "System Maintenance", description: "System maintenance tools..." })}
                >
                  System Maintenance
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* App Information */}
      <Card>
        <CardHeader>
          <CardTitle>About IronClad Trade Hub</CardTitle>
          <CardDescription>Application information and support</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="font-semibold">Version</p>
              <p className="text-sm text-muted-foreground">2.1.0</p>
            </div>
            <div>
              <p className="font-semibold">Build</p>
              <p className="text-sm text-muted-foreground">2024.01.15</p>
            </div>
            <div>
              <p className="font-semibold">Platform</p>
              <p className="text-sm text-muted-foreground">Web App</p>
            </div>
            <div>
              <p className="font-semibold">Support</p>
              <p className="text-sm text-muted-foreground">24/7 Available</p>
            </div>
          </div>
          
          <div className="flex gap-4 pt-4">
            <Button variant="outline" className="flex-1">
              Contact Support
            </Button>
            <Button variant="outline" className="flex-1">
              Terms of Service
            </Button>
            <Button variant="outline" className="flex-1">
              Privacy Policy
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;