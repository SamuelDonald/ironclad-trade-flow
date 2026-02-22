"use client"

import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAdmin } from "@/contexts/AdminContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useProfile } from "@/hooks/useProfile"
import { MobileFAB } from "@/components/MobileFAB"
import { useIsMobile } from "@/hooks/use-mobile"
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
  const { profile, updateProfile } = useProfile()
  const isMobile = useIsMobile()
  const [activeTab, setActiveTab] = useState("general")
  const [darkMode, setDarkMode] = useState(profile?.theme_preference === 'dark')
  const [notifications, setNotifications] = useState(true)
  const [twoFactorAuth, setTwoFactorAuth] = useState(false)

  // Update dark mode when profile loads
  React.useEffect(() => {
    if (profile?.theme_preference) {
      const isDark = profile.theme_preference === 'dark'
      setDarkMode(isDark)
      document.documentElement.classList.toggle('dark', isDark)
    }
  }, [profile])

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
    })
  }

  const handleDarkModeToggle = async (checked: boolean) => {
    setDarkMode(checked)
    document.documentElement.classList.toggle('dark', checked)
    
    try {
      await updateProfile({ theme_preference: checked ? 'dark' : 'light' })
    } catch (error) {
      console.error('Failed to save theme preference:', error)
    }
  }

  const handleChangePassword = async () => {
    try {
      const email = profile?.email
      if (!email) {
        toast({
          title: "Error",
          description: "No email found for password reset.",
          variant: "destructive",
        })
        return
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) throw error

      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for password reset instructions.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send password reset email.",
        variant: "destructive",
      })
    }
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


  const tabOptions = [
    { label: "General", value: "general", onClick: () => setActiveTab("general") },
    { label: "Security", value: "security", onClick: () => setActiveTab("security") },
    { label: "Notifications", value: "notifications", onClick: () => setActiveTab("notifications") },
    { label: "Preferences", value: "preferences", onClick: () => setActiveTab("preferences") },
    { label: "About", value: "about", onClick: () => setActiveTab("about") }
  ]

  return (
    <div className="container mx-auto px-4 py-8 pb-20">
      <h1 className="text-3xl font-bold text-foreground mb-6">Settings</h1>
      
      <MobileFAB options={tabOptions} activeValue={activeTab} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className={`grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 bg-card p-2 rounded-xl shadow-sm overflow-x-auto ${isMobile ? 'hidden' : ''}`}>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card className="card-binance">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-primary/20">
                    <Moon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm">Dark Mode</span>
                </div>
                <Switch checked={darkMode} onCheckedChange={handleDarkModeToggle} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-primary/20">
                    <Globe className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm">Language: English</span>
                </div>
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-background"
                >
                  Change
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card className="card-binance">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-primary/20">
                    <Shield className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm">Two-Factor Authentication</span>
                </div>
                <Switch checked={twoFactorAuth} onCheckedChange={setTwoFactorAuth} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-primary/20">
                    <UserCog className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm">Change Password</span>
                </div>
                <Button
                  size="sm"
                  onClick={handleChangePassword}
                  className="bg-primary hover:bg-primary/90 text-background"
                >
                  Update
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card className="card-binance">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-primary/20">
                    <Bell className="w-4 h-4 text-primary" />
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
          <Card className="card-binance">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                className="bg-primary hover:bg-primary/90 text-background w-full"
                onClick={handleSaveSettings}
              >
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>


        {/* About */}
        <TabsContent value="about">
          <Card className="card-binance">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">About PrimeLink Unity Services</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 rounded-lg border border-border shadow-sm">
                <p className="font-semibold text-primary">Version</p>
                <p className="text-sm text-muted-foreground">2.1.0</p>
              </div>
              <div className="p-3 rounded-lg border border-border shadow-sm">
                <p className="font-semibold text-primary">Developed By</p>
                <p className="text-sm text-muted-foreground">PrimeLink Dev Team</p>
              </div>
              <div className="p-3 rounded-lg border border-border shadow-sm">
                <p className="font-semibold text-primary">License</p>
                <p className="text-sm text-muted-foreground">MIT</p>
              </div>
              <div className="p-3 rounded-lg border border-border shadow-sm">
                <p className="font-semibold text-primary">Support</p>
                <p className="text-sm text-muted-foreground">support@primelink.com</p>
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