import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Navbar from "./components/Navbar";
import MockTestPage from "./pages/MockTestPage";

axios.defaults.baseURL = process.env.REACT_APP_BASE_URL;
axios.defaults.withCredentials = true;

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get("/auth", { withCredentials: true });
        if (res.data.userId) {
          setAuthenticated(true);
        }
      } catch (err) {
        setAuthenticated(false);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) return <div>Loading...</div>; 

  return (
    <BrowserRouter>
    <Navbar/>
      <Routes>
        <Route path="/" element={authenticated ? <Home /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login setAuthenticated={setAuthenticated} />} />
        <Route path="/signup" element={<Signup setAuthenticated={setAuthenticated} />} />
        <Route path="/:mockId" element={<MockTestPage setAuthenticated={setAuthenticated}/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
