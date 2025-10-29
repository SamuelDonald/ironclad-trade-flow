import { useState, useEffect } from "react";
import { Eye, EyeOff, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams } from "react-router-dom";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });

  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Handle Supabase email confirmation redirect tokens
  useEffect(() => {
    const handleEmailConfirmation = async () => {
      const hash = window.location.hash;

      if (hash.includes("access_token") && hash.includes("type=signup")) {
        try {
          const { data, error } = await supabase.auth.getSession();

          if (error) {
            console.error("Email confirmation error:", error);
            toast({
              title: "Confirmation Error",
              description: error.message,
              variant: "destructive",
            });
          } else if (data?.session) {
            toast({
              title: "Email Confirmed",
              description: "Your email has been successfully confirmed. Redirecting...",
            });
            // Clean the URL hash
            window.history.replaceState(null, '', '/auth');
            // Redirect to portfolio after 2 seconds
            setTimeout(() => {
              navigate("/", { replace: true });
            }, 2000);
          }
        } catch (err) {
          console.error("Unexpected confirmation error:", err);
          toast({
            title: "Error",
            description: "An unexpected error occurred during confirmation.",
            variant: "destructive",
          });
        }
      }
    };

    handleEmailConfirmation();
  }, [navigate, toast]);

  // Preserve existing query-based redirects and errors
  useEffect(() => {
    const redirect = searchParams.get('redirect');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    if (redirect === 'confirmed') {
      toast({
        title: "Email Confirmed",
        description: "Your email has been successfully confirmed. Please sign in to continue.",
      });
    } else if (error) {
      if (error === 'access_denied' && errorDescription?.includes('expired')) {
        toast({
          title: "Confirmation Link Expired",
          description: "Please request a new confirmation email by signing up again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Authentication Error",
          description: errorDescription || "An error occurred. Please try again.",
          variant: "destructive",
        });
      }
    }
  }, [searchParams, toast]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        // Show specific error for unconfirmed email
        if (error.message === 'Email not confirmed') {
          toast({
            title: "Email not confirmed",
            description: "Please check your email and click the confirmation link before signing in.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Success",
          description: "Signed in successfully!",
        });
        navigate("/");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth?redirect=confirmed`,
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
          },
        },
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Account created successfully! Please check your email.",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#181A20] px-4">
      <div className="w-full max-w-lg space-y-8">
        {/* Branding */}
        <div className="text-center animate-fade-in space-y-6">
          {/* Logo Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FCD535] to-[#F0B90B] flex items-center justify-center shadow-lg hover:shadow-[0_0_15px_rgba(252,213,53,0.25)] transition-all duration-300">
              <DollarSign size={40} className="text-[#181A20]" />
            </div>
          </div>
          
          {/* Brand Title */}
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
              IronClad Trade Hub
            </h1>
            <p className="mt-2 text-[#A1A1A1] text-sm max-w-sm mx-auto">
              Your secure gateway to smarter, faster trading in stocks, forex, and crypto.
            </p>
          </div>
        </div>

        {/* Auth Card with Sliding Tabs */}
        <Card className="w-full bg-gradient-to-br from-[#1C1F24] via-[#2B3139] to-[#3B3F45] border border-[rgba(255,255,255,0.05)] shadow-2xl backdrop-blur-sm rounded-2xl overflow-hidden animate-slide-up">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid grid-cols-2 w-full bg-[#181A20] p-1 rounded-xl">
              <TabsTrigger
                value="signin"
                className="rounded-lg text-[#A1A1A1] data-[state=active]:bg-[#FCD535] data-[state=active]:text-[#181A20] hover:text-white transition-all duration-300"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="rounded-lg text-[#A1A1A1] data-[state=active]:bg-[#FCD535] data-[state=active]:text-[#181A20] hover:text-white transition-all duration-300"
              >
                Create Account
              </TabsTrigger>
            </TabsList>

            {/* Sign In */}
            <TabsContent value="signin" className="p-6 animate-slide-left">
              <CardHeader className="text-center space-y-1">
                <CardTitle className="text-2xl font-bold text-white">Welcome Back</CardTitle>
                <CardDescription className="text-[#A1A1A1]">Sign in to access your trading account</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-[#A1A1A1]">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="bg-[#2B3139] border-[#2B3139] text-white placeholder:text-[#A1A1A1] focus:border-[#FCD535] focus:ring-[#FCD535] transition-all duration-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-[#A1A1A1]">Password</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        className="pr-10 bg-[#2B3139] border-[#2B3139] text-white placeholder:text-[#A1A1A1] focus:border-[#FCD535] focus:ring-[#FCD535] transition-all duration-300"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 text-[#A1A1A1] hover:text-[#FCD535] transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#FCD535] hover:bg-[#F0B90B] text-[#181A20] transition-all duration-300 font-medium shadow-md hover:shadow-[0_0_10px_rgba(252,213,53,0.4)]"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>

            {/* Sign Up */}
            <TabsContent value="signup" className="p-6 animate-slide-right">
              <CardHeader className="text-center space-y-1">
                <CardTitle className="text-2xl font-bold text-white">Create Your Account</CardTitle>
                <CardDescription className="text-[#A1A1A1]">Join our platform to start trading today</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first-name" className="text-[#A1A1A1]">First Name</Label>
                      <Input
                        id="first-name"
                        placeholder="Enter your first name"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                        className="bg-[#2B3139] border-[#2B3139] text-white placeholder:text-[#A1A1A1] focus:border-[#FCD535] focus:ring-[#FCD535] transition-all duration-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name" className="text-[#A1A1A1]">Last Name</Label>
                      <Input
                        id="last-name"
                        placeholder="Enter your last name"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                        className="bg-[#2B3139] border-[#2B3139] text-white placeholder:text-[#A1A1A1] focus:border-[#FCD535] focus:ring-[#FCD535] transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-[#A1A1A1]">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="bg-[#2B3139] border-[#2B3139] text-white placeholder:text-[#A1A1A1] focus:border-[#FCD535] focus:ring-[#FCD535] transition-all duration-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-[#A1A1A1]">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        className="pr-10 bg-[#2B3139] border-[#2B3139] text-white placeholder:text-[#A1A1A1] focus:border-[#FCD535] focus:ring-[#FCD535] transition-all duration-300"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 text-[#A1A1A1] hover:text-[#FCD535] transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-[#A1A1A1]">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Re-enter your password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                      className="bg-[#2B3139] border-[#2B3139] text-white placeholder:text-[#A1A1A1] focus:border-[#FCD535] focus:ring-[#FCD535] transition-all duration-300"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#FCD535] hover:bg-[#F0B90B] text-[#181A20] transition-all duration-300 font-medium shadow-md hover:shadow-[0_0_10px_rgba(252,213,53,0.4)]"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
