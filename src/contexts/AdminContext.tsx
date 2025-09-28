import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminContextType {
  isAdmin: boolean;
  adminRole: string | null;
  adminId: string | null;
  loading: boolean;
  checkAdminStatus: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRole, setAdminRole] = useState<string | null>(null);
  const [adminId, setAdminId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAdminStatus = async () => {
    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsAdmin(false);
        setAdminRole(null);
        setAdminId(null);
        return;
      }

      // Call the admin-check edge function
      const { data, error } = await supabase.functions.invoke('admin-check', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        setAdminRole(null);
        setAdminId(null);
        return;
      }

      setIsAdmin(data?.isAdmin || false);
      setAdminRole(data?.role || null);
      setAdminId(data?.adminId || null);
    } catch (error) {
      console.error('Error in checkAdminStatus:', error);
      setIsAdmin(false);
      setAdminRole(null);
      setAdminId(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check admin status on mount
    checkAdminStatus();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        checkAdminStatus();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AdminContext.Provider value={{
      isAdmin,
      adminRole,
      adminId,
      loading,
      checkAdminStatus,
    }}>
      {children}
    </AdminContext.Provider>
  );
};