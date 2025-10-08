import React, { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  CreditCard,
  Shield,
  Bell,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import { MobileFAB } from "@/components/MobileFAB";
import { useIsMobile } from "@/hooks/use-mobile";
import AddPaymentMethodModal from "@/components/AddPaymentMethodModal";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("personal");
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [notifications, setNotifications] = useState({
    emailAlerts: false,
    pushNotifications: false,
    marketUpdates: false,
    tradingAlerts: false,
    newsletters: false,
  });

  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { unreadCount, markAsRead } = useUnreadMessages();
  
  // Use real profile and payment method hooks
  const { profile, loading: profileLoading, updateProfile, uploadAvatar } = useProfile();
  const { paymentMethods, loading: paymentLoading, removePaymentMethod, setDefaultPaymentMethod, refetch: refetchPayments } = usePaymentMethods();

  // Form state for profile editing
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
  });

  // Update form data when profile loads
  React.useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        address: profile.address || "",
      });
    }
  }, [profile]);

  const handleProfileUpdate = async () => {
    try {
      await updateProfile(formData);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.match(/^image\/(jpeg|jpg|png|gif)$/)) {
      toast({
        title: "Invalid file type",
        description: "Please select a JPEG, PNG, or GIF image.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      await uploadAvatar(file);
    } catch (error) {
      console.error('Failed to upload avatar:', error);
    }
  };

  const handleNotificationToggle = (setting: string) => {
    setNotifications((prev) => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev],
    }));

    toast({
      title: "Notification Settings Updated",
      description: "Your notification preferences have been saved.",
    });
  };

  // Mobile FAB options
  const tabOptions = [
    { label: "Personal Info", value: "personal", onClick: () => setActiveTab("personal") },
    { label: "Payment Methods", value: "payment", onClick: () => setActiveTab("payment") },
    { label: "Notifications", value: "notifications", onClick: () => setActiveTab("notifications") },
    { label: "Security", value: "security", onClick: () => setActiveTab("security") }
  ];

  return (
    <div className="container max-w-4xl mx-auto p-6 pb-20 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-indigo-700">Profile</h1>
        <Button 
          variant="outline" 
          size="sm" 
          className="border-indigo-500 text-indigo-600 relative"
          onClick={() => {
            markAsRead();
            navigate('/customer-care');
          }}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Customer Care
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </div>

      {/* Mobile FAB for tab navigation */}
      <MobileFAB options={tabOptions} activeValue={activeTab} />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className={`w-full flex justify-between bg-transparent border-b border-gray-200 ${isMobile ? 'hidden' : ''}`}>
          <TabsTrigger value="personal" className="text-indigo-600">Personal Info</TabsTrigger>
          <TabsTrigger value="payment" className="text-indigo-600">Payment Methods</TabsTrigger>
          <TabsTrigger value="notifications" className="text-indigo-600">Notifications</TabsTrigger>
          <TabsTrigger value="security" className="text-indigo-600">Security</TabsTrigger>
        </TabsList>

        {/* Personal Info */}
        <TabsContent value="personal" className="space-y-8">
          <Card className="shadow-lg rounded-2xl border">
            <CardHeader>
              <CardTitle className="text-indigo-700">Profile Picture</CardTitle>
              <CardDescription>Upload and manage your profile picture</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6">
              <Avatar className="h-28 w-28 ring-4 ring-indigo-200">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="text-lg bg-indigo-100 text-indigo-700">
                  <User className="w-10 h-10" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  id="avatar-upload"
                />
                <Button 
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  disabled={profileLoading}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Upload New Picture
                </Button>
                <p className="text-sm text-gray-500">JPG, PNG or GIF. Max size 5MB.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg rounded-2xl border">
            <CardHeader className="relative">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-indigo-700">Personal Information</CardTitle>
                  <CardDescription>Update your details and contact info</CardDescription>
                </div>
                {profile?.kyc_status && (
                  <Badge 
                    variant={
                      profile.kyc_status === 'approved' ? 'default' : 
                      profile.kyc_status === 'rejected' ? 'destructive' : 
                      'secondary'
                    }
                    className="absolute top-6 right-6"
                  >
                    KYC: {profile.kyc_status.charAt(0).toUpperCase() + profile.kyc_status.slice(1)}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  disabled={profileLoading}
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="pl-10"
                    disabled={profileLoading}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="pl-10"
                    disabled={profileLoading}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="pl-10"
                    disabled={profileLoading}
                  />
                </div>
              </div>

              <Button
                onClick={handleProfileUpdate}
                className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={profileLoading}
              >
                {profileLoading ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Methods */}
        <TabsContent value="payment" className="space-y-6">
          <Card className="shadow-lg rounded-2xl border">
            <CardHeader>
              <CardTitle className="text-indigo-700">Payment Methods</CardTitle>
              <CardDescription>Manage your payment options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded-xl"></div>
                  ))}
                </div>
              ) : paymentMethods.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No payment methods added yet</p>
                  <p className="text-sm">Add a payment method to get started</p>
                </div>
              ) : (
                paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="flex items-center justify-between p-4 border rounded-xl bg-gray-50"
                  >
                    <div>
                      <p className="font-semibold">
                        {method.card_number 
                          ? method.card_number.match(/.{1,4}/g)?.join(' ') 
                          : `**** **** **** ${method.last4}`}
                      </p>
                      <p className="text-sm text-gray-500">
                        {method.cardholder_name && `${method.cardholder_name} • `}
                        {method.brand} • Expires {method.exp_month}/{method.exp_year}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {method.is_default && (
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                          Default
                        </span>
                      )}
                      {!method.is_default && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setDefaultPaymentMethod(method.id)}
                        >
                          Set Default
                        </Button>
                      )}
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => {
                          if (confirm('Remove this payment method?')) {
                            removePaymentMethod(method.id);
                          }
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))
              )}
              <Button
                variant="outline"
                className="w-full border-indigo-500 text-indigo-600"
                onClick={() => setShowAddPaymentModal(true)}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Add Payment Method
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="shadow-lg rounded-2xl border">
            <CardHeader>
              <CardTitle className="text-indigo-700">Notification Preferences</CardTitle>
              <CardDescription>Manage what updates you receive</CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-gray-200">
              {Object.entries(notifications).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between py-4"
                >
                  <p className="capitalize font-medium">{key.replace(/([A-Z])/g, " $1")}</p>
                  <Switch
                    checked={value}
                    onCheckedChange={() => handleNotificationToggle(key)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          <Card className="shadow-lg rounded-2xl border">
            <CardHeader>
              <CardTitle className="text-indigo-700">Security Settings</CardTitle>
              <CardDescription>Manage account protection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Two-Factor Authentication", action: "Setup 2FA" },
                { label: "Change Password", action: "Change Password" },
                { label: "Login Sessions", action: "View Sessions" },
                { label: "API Keys", action: "Manage APIs" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 border rounded-xl"
                >
                  <p className="font-medium">{item.label}</p>
                  <Button variant="outline">{item.action}</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Payment Method Modal */}
      <AddPaymentMethodModal
        open={showAddPaymentModal}
        onOpenChange={setShowAddPaymentModal}
        onSuccess={() => refetchPayments()}
      />
    </div>
  );
};

export default Profile;
