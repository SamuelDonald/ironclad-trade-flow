import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, FileText } from 'lucide-react';

interface KYCReviewModalProps {
  submission: any;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const KYCReviewModal: React.FC<KYCReviewModalProps> = ({
  submission,
  open,
  onClose,
  onSuccess,
}) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleApprove = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase.functions.invoke('admin-operations', {
        body: {
          action: 'approve-kyc',
          userId: submission.id,
        },
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'KYC submission approved',
      });
      onSuccess();
    } catch (err: any) {
      console.error('Error approving KYC:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to approve KYC',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a rejection reason',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase.functions.invoke('admin-operations', {
        body: {
          action: 'reject-kyc',
          userId: submission.id,
          reason: rejectionReason,
        },
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'KYC submission rejected',
      });
      onSuccess();
    } catch (err: any) {
      console.error('Error rejecting KYC:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to reject KYC',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>KYC Review - {submission.full_name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{submission.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{submission.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-medium">{submission.address || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge>{submission.kyc_status}</Badge>
            </div>
          </div>

          <div>
            <Label className="text-base font-semibold mb-3 block">
              <FileText className="inline h-4 w-4 mr-2" />
              Submitted Documents ({submission.kyc_documents?.length || 0})
            </Label>
            {submission.kyc_documents && submission.kyc_documents.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {submission.kyc_documents.map((doc: any, index: number) => (
                  <div key={index} className="border rounded-lg p-3 space-y-2">
                    <p className="text-sm font-medium">{doc.type || 'Document'}</p>
                    {doc.url && doc.url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                      <img
                        src={doc.url}
                        alt={doc.type}
                        className="w-full h-48 object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-48 bg-muted rounded flex items-center justify-center">
                        <FileText className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => window.open(doc.url, '_blank')}
                    >
                      View Document
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No documents uploaded</p>
            )}
          </div>

          {submission.kyc_status === 'pending' && (
            <div className="space-y-3">
              <Label htmlFor="rejection-reason">Rejection Reason (optional if rejecting)</Label>
              <Textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Provide a clear reason for rejection..."
                rows={3}
              />
            </div>
          )}
        </div>

        {submission.kyc_status === 'pending' && (
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={loading}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={handleApprove}
              disabled={loading}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
