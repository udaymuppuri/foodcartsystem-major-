import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./home.css";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://192.168.134.130:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();

      if (res.ok) {
        setMessage("Login successful!");
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);

        // Redirect based on role
        if (data.role === "admin"){
          localStorage.setItem("user", JSON.stringify(data)); // save user info
          navigate(`/${data._id}/admin-dashboard`);
        }
        else if (data.role === "student") {
          localStorage.setItem("user", JSON.stringify(data)); // Save user info
          navigate(`/${data._id}/student-dashboard`);
        }
        else if (data.role === "staff") navigate("/staff-dashboard");
        else setMessage("Invalid role, contact admin.");
      } else {
        setMessage(data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error. Please try again later.");
    }
  };

  return (
    <div className="login-page d-flex align-items-center justify-content-center">
      <div className="container">
        <motion.div
          className="login-card p-5 shadow-lg rounded-4 bg-white"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2
            className="text-primary fw-bold text-center mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            🎓 Login
          </motion.h2>

          <form onSubmit={handleLogin}>
            <motion.input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control mb-3"
              required
            />
            <motion.input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control mb-4"
              required
            />

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="btn btn-primary w-100 mb-3 shadow"
            >
              Login
            </motion.button>
          </form>

          {message && (
            <motion.p
              className={`text-center mt-2 ${
                message.includes("successful") ? "text-success" : "text-danger"
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {message}
            </motion.p>
          )}

          <motion.div
            className="text-center mt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <span>Don't have an account? </span>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-link text-primary p-0"
              onClick={() => navigate("/register")}
            >
              Register here
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
