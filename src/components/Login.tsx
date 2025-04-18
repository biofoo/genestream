// src/components/Login.tsx
import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Login: React.FC = () => {
  const { loginWithRedirect, isAuthenticated } = useAuth0();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      const returnTo = location.state?.returnTo || '/console';
      navigate(returnTo);
    } else {
      const appState = { returnTo: location.state?.returnTo || '/console' };
      loginWithRedirect({ appState });
    }
  }, [isAuthenticated, loginWithRedirect, navigate, location]);

  return <div>Logging in...</div>;
};

export default Login;