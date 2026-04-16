import React from "react";

type AuthContextValue = {
  isAuthenticated: boolean;
  signIn: (username: string, password: string) => boolean;
  signOut: () => void;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(
  undefined,
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  const signIn = React.useCallback((username: string, password: string) => {
    const isValid = username.trim().length > 0 && password.trim().length > 0;

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
