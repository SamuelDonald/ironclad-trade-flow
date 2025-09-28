"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAdmin } from "@/contexts/AdminContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { supabase } from "@/integrations/supabase/client"
import {
  Moon,
  Bell,
  Shield,
  Globe,
  UserCog,
  Info,
  LogOut,
} from "lucide-react"
import { AdminDashboard } from "@/components/AdminDashboard"

export default function SettingsPage() {
  const navigate = useNavigate()
  const { isAdmin, loading: adminLoading } = useAdmin()
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [twoFactorAuth, setTwoFactorAuth] = useState(false)

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
    })
  }

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        toast({
          title: "Error",
          description: "Failed to sign out. Please try again.",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      })

      navigate("/auth")
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred during logout.",
        variant: "destructive",
      })
    }
  }


  return (
    <div className="container mx-auto px-4 py-8 pb-20">
      <h1 className="text-3xl font-bold text-indigo-700 mb-6">Settings</h1>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 bg-white p-2 rounded-xl shadow-sm overflow-x-auto">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
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

      {/* Logout Button */}
      <div className="mt-6 flex justify-center">
        <Button
          onClick={handleLogout}
          variant="destructive"
          className="w-full max-w-md"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}