/**
 * Authentication Guard
 * 
 * Redirects to onboarding if user is not logged in.
 * Use in protected pages/routes.
 */

import { useEffect } from 'react';
import { useNavigate } from './router';
import { getCurrentUser } from './SovereignAuth';

export function useAuthGuard() {
  const navigate = useNavigate();
  
  useEffect(() => {
    getCurrentUser().then(user => {
      if (!user) {
        navigate('/onboarding');
      }
    });
  }, [navigate]);
}
