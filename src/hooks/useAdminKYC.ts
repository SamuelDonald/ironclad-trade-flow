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

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const params = new URLSearchParams({
        status,
        page: page.toString(),
      });

      const { data, error: fetchError } = await supabase.functions.invoke(
        `admin-operations/kyc?${params}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (fetchError) throw fetchError;
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
