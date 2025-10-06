import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useBalanceUpdate } from '@/hooks/useBalanceUpdate';

interface BalanceAdjustmentFormProps {
  userId: string;
  currentBalances: {
    cash_balance: number;
    invested_amount: number;
    free_margin: number;
  };
  onSuccess: () => void;
}

export const BalanceAdjustmentForm: React.FC<BalanceAdjustmentFormProps> = ({
  userId,
  currentBalances,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'delta' | 'absolute'>('delta');
  const [cashBalance, setCashBalance] = useState('');
  const [investedAmount, setInvestedAmount] = useState('');
  const [freeMargin, setFreeMargin] = useState('');
  const [reason, setReason] = useState('');

  const { updateBalance, loading } = useBalanceUpdate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updates: any = {};
    if (cashBalance) updates.cash_balance = parseFloat(cashBalance);
    if (investedAmount) updates.invested_amount = parseFloat(investedAmount);
    if (freeMargin) updates.free_margin = parseFloat(freeMargin);

    if (Object.keys(updates).length === 0) return;

    try {
      await updateBalance(userId, updates, mode, reason);
      setCashBalance('');
      setInvestedAmount('');
      setFreeMargin('');
      setReason('');
      onSuccess();
    } catch (err) {
      // Error handled in hook
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adjust User Balances</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Current Cash</p>
              <p className="font-semibold">${currentBalances.cash_balance.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Invested</p>
              <p className="font-semibold">${currentBalances.invested_amount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Margin</p>
              <p className="font-semibold">${currentBalances.free_margin.toFixed(2)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Update Mode</Label>
            <RadioGroup value={mode} onValueChange={(v) => setMode(v as 'delta' | 'absolute')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="delta" id="delta" />
                <Label htmlFor="delta" className="font-normal">
                  Delta (add/subtract from current)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="absolute" id="absolute" />
                <Label htmlFor="absolute" className="font-normal">
                  Absolute (set exact value)
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cash">Cash Balance</Label>
              <Input
                id="cash"
                type="number"
                step="0.01"
                value={cashBalance}
                onChange={(e) => setCashBalance(e.target.value)}
                placeholder={mode === 'delta' ? '+/- amount' : 'New amount'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invested">Invested Amount</Label>
              <Input
                id="invested"
                type="number"
                step="0.01"
                value={investedAmount}
                onChange={(e) => setInvestedAmount(e.target.value)}
                placeholder={mode === 'delta' ? '+/- amount' : 'New amount'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="margin">Free Margin</Label>
              <Input
                id="margin"
                type="number"
                step="0.01"
                value={freeMargin}
                onChange={(e) => setFreeMargin(e.target.value)}
                placeholder={mode === 'delta' ? '+/- amount' : 'New amount'}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason (required for audit)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Manual deposit adjustment, Bonus credit, etc."
              required
            />
          </div>

          <Button type="submit" disabled={loading || !reason.trim()}>
            {loading ? 'Updating...' : 'Update Balances'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
