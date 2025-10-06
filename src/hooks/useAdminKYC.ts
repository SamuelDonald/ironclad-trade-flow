import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface KYCSubmission {
  id: string;
  email: string;
  full_name: string;
  kyc_status: string;
  kyc_submitted_at: string;
  kyc_documents: any[];
  phone: string | null;
  address: string | null;
}

export const useAdminKYC = (status: string = 'pending', page: number = 1) => {
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKYC = async () => {
    try {
      setLoading(true);
      setError(null);

      // Refresh session if needed
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        const { data: refreshData } = await supabase.auth.refreshSession();
        if (!refreshData.session) {
          throw new Error('Session expired. Please log in again.');
        }
      }

      const params = new URLSearchParams({
        status,
        page: page.toString(),
      });

      const { data, error: fetchError } = await supabase.functions.invoke(
        `admin-operations/kyc?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (fetchError) {
        console.error('Edge function error details:', {
          message: fetchError.message,
          status: fetchError.status,
          context: fetchError.context
        });
        throw fetchError;
      }

      if (!data) {
        throw new Error('No data returned from edge function');
      }
      setSubmissions(data.submissions || []);
      setTotalCount(data.totalCount || 0);
    } catch (err: any) {
      console.error('Error fetching KYC submissions:', err);
      setError(err.message || 'Failed to load KYC submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKYC();
  }, [status, page]);

  return { submissions, totalCount, loading, error, refetch: fetchKYC };
};
