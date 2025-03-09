import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSignup = async () => {
    setLoading(true);
    setError(null);
    try {
      await axios.post(`/signup`, { name, email, password });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500">
      <div className="p-8 bg-white rounded-2xl shadow-lg w-96 text-center">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Create an Account</h2>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <input type="text" placeholder="Full Name" className="p-3 border rounded-lg w-full mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          onChange={(e) => setName(e.target.value)} />
        <input type="email" placeholder="Email Address" className="p-3 border rounded-lg w-full mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" className="p-3 border rounded-lg w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
          onChange={(e) => setPassword(e.target.value)} />
        <button onClick={handleSignup} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold p-3 w-full rounded-lg transition duration-300">
          {loading ? "Signing up..." : "Sign Up"}
        </button>
        <p className="mt-4 text-gray-600">Already a user? <span className="text-blue-500 hover:underline cursor-pointer" onClick={() => navigate("/login")}>Log in</span></p>
      </div>
    </div>
  );
};

export default Signup;
