"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import {
  Moon,
  Bell,
  Shield,
  Globe,
  Users,
  DollarSign,
  TrendingUp,
  AlertCircle,
  UserCog,
  FileText,
  Info,
} from "lucide-react"

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [twoFactorAuth, setTwoFactorAuth] = useState(false)

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
    })
  }

  const adminStats = {
    totalUsers: 12345,
    activeTraders: 789,
    totalDeposits: 5000000,
    totalWithdrawals: 3000000,
    pendingTransactions: 120,
    activeTrades: 456,
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-indigo-700 mb-6">Settings</h1>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 bg-white p-2 rounded-xl shadow-sm">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card className="shadow-md rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-indigo-700">General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                    <Moon className="w-4 h-4" />
                  </div>
                  <span className="text-sm">Dark Mode</span>
                </div>
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                    <Globe className="w-4 h-4" />
                  </div>
                  <span className="text-sm">Language: English</span>
                </div>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:opacity-90"
                >
                  Change
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card className="shadow-md rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-indigo-700">Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                    <Shield className="w-4 h-4" />
                  </div>
                  <span className="text-sm">Two-Factor Authentication</span>
                </div>
                <Switch checked={twoFactorAuth} onCheckedChange={setTwoFactorAuth} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                    <UserCog className="w-4 h-4" />
                  </div>
                  <span className="text-sm">Change Password</span>
                </div>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:opacity-90"
                >
                  Update
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card className="shadow-md rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-indigo-700">Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                    <Bell className="w-4 h-4" />
                  </div>
                  <span className="text-sm">Enable Notifications</span>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences */}
        <TabsContent value="preferences">
          <Card className="shadow-md rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-indigo-700">Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white w-full hover:opacity-90"
                onClick={handleSaveSettings}
              >
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Admin */}
        <TabsContent value="admin">
          <Card className="shadow-md rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-indigo-700">Admin Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                {[
                  { label: "Total Users", value: adminStats.totalUsers.toLocaleString(), color: "text-indigo-600" },
                  { label: "Active Traders", value: adminStats.activeTraders.toLocaleString(), color: "text-purple-600" },
                  {
                    label: "Total Deposits",
                    value: `$${(adminStats.totalDeposits / 1_000_000).toFixed(1)}M`,
                    color: "text-green-600",
                  },
                  {
                    label: "Total Withdrawals",
                    value: `$${(adminStats.totalWithdrawals / 1_000_000).toFixed(1)}M`,
                    color: "text-red-600",
                  },
                  { label: "Pending", value: adminStats.pendingTransactions, color: "text-yellow-600" },
                  { label: "Active Trades", value: adminStats.activeTrades.toLocaleString(), color: "text-indigo-600" },
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border-2 border-indigo-200 bg-white shadow-sm text-center"
                  >
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Button className="h-20 flex-col gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md hover:opacity-90">
                  <Users className="w-6 h-6" />
                  <span>Manage Users</span>
                </Button>
                <Button className="h-20 flex-col gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md hover:opacity-90">
                  <DollarSign className="w-6 h-6" />
                  <span>Transactions</span>
                </Button>
                <Button className="h-20 flex-col gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md hover:opacity-90">
                  <TrendingUp className="w-6 h-6" />
                  <span>Trading Activity</span>
                </Button>
                <Button className="h-20 flex-col gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md hover:opacity-90">
                  <AlertCircle className="w-6 h-6" />
                  <span>Reports</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* About */}
        <TabsContent value="about">
          <Card className="shadow-md rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-indigo-700">About Ironclad Trade Hub</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 rounded-lg border border-indigo-200 shadow-sm">
                <p className="font-semibold text-indigo-600">Version</p>
                <p className="text-sm text-muted-foreground">2.1.0</p>
              </div>
              <div className="p-3 rounded-lg border border-indigo-200 shadow-sm">
                <p className="font-semibold text-indigo-600">Developed By</p>
                <p className="text-sm text-muted-foreground">Ironclad Dev Team</p>
              </div>
              <div className="p-3 rounded-lg border border-indigo-200 shadow-sm">
                <p className="font-semibold text-indigo-600">License</p>
                <p className="text-sm text-muted-foreground">MIT</p>
              </div>
              <div className="p-3 rounded-lg border border-indigo-200 shadow-sm">
                <p className="font-semibold text-indigo-600">Support</p>
                <p className="text-sm text-muted-foreground">support@ironclad.com</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
