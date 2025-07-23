// src/components/auth/AuthModal.jsx
import React, { useState, useEffect } from 'react';
import { X, LogIn, UserPlus } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input'; // Assuming you have an Input component
import Textarea from '../ui/Textarea'; // Re-using Textarea for general input if no Input.jsx

const AuthModal = ({ isOpen, onClose, onLoginSuccess, onRegisterSuccess, authContext }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState(null); // For form-specific errors

  const { login, register, isLoading, error: authContextError } = authContext;

  // Clear form and errors when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setLocalError(null);
    }
  }, [isOpen, isLoginMode]);

  // Watch for auth context errors
  useEffect(() => {
    if (authContextError) {
      setLocalError(authContextError);
    }
  }, [authContextError]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLocalError(null); // Clear previous local errors

    if (!email || !password) {
      setLocalError('Email and password are required.');
      return;
    }

    if (!isLoginMode && (!name || !confirmPassword)) {
      setLocalError('Name and confirm password are required for registration.');
      return;
    }

    if (!isLoginMode && password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    if (isLoginMode) {
      const result = await login(email, password);
      if (result.success) {
        onLoginSuccess();
        onClose(); // Close modal on successful login
      } else {
        setLocalError(result.message || 'Login failed.');
      }
    } else {
      const result = await register(name, email, password);
      if (result.success) {
        onRegisterSuccess();
        setIsLoginMode(true); // Switch to login mode after successful registration
        setLocalError('Registration successful! Please log in.');
      } else {
        setLocalError(result.message || 'Registration failed.');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[1000]">
      <div className="bg-gray-800 rounded-xl p-8 shadow-2xl w-full max-w-md border border-gray-700 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          title="Close"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          {isLoginMode ? 'Login to CogniWrite Pro' : 'Register for CogniWrite Pro'}
        </h2>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLoginMode && (
            <Input
              label="Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              required
            />
          )}
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            required
          />
          {!isLoginMode && (
            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="********"
              required
            />
          )}

          {localError && (
            <div className="bg-red-900 text-red-200 p-3 rounded-md text-sm">
              Error: {localError}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            icon={isLoginMode ? LogIn : UserPlus}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Processing...' : (isLoginMode ? 'Login' : 'Register')}
          </Button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          {isLoginMode ? "Don't have an account?" : "Already have an account?"}{' '}
          <button
            type="button"
            onClick={() => setIsLoginMode(!isLoginMode)}
            className="text-indigo-400 hover:underline focus:outline-none"
          >
            {isLoginMode ? 'Register here' : 'Login here'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
