import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAdminKYC } from '@/hooks/useAdminKYC';
import { Skeleton } from '@/components/ui/skeleton';
import { KYCReviewModal } from './KYCReviewModal';
import { formatDistanceToNow } from 'date-fns';

export const KYCPanel: React.FC = () => {
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const { submissions, loading, refetch } = useAdminKYC(status);

  return (
    <div className="space-y-4 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle>KYC Review</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={status} onValueChange={(v) => setStatus(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>

            <TabsContent value={status} className="mt-4 space-y-2">
              {loading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : submissions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No {status} KYC submissions
                </p>
              ) : (
                submissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => setSelectedSubmission(submission)}
                  >
                    <div className="flex-1">
                      <p className="font-medium">{submission.full_name || 'No name'}</p>
                      <p className="text-sm text-muted-foreground">{submission.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Submitted {formatDistanceToNow(new Date(submission.kyc_submitted_at), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Documents</p>
                        <p className="font-semibold">{submission.kyc_documents?.length || 0}</p>
                      </div>
                      <Button size="sm">Review</Button>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {selectedSubmission && (
        <KYCReviewModal
          submission={selectedSubmission}
          open={!!selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          onSuccess={() => {
            setSelectedSubmission(null);
            refetch();
          }}
        />
      )}
    </div>
  );
};
