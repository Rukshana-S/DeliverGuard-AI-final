import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function ClaimApproval() {
  const navigate  = useNavigate();
  const { state } = useLocation();

  useEffect(() => {
    navigate('/claim/success', { replace: true, state });
  }, [navigate, state]);

  return (
    <div className="flex justify-center py-24">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
