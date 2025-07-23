// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { loginUser, registerUser } from '../services/authService'; // Import auth service functions
import useLocalStorage from '../hooks/useLocalStorage'; // Re-use your existing hook

// Create the AuthContext
export const AuthContext = createContext();

// Create a custom hook to use the AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};

// AuthProvider component to wrap your application
export const AuthProvider = ({ children }) => {
  // Use localStorage to persist user and token across sessions
  const [user, setUser] = useLocalStorage('currentUser', null);
  const [token, setToken] = useLocalStorage('authToken', null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Derived state for convenience
  const isLoggedIn = !!user && !!token;

  // Function to handle user login
  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await loginUser(email, password);
      // Assuming backend now returns { accessToken: "...", message: "...", userId: ..., userName: ... }
      if (response.accessToken) {
        setToken(response.accessToken);
        // MODIFIED: Store actual user ID and name from backend response
        setUser({
          email: email, // Email from input, or could be from JWT payload if decoded
          name: response.userName || email.split('@')[0], // Use userName from response, fallback to email part
          id: response.userId // Use the actual userId from the backend response
        });
        return { success: true };
      } else {
        setError(response.message || 'Login failed: No token received.');
        return { success: false, message: response.message || 'Login failed: No token received.' };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data || err.message || 'An unexpected error occurred during login.';
      setError(errorMessage);
      console.error("Login error:", err);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle user registration
  const register = async (name, email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await registerUser(name, email, password);
      // Assuming backend returns a success message
      if (response === "User registered success!") { // Match backend success message
        return { success: true, message: response };
      } else {
        setError(response || 'Registration failed.');
        return { success: false, message: response || 'Registration failed.' };
      }
    } catch (err) {
      const errorMessage = err.response?.data || err.message || 'An unexpected error occurred during registration.';
      setError(errorMessage);
      console.error("Registration error:", err);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle user logout
  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);
    // Optionally clear other app-specific states related to user data
    console.log("User logged out.");
  };

  // The value that will be supplied to any components consuming the context
  const authContextValue = {
    user,
    token,
    isLoggedIn,
    isLoading,
    error,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};
