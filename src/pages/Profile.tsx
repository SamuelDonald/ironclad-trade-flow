import { useState } from "react";
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

const Profile = () => {
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    avatar: "",
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: false,
    pushNotifications: false,
    marketUpdates: false,
    tradingAlerts: false,
    newsletters: false,
  });

  const { toast } = useToast();
  const navigate = useNavigate();

  const paymentMethods: { type: string; details: string; verified: boolean }[] = [];

  const handleProfileUpdate = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully.",
    });
  };

  const handleAvatarUpload = () => {
    toast({
      title: "Avatar Upload",
      description: "Avatar upload functionality would be implemented here.",
    });
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

  return (
    <div className="container max-w-4xl mx-auto p-6 pb-20 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-indigo-700">Profile</h1>
        <Button 
          variant="outline" 
          size="sm" 
          className="border-indigo-500 text-indigo-600"
          onClick={() => navigate('/customer-care')}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Customer Care
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="personal" className="space-y-8">
        <TabsList className="w-full flex justify-between bg-transparent border-b border-gray-200">
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
                <AvatarImage src={profile.avatar} />
                <AvatarFallback className="text-lg bg-indigo-100 text-indigo-700">
                  <User className="w-10 h-10" />
                </AvatarFallback>
              </Avatar>
              <Button onClick={handleAvatarUpload} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <Camera className="w-4 h-4 mr-2" />
                Upload New Picture
              </Button>
              <p className="text-sm text-gray-500">JPG, PNG or GIF. Max size 5MB.</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg rounded-2xl border">
            <CardHeader>
              <CardTitle className="text-indigo-700">Personal Information</CardTitle>
              <CardDescription>Update your details and contact info</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profile.firstName}
                    onChange={(e) =>
                      setProfile({ ...profile, firstName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profile.lastName}
                    onChange={(e) =>
                      setProfile({ ...profile, lastName: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile({ ...profile, email: e.target.value })
                    }
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="address"
                    value={profile.address}
                    onChange={(e) =>
                      setProfile({ ...profile, address: e.target.value })
                    }
                    className="pl-10"
                  />
                </div>
              </div>

              <Button
                onClick={handleProfileUpdate}
                className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Save Changes
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
              {paymentMethods.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No payment methods added yet</p>
                  <p className="text-sm">Add a payment method to get started</p>
                </div>
              ) : (
                paymentMethods.map((method, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-xl bg-gray-50"
                  >
                    <div>
                      <p className="font-semibold">{method.type}</p>
                      <p className="text-sm text-gray-500">{method.details}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          method.verified
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {method.verified ? "Verified" : "Pending"}
                      </span>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))
              )}
              <Button
                variant="outline"
                className="w-full border-indigo-500 text-indigo-600"
                onClick={() => navigate("/wallet")}
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
    </div>
  );
};

export default Profile;
