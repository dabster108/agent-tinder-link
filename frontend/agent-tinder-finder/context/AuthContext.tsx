import React from "react";

type AuthContextValue = {
  isAuthenticated: boolean;
  signIn: (username: string, password: string) => boolean;
  signOut: () => void;
};

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin@123";

const AuthContext = React.createContext<AuthContextValue | undefined>(
  undefined,
);

export const DefaultAdminCredentials = {
  username: ADMIN_USERNAME,
  password: ADMIN_PASSWORD,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  const signIn = React.useCallback((username: string, password: string) => {
    const isValid =
      username.trim().toLowerCase() === ADMIN_USERNAME &&
      password === ADMIN_PASSWORD;

    setIsAuthenticated(isValid);
    return isValid;
  }, []);

  const signOut = React.useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  const value = React.useMemo(
    () => ({ isAuthenticated, signIn, signOut }),
    [isAuthenticated, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
