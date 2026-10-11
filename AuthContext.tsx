interface User {
  name: string;
  role: string;
  email?: string;
}

export interface AuthContextProps {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user?: User;
  login: (user: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [isAdmin, setAdmin] = useState(false);
  const [user, setUser] = useState<User | undefined>(undefined);

  const login = (userInfo: User) => {
    console.log('Login', userInfo);
    setAuthenticated(true);
    setUser(userInfo);
    setAdmin(userInfo.role === 'admin' || userInfo.email?.toLowerCase().includes('admin'));
  };

  const logout = () => {
    setAuthenticated(false);
    setAdmin(false);
    setUser(undefined);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
