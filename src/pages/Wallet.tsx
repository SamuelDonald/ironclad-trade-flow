import { useState } from "react";
import { Wallet, CreditCard, ArrowDownLeft, ArrowUpRight, Copy, QrCode, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const WalletPage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddresses, setShowAddresses] = useState<{[key: string]: boolean}>({});
  const [selectedQRCode, setSelectedQRCode] = useState<{crypto: string, imageUrl: string} | null>(null);
  const { toast } = useToast();

  // ✅ Updated balances to match Figma
  const walletOverview = {
    cashBalance: 3000,
    investedAmount: 5000,
    freeMargin: 1200,
  };

  // ✅ Only 3 cryptos shown in Figma with QR codes
  const cryptoAddresses = {
    BTC: {
      address: "bc1qzqmxyf6uxmtgce6jn6weefre4h8h6udm9dzu6a",
      qrCode: "https://jgedidtpqfashojqagbd.supabase.co/storage/v1/object/sign/QR%20codes/BTC.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hNjhjYTQwYS1hNGVmLTQ5YmQtOWM4Ny00ODBkZDk0MDhiNjUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJRUiBjb2Rlcy9CVEMuanBnIiwiaWF0IjoxNzU4ODg5OTU2LCJleHAiOjE3OTA0MjU5NTZ9.jo7XY_5VlWlanNf4hQv09KI1jEE3tMC0py6BBKxZWK0"
    },
    SOL: {
      address: "AXz6WH3MTERUNfmrTSFBCKganuPf1Jg4FJGMUk5Y5PKr",
      qrCode: "https://jgedidtpqfashojqagbd.supabase.co/storage/v1/object/sign/QR%20codes/SOL.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hNjhjYTQwYS1hNGVmLTQ5YmQtOWM4Ny00ODBkZDk0MDhiNjUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJRUiBjb2Rlcy9TT0wuanBnIiwiaWF0IjoxNzU4ODg5OTczLCJleHAiOjE3OTA0MjU5NzN9.c8qXJriUQy1fi8dZeAOLb1EuZYByct7xLadWu9oTQvo"
    },
    "USDT-ERC20": {
      address: "0xb8a0BaC9FdF3ef67BDA63638310255508Db3a12A",
      qrCode: "https://jgedidtpqfashojqagbd.supabase.co/storage/v1/object/sign/QR%20codes/USDT.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hNjhjYTQwYS1hNGVmLTQ5YmQtOWM4Ny00ODBkZDk0MDhiNjUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJRUiBjb2Rlcy9VU0RULmpwZyIsImlhdCI6MTc1ODg4OTk4NywiZXhwIjoxNzkwNDI1OTg3fQ.dAalhHJF1Cd8Y31TNX3yLXLgWLjOlJe4d_W2_S3oyM8"
    },
  };

  const recentTransactions = [
    { type: "deposit", method: "Bank Transfer", amount: 5000, status: "completed", date: "2024-01-15", id: "TXN001" },
    { type: "withdrawal", method: "PayPal", amount: 1500, status: "pending", date: "2024-01-14", id: "TXN002" },
  ];

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${label} address copied successfully`,
    });
  };

  const openQRCode = (crypto: string, qrCode: string) => {
    setSelectedQRCode({ crypto, imageUrl: qrCode });
  };

  return (
    <>
    <div className="container max-w-6xl mx-auto p-6 pb-20 space-y-8">
      {/* ✅ Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-indigo-700">Wallet</h1>
        <Button variant="outline" size="sm" className="rounded-full px-4">
          <Wallet className="w-4 h-4 mr-2" />
          History
        </Button>
      </div>

      {/* ✅ Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-tr from-purple-500 to-indigo-600 text-white shadow-lg rounded-2xl">
          <CardHeader><CardTitle>Cash Balance</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">${walletOverview.cashBalance.toLocaleString()}</p></CardContent>
        </Card>
        <Card className="bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-lg rounded-2xl">
          <CardHeader><CardTitle>Invested</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">${walletOverview.investedAmount.toLocaleString()}</p></CardContent>
        </Card>
        <Card className="bg-gradient-to-tr from-purple-400 to-indigo-500 text-white shadow-lg rounded-2xl">
          <CardHeader><CardTitle>Free Margin</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">${walletOverview.freeMargin.toLocaleString()}</p></CardContent>
        </Card>
      </div>

      {/* ✅ Tabs (modern Figma-style) */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-center bg-muted rounded-full p-1">
          <TabsTrigger value="overview" className="rounded-full px-6">Overview</TabsTrigger>
          <TabsTrigger value="deposits" className="rounded-full px-6">Deposits</TabsTrigger>
          <TabsTrigger value="withdrawals" className="rounded-full px-6">Withdrawals</TabsTrigger>
        </TabsList>

        {/* ✅ Transactions */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest activity</CardDescription>
            </CardHeader>
            <CardContent className="divide-y">
              {recentTransactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-semibold capitalize">{t.type}</p>
                    <p className="text-sm text-muted-foreground">{t.method}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${t.type === "deposit" ? "text-green-600" : "text-red-600"}`}>
                      {t.type === "deposit" ? "+" : "-"}${t.amount}
                    </p>
                    <Badge>{t.status}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ✅ Deposits */}
        <TabsContent value="deposits" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bank/PayPal */}
          <Card>
            <CardHeader>
              <CardTitle>Card / PayPal</CardTitle>
              <CardDescription>Secure payment via card or PayPal</CardDescription>
            </CardHeader>
            <CardContent>
              <Label>Amount</Label>
              <Input type="number" placeholder="0.00" className="mb-4" />
              <Button 
                className="w-full"
                onClick={() => window.open("https://www.paypal.com/ncp/payment/8SSPEXZ764KSS", "_blank")}
              >
                Pay with PayPal
              </Button>
            </CardContent>
          </Card>

          {/* Crypto */}
          <Card>
            <CardHeader>
              <CardTitle>Crypto Deposits</CardTitle>
              <CardDescription>BTC, SOL, USDT</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(cryptoAddresses).map(([crypto, data]) => (
                <div 
                  key={crypto} 
                  className="rounded-xl border p-4 shadow-sm bg-white cursor-pointer hover:border-indigo-300 transition-colors"
                  onClick={() => openQRCode(crypto, data.qrCode)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{crypto}</h4>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAddresses(p => ({...p, [crypto]: !p[crypto]}));
                      }}
                    >
                      {showAddresses[crypto] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  {showAddresses[crypto] && (
                    <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                      <Input value={data.address} readOnly className="font-mono text-xs" />
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => copyToClipboard(data.address, crypto)}>
                          <Copy className="w-4 h-4" /> Copy
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openQRCode(crypto, data.qrCode)}>
                          <QrCode className="w-4 h-4" /> QR Code
                        </Button>
                      </div>
                    </div>
                  )}
                  {!showAddresses[crypto] && (
                    <p className="text-sm text-muted-foreground">Tap to view QR code or show address</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ✅ Withdrawals */}
        <TabsContent value="withdrawals">
          <Card>
            <CardHeader>
              <CardTitle>Withdraw Funds</CardTitle>
              <CardDescription>Bank, PayPal, Wire</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Label>Amount</Label>
              <Input type="number" placeholder="0.00" />
              <Label className="mt-4">Account Details</Label>
              <Input placeholder="Enter account or email" />
              <Button className="w-full mt-4">Request Withdrawal</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>

    {/* QR Code Modal */}
    <Dialog open={!!selectedQRCode} onOpenChange={() => setSelectedQRCode(null)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">{selectedQRCode?.crypto} Deposit Address</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4">
          {selectedQRCode && (
            <img 
              src={selectedQRCode.imageUrl} 
              alt={`${selectedQRCode.crypto} QR Code`}
              className="w-64 h-64 object-contain border rounded-lg"
            />
          )}
          <p className="text-sm text-muted-foreground text-center">
            Scan this QR code to send {selectedQRCode?.crypto} to your wallet
          </p>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default WalletPage;
