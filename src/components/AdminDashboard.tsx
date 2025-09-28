import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  FileCheck,
  Wallet,
  Eye,
  BarChart3
} from "lucide-react";

type AdminSection = 'overview' | 'users' | 'transactions' | 'trades' | 'kyc' | 'market-assets' | 'audit-logs' | 'notifications';

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
  
  // Mock data - this will be replaced with real data from edge functions
  const adminStats: AdminStats = {
    totalUsers: 12345,
    activeTraders: 789,
    totalDeposits: 5000000,
    totalWithdrawals: 3000000,
    pendingTransactions: 120,
    activeTrades: 456,
    pendingKyc: 23,
    totalAssets: 150
  };

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'transactions', label: 'Transactions', icon: DollarSign },
    { id: 'trades', label: 'Trades', icon: TrendingUp },
    { id: 'kyc', label: 'KYC Review', icon: FileCheck },
    { id: 'market-assets', label: 'Market Assets', icon: Wallet },
    { id: 'audit-logs', label: 'Audit Logs', icon: Eye },
    { id: 'notifications', label: 'Notifications', icon: AlertCircle },
  ] as const;

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: adminStats.totalUsers.toLocaleString(), color: "text-blue-600", bgColor: "bg-blue-50" },
          { label: "Active Traders", value: adminStats.activeTraders.toLocaleString(), color: "text-green-600", bgColor: "bg-green-50" },
          { label: "Pending KYC", value: adminStats.pendingKyc, color: "text-yellow-600", bgColor: "bg-yellow-50" },
          { label: "Pending Transactions", value: adminStats.pendingTransactions, color: "text-red-600", bgColor: "bg-red-50" },
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
            <CardTitle className="text-lg">Financial Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Total Deposits:</span>
              <span className="font-semibold text-green-600">
                ${(adminStats.totalDeposits / 1_000_000).toFixed(1)}M
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total Withdrawals:</span>
              <span className="font-semibold text-red-600">
                ${(adminStats.totalWithdrawals / 1_000_000).toFixed(1)}M
              </span>
            </div>
            <div className="flex justify-between">
              <span>Active Trades:</span>
              <span className="font-semibold">{adminStats.activeTrades}</span>
            </div>
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
              <span>Market Assets:</span>
              <span className="font-semibold">{adminStats.totalAssets}</span>
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
        return renderOverview();
      case 'users':
        return (
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Manage user accounts, view profiles, and handle user-related operations.</p>
              <Button className="w-full sm:w-auto">View All Users</Button>
            </CardContent>
          </Card>
        );
      case 'transactions':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Transaction Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Review deposits, withdrawals, and approve pending transactions.</p>
              <div className="space-y-2">
                <Button variant="outline" className="w-full sm:w-auto mr-2">View Deposits</Button>
                <Button variant="outline" className="w-full sm:w-auto">View Withdrawals</Button>
              </div>
            </CardContent>
          </Card>
        );
      case 'trades':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Trading Oversight</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Monitor trading activity and flag suspicious transactions.</p>
              <Button className="w-full sm:w-auto">View Active Trades</Button>
            </CardContent>
          </Card>
        );
      case 'kyc':
        return (
          <Card>
            <CardHeader>
              <CardTitle>KYC Review</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Review and approve customer identity verification documents.</p>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary">{adminStats.pendingKyc} Pending Reviews</Badge>
              </div>
              <Button className="w-full sm:w-auto">Review KYC Applications</Button>
            </CardContent>
          </Card>
        );
      case 'market-assets':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Market Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Manage tradeable assets, symbols, and market data.</p>
              <div className="space-y-2">
                <Button className="w-full sm:w-auto mr-2">Add New Asset</Button>
                <Button variant="outline" className="w-full sm:w-auto">View All Assets</Button>
              </div>
            </CardContent>
          </Card>
        );
      case 'audit-logs':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">View all administrative actions and system changes.</p>
              <Button className="w-full sm:w-auto">View Audit Trail</Button>
            </CardContent>
          </Card>
        );
      case 'notifications':
        return (
          <Card>
            <CardHeader>
              <CardTitle>System Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Send system-wide notifications to users.</p>
              <Button className="w-full sm:w-auto">Send Notification</Button>
            </CardContent>
          </Card>
        );
      default:
        return renderOverview();
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
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