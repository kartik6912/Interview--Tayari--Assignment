import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = ({ setAuthenticated }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post("/login", { email, password }, { withCredentials: true });
      localStorage.setItem("userId", res.data.userId);
      localStorage.setItem("email", res.data.email);
      localStorage.setItem("name", res.data.name);
      setAuthenticated(true);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = () => {
    navigate("/signup");
  };

  return (
    <div className="h-screen flex justify-center items-center bg-gradient-to-br from-blue-500 to-indigo-600">
      <div className="p-8 bg-white rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Welcome Back</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          className="p-3 border border-gray-300 rounded-md w-full mb-3 focus:ring-2 focus:ring-blue-400 outline-none"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="p-3 border border-gray-300 rounded-md w-full mb-3 focus:ring-2 focus:ring-blue-400 outline-none"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleLogin}
          className="bg-blue-600 text-white p-3 rounded-md w-full hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        <p className="mt-4 text-center text-gray-600">
          First time here? 
          <button onClick={handleSignup} className="text-blue-600 hover:underline ml-1">Sign up</button>
        </p>
      </div>
    </div>
  );
};

export default Login;
