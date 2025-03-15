import { useSignIn, useSignUp, useClerk } from "@clerk/clerk-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ArrowRight, Mail } from "lucide-react";
import { useState } from "react";

const GoogleLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const MetaMaskLogo = () => (
  <svg viewBox="0 0 318.6 318.6" className="w-5 h-5">
    <path
      d="M274.1 35.5l-99.5 73.9L193 65.8z"
      fill="#E2761B"
      stroke="#E2761B"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M44.4 35.5l98.7 74.6-17.5-44.3zm193.9 171.3l-26.5 40.6 56.7 15.6 16.3-55.3zm-204.4.9L50.1 263l56.7-15.6-26.5-40.6z"
      fill="#E4761B"
      stroke="#E4761B"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M103.6 138.2l-15.8 23.9 56.3 2.5-2-60.5zm111.3 0l-39-34.8-1.3 61.2 56.2-2.5zM106.8 247.4l33.8-16.5-29.2-22.8zm71.1-16.5l33.9 16.5-4.7-39.3z"
      fill="#E4761B"
      stroke="#E4761B"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const AuthComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signIn, isLoading: isSignInLoading } = useSignIn();
  const { signUp, isLoading: isSignUpLoading } = useSignUp();
  const { openSignIn } = useClerk();
  const isSignUp = location.pathname === "/sign-up";
  const [error, setError] = useState("");

  const handleGoogleAuth = async () => {
    try {
      if (isSignUp) {
        await signUp?.authenticateWithRedirect({
          strategy: "oauth_google",
          redirectUrl: "/dashboard",
          redirectUrlComplete: "/dashboard"
        });
      } else {
        await signIn?.authenticateWithRedirect({
          strategy: "oauth_google",
          redirectUrl: "/dashboard",
          redirectUrlComplete: "/dashboard"
        });
      }
    } catch (err) {
      console.error("OAuth error:", err);
      setError("Failed to authenticate with Google");
    }
  };

  const handleMetaMaskAuth = async () => {
    try {
      if (typeof window.ethereum === "undefined") {
        setError("Please install MetaMask to continue");
        return;
      }

      const accounts = await window.ethereum.request({ 
        method: "eth_requestAccounts" 
      });

      if (accounts[0]) {
        // Use Clerk's Web3 sign-in
        if (isSignUp) {
          await signUp?.create({
            web3Wallet: accounts[0]
          });
        } else {
          await openSignIn({
            initialValues: {
              web3Wallet: accounts[0]
            }
          });
        }
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("MetaMask error:", err);
      setError("Failed to connect with MetaMask");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1120] via-[#0F172A] to-[#1E293B]">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQ4MCIgaGVpZ2h0PSI2NTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+ICAgIDxwYXRoIGQ9Ik03MzEuMjA3IDY0OS44MDJDOTM1LjQ4NCA2NDkuODAyIDExMDIuMzggNTA1LjQyNSAxMTAyLjM4IDMyOC4wMDFDMTEwMi4zOCAxNTAuNTc4IDkzNS40ODQgNi4yMDA2OCA3MzEuMjA3IDYuMjAwNjhDNTI2LjkzIDYuMjAwNjggMzYwLjAzNCAxNTAuNTc4IDM2MC4wMzQgMzI4LjAwMUMzNjAuMDM0IDUwNS40MjUgNTI2LjkzIDY0OS44MDIgNzMxLjIwNyA2NDkuODAyWiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIwLjEiLz4gICAgPHBhdGggZD0iTTQ5Mi4yMDcgNjQ5LjgwMkM2OTYuNDg0IDY0OS44MDIgODYzLjM4IDUwNS40MjUgODYzLjM4IDMyOC4wMDFDODYzLjM4IDE1MC41NzggNjk2LjQ4NCA2LjIwMDY4IDQ5Mi4yMDcgNi4yMDA2OEMyODcuOTMgNi4yMDA2OCAxMjEuMDM0IDE1MC41NzggMTIxLjAzNCAzMjguMDAxQzEyMS4wMzQgNTA1LjQyNSAyODcuOTMgNjQ5LjgwMiA0OTIuMjA3IDY0OS44MDJaIiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==')] bg-cover opacity-5" />

      <div className="relative min-h-screen flex">
        {/* Left Section - Branding */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:flex lg:w-1/2 xl:w-2/3 p-12 items-center justify-center bg-gradient-to-br from-blue-600/10 via-blue-800/10 to-purple-900/10 backdrop-blur-sm"
        >
          <div className="max-w-2xl text-center">
            <div className="flex items-center justify-center space-x-3 mb-8">
              <Heart className="w-12 h-12 text-blue-400" />
              <span className="text-3xl font-bold text-white">HealthMate</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {isSignUp ? "Start Your Health Journey" : "Welcome Back!"}
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              {isSignUp 
                ? "Join thousands of users who trust HealthMate for their healthcare needs."
                : "Your AI-powered health companion is waiting for you."}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                <h3 className="text-2xl font-bold text-blue-400 mb-2">24/7</h3>
                <p className="text-gray-300">AI Support</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                <h3 className="text-2xl font-bold text-blue-400 mb-2">100%</h3>
                <p className="text-gray-300">Secure</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                <h3 className="text-2xl font-bold text-blue-400 mb-2">1M+</h3>
                <p className="text-gray-300">Users</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Section - Custom Auth Form */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-1/2 xl:w-1/3 p-8 sm:p-12 flex items-center justify-center"
        >
          <div className="w-full max-w-md">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                {isSignUp ? "Create Account" : "Sign In"}
              </h2>
              
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <button
                  onClick={handleGoogleAuth}
                  disabled={isSignInLoading || isSignUpLoading}
                  className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 border border-white/20 
                    rounded-xl text-white flex items-center justify-center space-x-3 transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <GoogleLogo />
                  <span>Continue with Google</span>
                </button>

                <button
                  onClick={handleMetaMaskAuth}
                  disabled={isSignInLoading || isSignUpLoading}
                  className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 border border-white/20 
                    rounded-xl text-white flex items-center justify-center space-x-3 transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MetaMaskLogo />
                  <span>Continue with MetaMask</span>
                </button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-gray-400">
                  {isSignUp ? "Already have an account?" : "Don't have an account?"}
                  {" "}
                  <a 
                    href={isSignUp ? "/sign-in" : "/sign-up"}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {isSignUp ? "Sign in" : "Sign up"}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthComponent; 