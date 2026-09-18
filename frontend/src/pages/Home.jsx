import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaGoogle, FaUserCircle } from "react-icons/fa";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import ArtifactPanel from "../components/ArtifactPanel";
import ChatArea from "../components/ChatArea";
import Sidebar from "../components/Sidebar";
import api from "../utils/axios";
import { setUserData } from "../redux/user.slice";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../firebase";

function Home() {
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loginWithBackend = async (payload) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.post(`/api/auth/login`, payload);
      if (data?.user) {
        dispatch(setUserData(data.user));
      } else {
        throw new Error(data?.message || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to connect to authentication service. Please ensure the backend is running.",
      );
    } finally {
      setLoading(false);
    }
  };

  // const handleGoogleLogin = async () => {
  //   try {
  //     setLoading(true);
  //     setError(null);
  //     const result = await signInWithPopup(auth, googleProvider);
  //     const token = await result.user.getIdToken();
  //     await loginWithBackend({ token });
  //   } catch (err) {
  //     console.error("Google Auth error:", err);
  //     if (err.code === "auth/invalid-api-key" || err.code === "auth/configuration-not-found" || err.code === "auth/api-key-not-valid") {
  //       setError("Firebase API Key is missing or invalid. Use 'Continue as Demo User' below for instant access.");
  //     } else {
  //       setError(err.message || "Google Sign-In was cancelled or failed.");
  //     }
  //     setLoading(false);
  //   }
  // };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();

      // 👇 demoUser में Google से आई असली Email और UID भेजें
      await loginWithBackend({
        token,
        demoUser: {
          uid: result.user.uid,
          email: result.user.email,
          name: result.user.displayName || "User",
          picture:
            result.user.photoURL ||
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
        },
      });
    } catch (err) {
      console.error("Google Auth error:", err);
      if (
        err.code === "auth/invalid-api-key" ||
        err.code === "auth/configuration-not-found" ||
        err.code === "auth/api-key-not-valid"
      ) {
        setError(
          "Firebase API Key is missing or invalid. Use 'Continue as Demo User' below for instant access.",
        );
      } else {
        setError(err.message || "Google Sign-In was cancelled or failed.");
      }
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    await loginWithBackend({
      demoUser: {
        uid: "demo_user_123",
        email: "demo@bearly.ai",
        name: "Bearly Explorer",
        picture:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      },
    });
  };

  return (
    <div className="h-screen flex bg-[#0d0f14] text-white overflow-hidden">
      <Sidebar />
      <ChatArea />
      <ArtifactPanel />

      {!userData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="w-full max-w-[380px] bg-[#13151c] border border-white/[0.08] rounded-2xl p-7 flex flex-col gap-5 shadow-2xl shadow-black/80 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Sparkles size={16} />
                </div>
                <span className="text-[11px] font-semibold tracking-wider text-indigo-400 uppercase bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                  Bearly AI Workspace
                </span>
              </div>
              <h2 className="text-[19px] font-bold text-slate-100 tracking-tight">
                Welcome to Bearly
              </h2>
              <p className="text-[13px] text-slate-400 leading-relaxed">
                Sign in to collaborate with autonomous AI agents, create code
                artifacts, and explore intelligent workflows.
              </p>
            </div>

            {/* Error message if any */}
            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-[12px] leading-snug">
                <AlertCircle
                  size={16}
                  className="shrink-0 mt-0.5 text-red-400"
                />
                <span className="flex-1">{error}</span>
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-medium text-white bg-gradient-to-br from-indigo-500 to-violet-700 hover:from-indigo-400 hover:to-violet-600 active:from-indigo-600 active:to-violet-800 border border-indigo-500/30 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin text-white" />
                ) : (
                  <FaGoogle size={15} className="text-white" />
                )}
                <span>Continue with Google</span>
              </button>

              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-[1px] bg-white/[0.08]" />
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  or
                </span>
                <div className="flex-1 h-[1px] bg-white/[0.08]" />
              </div>

              <button
                onClick={handleDemoLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl text-sm font-medium text-slate-200 bg-white/[0.05] hover:bg-white/[0.09] active:bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.15] transition-all duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <FaUserCircle size={16} className="text-slate-400" />
                <span>Continue as Demo User</span>
              </button>
            </div>

            <p className="text-[11px] text-center text-slate-500">
              100 Free Credits included on sign up • No credit card required
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
