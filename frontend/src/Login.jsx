// src/Login.jsx
import './App.css';
import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import { auth } from "./firebase";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");      // Info-Hinweise für Spam etc.
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    try {
      if (isRegistering) {
        // --- REGISTRIERUNG ---
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        await sendEmailVerification(userCredential.user);

        // INFO → Spam Hinweis
        setInfo(
          "Verification email sent! Please check your inbox — sometimes it lands in the spam folder."
        );

        // Benutzer bleibt auf der Seite — NICHT einloggen!
        await signOut(auth);

        // ⛔ WICHTIG: KEIN onLogin() hier!
        return;
      }

      // --- LOGIN ---
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      if (!userCredential.user.emailVerified) {
        setError("Please verify your email before logging in.");
        await signOut(auth);
        return;
      }

      onLogin();

    } catch (err) {
      switch (err.code) {
        case "auth/email-already-in-use":
          setError("This email is already in use.");
          break;
        case "auth/invalid-email":
          setError("Invalid email address.");
          break;
        case "auth/weak-password":
          setError("Password must be at least 6 characters.");
          break;
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
          setError("Incorrect password or user does not exist.");
          break;
        default:
          setError("Error: " + err.message);
          break;
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setInfo("Please enter your email first.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setInfo("Password reset email sent! Please also check your spam folder.");
    } catch (err) {
      switch (err.code) {
        case "auth/user-not-found":
          setError("No user found with this email.");
          break;
        case "auth/invalid-email":
          setError("Invalid email address.");
          break;
        default:
          setError("Error: " + err.message);
          break;
      }
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-md w-80"
      >
        <h2 className="text-xl font-semibold mb-4 text-center text-gray-800">
          {isRegistering ? "Register" : "Login"}
        </h2>

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        {info && <p className="text-green-600 text-sm mb-2">{info}</p>}

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 p-2 w-full mb-3 rounded-lg 
                     focus:ring-2 focus:ring-emerald-400 focus:outline-none"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-300 p-2 w-full mb-4 rounded-lg 
                     focus:ring-2 focus:ring-emerald-400 focus:outline-none"
          required
        />

        {/* ------------------------------- */}
        {/*     SPEZIELL: FARBERN BUTTON     */}
        {/* ------------------------------- */}
        <button
          type="submit"
          className={`w-full py-2 rounded-lg font-semibold transition-colors duration-200
            ${isRegistering ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"}
          `}
        >
          {isRegistering ? "Create account" : "Login"}
        </button>

        

        {!isRegistering && (
          <p className="text-center text-sm text-gray-600 mt-2">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-emerald-600 hover:text-emerald-800 font-medium transition-colors duration-200"
            >
              Forgot password?
            </button>
          </p>
        )}

        {/* Toggle Login/Register */}
        <p className="text-center text-sm text-gray-600 mt-5">
          {isRegistering ? (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => { setIsRegistering(false); setInfo(""); setError(""); }}
                className="register_btn"
              >
                Login now
              </button>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => { setIsRegistering(true); setInfo(""); setError(""); }}
                className="register_btn"
              >
                Register
              </button>
            </>
          )}
        </p>
      </form>
    </div>
  );
}
