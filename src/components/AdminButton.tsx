import React from 'react';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';

export const AdminButton: React.FC = () => {
  const { isAdmin, loading } = useAdmin();
  const navigate = useNavigate();

  if (loading || !isAdmin) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => navigate('/admin')}
      className="flex items-center gap-2 text-xs"
    >
      <Shield className="h-4 w-4" />
      Admin
    </Button>
  );
};