import { useState } from 'react';

export function useAuth() {
  const [user, setUser] = useState(null);

  const loginUser = (username, password) => {
    // TODO: Implementar lógica de inicio de sesión real
    setUser({ username, role: 'Master' });
  };

  const logoutUser = () => {
    setUser(null);
  };

  return { user, loginUser, logoutUser };
}
