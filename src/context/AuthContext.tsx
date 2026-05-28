"use client";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType {
  session: { token: string; role: string } | null;
  login: (token: string, role: string) => void;
  logOut: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [session, setSession] = useLocalStorageState<{
    token: string;
    role: string;
  } | null>(null, "auth_session");

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const login = useCallback(
    (token: string, role: string): void => {
      setSession({ token, role });
    },
    [setSession],
  );

  const logOut = (): void => {
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ session, login, logOut, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("AuthContext was used outside of AuthProvider");
  }

  return context;
}

export { AuthProvider, useAuth };
