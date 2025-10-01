import React, { useState, FormEvent } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';

interface AddPaymentMethodModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

// Card brand detection helper
const detectCardBrand = (cardNumber: string): string => {
  const cleaned = cardNumber.replace(/\s/g, '');
  if (/^4/.test(cleaned)) return 'Visa';
  if (/^5[1-5]/.test(cleaned)) return 'Mastercard';
  if (/^3[47]/.test(cleaned)) return 'American Express';
  if (/^6(?:011|5)/.test(cleaned)) return 'Discover';
  return 'Card';
};

// Format card number with spaces
const formatCardNumber = (value: string): string => {
  const cleaned = value.replace(/\s/g, '');
  const groups = cleaned.match(/.{1,4}/g);
  return groups ? groups.join(' ') : cleaned;
};

// Card Form Component
const CardForm: React.FC<{ onSuccess: () => void; onCancel: () => void }> = ({ onSuccess, onCancel }) => {
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [setAsDefault, setSetAsDefault] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { addPaymentMethod, setDefaultPaymentMethod } = usePaymentMethods();

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '');
    if (/^\d*$/.test(value) && value.length <= 16) {
      setCardNumber(formatCardNumber(value));
    }
  };

  const handleExpMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 2) {
      setExpMonth(value);
    }
  };

  const handleExpYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 4) {
      setExpYear(value);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 4) {
      setCvv(value);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    const cleanedCardNumber = cardNumber.replace(/\s/g, '');
    
    // Validation
    if (!cardholderName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter cardholder name.",
        variant: "destructive",
      });
      return;
    }

    if (cleanedCardNumber.length !== 16) {
      toast({
        title: "Invalid Card Number",
        description: "Card number must be exactly 16 digits.",
        variant: "destructive",
      });
      return;
    }

    const monthNum = parseInt(expMonth);
    if (!expMonth || monthNum < 1 || monthNum > 12) {
      toast({
        title: "Invalid Expiry",
        description: "Please enter a valid expiry month (01-12).",
        variant: "destructive",
      });
      return;
    }

    const yearNum = parseInt(expYear);
    const currentYear = new Date().getFullYear();
    if (!expYear || yearNum < currentYear || expYear.length !== 4) {
      toast({
        title: "Invalid Expiry",
        description: "Please enter a valid 4-digit expiry year.",
        variant: "destructive",
      });
      return;
    }

    if (cvv.length < 3) {
      toast({
        title: "Invalid CVV",
        description: "CVV must be 3-4 digits.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const brand = detectCardBrand(cleanedCardNumber);
      const last4 = cleanedCardNumber.slice(-4);
      
      // WARNING: Storing full card numbers is a PCI-DSS security risk
      // This is implemented per user request but should use tokenization in production
      const newPaymentMethod = await addPaymentMethod({
        stripe_payment_method_id: `pm_${Date.now()}`, // Generate unique ID
        brand,
        last4,
        exp_month: monthNum,
        exp_year: yearNum,
        cardholder_name: cardholderName,
        card_number: cleanedCardNumber, // Full card number stored
      });

      if (setAsDefault && newPaymentMethod) {
        await setDefaultPaymentMethod(newPaymentMethod.id);
      }

      onSuccess();
    } catch (error) {
      console.error('Error adding payment method:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cardholderName">Cardholder Name</Label>
        <Input
          id="cardholderName"
          placeholder="John Doe"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cardNumber">Card Number</Label>
        <Input
          id="cardNumber"
          placeholder="1234 5678 9012 3456"
          value={cardNumber}
          onChange={handleCardNumberChange}
          maxLength={19}
          required
        />
        <p className="text-xs text-muted-foreground">
          Brand: {detectCardBrand(cardNumber)}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="expMonth">Exp Month</Label>
          <Input
            id="expMonth"
            placeholder="MM"
            value={expMonth}
            onChange={handleExpMonthChange}
            maxLength={2}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expYear">Exp Year</Label>
          <Input
            id="expYear"
            placeholder="YYYY"
            value={expYear}
            onChange={handleExpYearChange}
            maxLength={4}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cvv">CVV</Label>
          <Input
            id="cvv"
            placeholder="123"
            value={cvv}
            onChange={handleCvvChange}
            maxLength={4}
            required
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="setDefault"
          checked={setAsDefault}
          onCheckedChange={(checked) => setSetAsDefault(checked as boolean)}
        />
        <Label htmlFor="setDefault" className="text-sm font-normal cursor-pointer">
          Set as default payment method
        </Label>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Card'}
        </Button>
      </DialogFooter>
    </form>
  );
};

// Add Payment Method Modal Component
const AddPaymentMethodModal: React.FC<AddPaymentMethodModalProps> = ({ open, onOpenChange, onSuccess }) => {
  const handleSuccess = () => {
    onSuccess();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Payment Method</DialogTitle>
          <DialogDescription>
            Add a new payment method to your account.
          </DialogDescription>
        </DialogHeader>
        
        <CardForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </DialogContent>
    </Dialog>
  );
};

export default AddPaymentMethodModal;
