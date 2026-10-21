import React, { createContext, useState, useContext, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  const loadProfile = async (authUser) => {
    if (!authUser) {
      setUser(null);
      setIsAuthenticated(false);
      return;
    }
    let profile = null;
    const byAuth = await supabase.from("users").select("*").eq("auth_id", authUser.id).maybeSingle();
    profile = byAuth.data;
    if (!profile && authUser.email) {
      const byEmail = await supabase.from("users").select("*").eq("email", authUser.email).maybeSingle();
      profile = byEmail.data;
    }
    setUser(profile || { id: authUser.id, email: authUser.email, role: authUser.user_metadata?.app_role || "user", auth_id: authUser.id });
    setIsAuthenticated(true);
  };

  useEffect(() => {
    let active = true;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!active) return;
      await loadProfile(session?.user || null);
      setIsLoadingAuth(false);
      setAuthChecked(true);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      loadProfile(session?.user || null);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = (shouldRedirect = true) => {
    supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
    if (shouldRedirect) window.location.href = "/login";
  };

  const navigateToLogin = () => {
    window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
  };

  const checkUserAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    await loadProfile(session?.user || null);
  };

  const checkAppState = async () => {};

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        isLoadingPublicSettings: false,
        authError: null,
        appPublicSettings: null,
        authChecked,
        logout,
        navigateToLogin,
        checkUserAuth,
        checkAppState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
