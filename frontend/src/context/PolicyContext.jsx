import { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../services/api';

const PolicyContext = createContext(null);

export const PolicyProvider = ({ children }) => {
  const [policy, setPolicy] = useState(null);
  const [plans,  setPlans]  = useState({});
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    // Plans are public — always fetch
    api.get('/plans').then((r) => setPlans(r.data)).catch(() => {});

    // Active policy requires auth
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/policy/active')
        .then((r) => { if (r.data) setPolicy(r.data); })
        .catch(() => {});
    }
  }, []);

  const selectPlan = async (planType) => {
    const res = await api.post('/policy/select', { planType });
    setPolicy(res.data);
    return res.data;
  };

  return (
    <PolicyContext.Provider value={{ policy, plans, selectPlan, setPolicy }}>
      {children}
    </PolicyContext.Provider>
  );
};

export const usePolicy = () => useContext(PolicyContext);
