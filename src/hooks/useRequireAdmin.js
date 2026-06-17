import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './useUser';

export function useRequireAdmin() {
  const { user, profile, loading } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth', { replace: true });
      } else if (profile?.role !== 'admin') {
        navigate('/', { replace: true });
      }
    }
  }, [user, profile, loading, navigate]);

  return { user, profile, loading };
}
