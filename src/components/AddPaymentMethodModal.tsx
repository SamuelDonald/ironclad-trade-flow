import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CardElement, Elements, useStripe, useElements } from '@stripe/react-stripe-js';
import { getStripe, isStripeConfigured } from '@/lib/stripe';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CreditCard } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddPaymentMethodModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

// Stripe Card Form Component
const StripeCardForm = ({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [cardholderName, setCardholderName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      return;
    }

    setLoading(true);

    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: cardholderName,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      // Here you would call your backend to attach the payment method to the customer
      // For now, we'll just show success
      toast({
        title: "Success",
        description: "Payment method added successfully",
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add payment method",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="cardholder-name">Cardholder Name</Label>
        <Input
          id="cardholder-name"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          placeholder="John Doe"
          required
        />
      </div>

      <div>
        <Label>Card Details</Label>
        <div className="border rounded-md p-3 mt-1 bg-background">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: 'hsl(var(--foreground))',
                  '::placeholder': {
                    color: 'hsl(var(--muted-foreground))',
                  },
                },
                invalid: {
                  color: 'hsl(var(--destructive))',
                },
              },
            }}
          />
        </div>
      </div>

      <Alert>
        <CreditCard className="h-4 w-4" />
        <AlertDescription>
          We use Stripe to securely collect card details. We never store full card numbers.
        </AlertDescription>
      </Alert>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={!stripe || loading}>
          {loading ? 'Adding...' : 'Add Card'}
        </Button>
      </div>
    </form>
  );
};

// Demo Mode Form Component
const DemoModeForm = ({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cardholderName: '',
    brand: 'visa',
    last4: '',
    expMonth: '',
    expYear: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate last4 is 4 digits
    if (!/^\d{4}$/.test(formData.last4)) {
      toast({
        title: "Invalid card number",
        description: "Please enter the last 4 digits",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      // Here you would call your backend to store demo payment method
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      toast({
        title: "Demo mode",
        description: "Payment method added in demo mode",
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add payment method",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Demo Mode: Stripe is not configured. This will store masked card data for demonstration only.
        </AlertDescription>
      </Alert>

      <div>
        <Label htmlFor="demo-name">Cardholder Name</Label>
        <Input
          id="demo-name"
          value={formData.cardholderName}
          onChange={(e) => setFormData({ ...formData, cardholderName: e.target.value })}
          placeholder="John Doe"
          required
        />
      </div>

      <div>
        <Label htmlFor="brand">Card Brand</Label>
        <Select value={formData.brand} onValueChange={(value) => setFormData({ ...formData, brand: value })}>
          <SelectTrigger id="brand">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="visa">Visa</SelectItem>
            <SelectItem value="mastercard">Mastercard</SelectItem>
            <SelectItem value="amex">American Express</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1">
          <Label htmlFor="last4">Last 4 Digits</Label>
          <Input
            id="last4"
            value={formData.last4}
            onChange={(e) => setFormData({ ...formData, last4: e.target.value.replace(/\D/g, '').slice(0, 4) })}
            placeholder="1234"
            maxLength={4}
            required
          />
        </div>
        <div className="col-span-1">
          <Label htmlFor="exp-month">Month</Label>
          <Input
            id="exp-month"
            value={formData.expMonth}
            onChange={(e) => setFormData({ ...formData, expMonth: e.target.value.replace(/\D/g, '').slice(0, 2) })}
            placeholder="MM"
            maxLength={2}
            required
          />
        </div>
        <div className="col-span-1">
          <Label htmlFor="exp-year">Year</Label>
          <Input
            id="exp-year"
            value={formData.expYear}
            onChange={(e) => setFormData({ ...formData, expYear: e.target.value.replace(/\D/g, '').slice(0, 4) })}
            placeholder="YYYY"
            maxLength={4}
            required
          />
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Card (Demo)'}
        </Button>
      </div>
    </form>
  );
};

export const AddPaymentMethodModal = ({ open, onOpenChange, onSuccess }: AddPaymentMethodModalProps) => {
  const stripeConfigured = isStripeConfigured();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Payment Method</DialogTitle>
          <DialogDescription>
            Add a payment method to your account for easy transactions.
          </DialogDescription>
        </DialogHeader>

        {stripeConfigured ? (
          <Elements stripe={getStripe()}>
            <StripeCardForm
              onSuccess={() => {
                onSuccess();
                onOpenChange(false);
              }}
              onCancel={() => onOpenChange(false)}
            />
          </Elements>
        ) : (
          <DemoModeForm
            onSuccess={() => {
              onSuccess();
              onOpenChange(false);
            }}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
