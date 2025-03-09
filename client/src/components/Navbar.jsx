import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-gray-900 text-white p-4 shadow-lg flex items-center justify-between">
     
      <div className="text-2xl font-bold text-green-400">LearnSQL</div>
      
     
      <div className="space-x-6 text-lg">
        <Link to="/" className="hover:text-green-400 transition">Home</Link>
        <Link to="/contact" className="hover:text-green-400 transition">Contact Us</Link>
        <Link to="/about" className="hover:text-green-400 transition">About</Link>
      </div>
      
      
      <div className="space-x-4">
        <Link to="/login" className="px-4 py-2 border border-green-400 text-green-400 rounded-lg hover:bg-green-400 hover:text-gray-900 transition">Login</Link>
        <Link to="/signup" className="px-4 py-2 bg-green-400 text-gray-900 rounded-lg hover:bg-green-500 transition">Signup</Link>
      </div>
    </nav>
  );
};

export default Navbar;
