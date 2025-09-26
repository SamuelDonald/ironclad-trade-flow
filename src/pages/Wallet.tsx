import { useState, useEffect } from "react";
import { Wallet, CreditCard, ArrowDownLeft, ArrowUpRight, Copy, QrCode, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";

const WalletPage = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "overview";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showAddresses, setShowAddresses] = useState<{[key: string]: boolean}>({});
  const { toast } = useToast();

  const cryptoAddresses = {
    BTC: "bc1qzqmxyf6uxmtgce6jn6weefre4h8h6udm9dzu6a",
    SOL: "AXz6WH3MTERUNfmrTSFBCKganuPf1Jg4FJGMUk5Y5PKr",
    "USDT-ERC20": "0xb8a0BaC9FdF3ef67BDA63638310255508Db3a12A"
  };

  const walletOverview = {
    totalBalance: 75000,
    availableBalance: 50000,
    pendingDeposits: 2500,
    pendingWithdrawals: 1500,
  };

  const recentTransactions = [
    { type: "deposit", method: "Bank Transfer", amount: 5000, status: "completed", date: "2024-01-15", id: "TXN001" },
    { type: "withdrawal", method: "PayPal", amount: 1500, status: "pending", date: "2024-01-14", id: "TXN002" },
    { type: "deposit", method: "BTC", amount: 2500, status: "completed", date: "2024-01-13", id: "TXN003" },
  ];

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: `${label} address copied successfully`,
    });
  };

  const toggleAddressVisibility = (crypto: string) => {
    setShowAddresses(prev => ({ ...prev, [crypto]: !prev[crypto] }));
  };

  const handleDeposit = (method: string) => {
    toast({
      title: "Deposit Initiated",
      description: `${method} deposit process started`,
    });
  };

  const handleWithdrawal = () => {
    toast({
      title: "Withdrawal Requested",
      description: "Your withdrawal request has been submitted for processing",
    });
  };

  return (
    <div className="container max-w-7xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Wallet</h1>
        <Button variant="outline" size="sm">
          <Wallet className="w-4 h-4 mr-2" />
          Transaction History
        </Button>
      </div>

      {/* Wallet Overview */}
      <Card className="gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Wallet Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold">${walletOverview.totalBalance.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Balance</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold text-profit">${walletOverview.availableBalance.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Available</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold text-warning">${walletOverview.pendingDeposits.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Pending Deposits</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold text-loss">${walletOverview.pendingWithdrawals.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Pending Withdrawals</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deposits">Deposits</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest wallet activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${transaction.type === 'deposit' ? 'bg-profit/10' : 'bg-loss/10'}`}>
                        {transaction.type === 'deposit' ? (
                          <ArrowDownLeft className={`w-4 h-4 ${transaction.type === 'deposit' ? 'text-profit' : 'text-loss'}`} />
                        ) : (
                          <ArrowUpRight className={`w-4 h-4 ${transaction.type === 'deposit' ? 'text-profit' : 'text-loss'}`} />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold capitalize">{transaction.type}</p>
                        <p className="text-sm text-muted-foreground">{transaction.method}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${transaction.type === 'deposit' ? 'text-profit' : 'text-loss'}`}>
                        {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                          {transaction.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{transaction.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deposits" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bank Transfer */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Bank Transfer
                </CardTitle>
                <CardDescription>Deposit via bank transfer or PayPal</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (USD)</Label>
                  <Input id="amount" type="number" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment-method">Payment Method</Label>
                  <select className="w-full p-2 border rounded-md">
                    <option>Bank Transfer</option>
                    <option>PayPal</option>
                  </select>
                </div>
                <Button className="w-full" onClick={() => handleDeposit("Bank Transfer")}>
                  <ArrowDownLeft className="w-4 h-4 mr-2" />
                  Deposit Funds
                </Button>
              </CardContent>
            </Card>

            {/* Crypto Deposits */}
            <Card>
              <CardHeader>
                <CardTitle>Crypto Deposits</CardTitle>
                <CardDescription>Deposit supported cryptocurrencies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(cryptoAddresses).map(([crypto, address]) => (
                  <div key={crypto} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{crypto}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleAddressVisibility(crypto)}
                      >
                        {showAddresses[crypto] ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    
                    {showAddresses[crypto] && (
                      <>
                        <div className="space-y-2">
                          <Label>Deposit Address</Label>
                          <div className="flex gap-2">
                            <Input 
                              value={address} 
                              readOnly 
                              className="font-mono text-xs"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(address, crypto)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full">
                          <QrCode className="w-4 h-4 mr-2" />
                          Show QR Code
                        </Button>
                      </>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="withdrawals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5" />
                Withdraw Funds
              </CardTitle>
              <CardDescription>Withdraw your funds to external accounts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="withdraw-amount">Amount (USD)</Label>
                  <Input id="withdraw-amount" type="number" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="withdraw-method">Withdrawal Method</Label>
                  <select className="w-full p-2 border rounded-md">
                    <option>Bank Transfer</option>
                    <option>PayPal</option>
                    <option>Wire Transfer</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="account-details">Account Details</Label>
                <Input id="account-details" placeholder="Enter account number or email" />
              </div>
              
              <div className="bg-accent/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Withdrawal Information</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Minimum withdrawal: $100</li>
                  <li>• Processing time: 1-3 business days</li>
                  <li>• Withdrawal fee: $5 or 0.5% (whichever is higher)</li>
                </ul>
              </div>
              
              <Button className="w-full" onClick={handleWithdrawal}>
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Request Withdrawal
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WalletPage;