import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Alert,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import TimerIcon from "@mui/icons-material/Timer";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Demo credentials
  const DEMO_CREDENTIALS = {
    username: "sumit",
    password: "Sumit@123",
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      if (
        username === DEMO_CREDENTIALS.username &&
        password === DEMO_CREDENTIALS.password
      ) {
        // Store authentication with timestamp
        localStorage.setItem("paisaonsalary_authenticated", "true");
        localStorage.setItem("paisaonsalary_auth_time", new Date().toISOString());
        localStorage.setItem("paisaonsalary_user", username);
        
        // Store remember me preference
        if (rememberMe) {
          localStorage.setItem("paisaonsalary_remember", "true");
        } else {
          localStorage.removeItem("paisaonsalary_remember");
        }
        
        navigate("/dashboard");
      } else {
        setError("Invalid username or password");
        setLoading(false);
      }
    }, 1000);
  };

  const handleDemoLogin = () => {
    setUsername(DEMO_CREDENTIALS.username);
    setPassword(DEMO_CREDENTIALS.password);
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Box
            sx={{
              backgroundColor: "primary.main",
              borderRadius: "50%",
              padding: 2,
              marginBottom: 2,
              color: "white",
            }}
          >
            <LockOutlinedIcon fontSize="large" />
          </Box>
          
          <Typography component="h1" variant="h5">
            Paisa On Salary
          </Typography>
          
          <Box display="flex" alignItems="center" sx={{ mt: 1 }}>
            <TimerIcon color="action" fontSize="small" />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
              Session: 8 hours
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleLogin} sx={{ mt: 3, width: "100%" }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  value="remember"
                  color="primary"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
              }
              label="Remember me"
              sx={{ mt: 1 }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2, mb: 2 }}
              disabled={loading || !username || !password}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            
            <Button
              fullWidth
              variant="outlined"
              onClick={handleDemoLogin}
              sx={{ mb: 2 }}
              disabled={loading}
            >
              Use Demo Credentials
            </Button>
            
            <Typography variant="body2" color="text.secondary" align="center">
              Demo: admin / password123
            </Typography>
          </Box>
        </Paper>
        
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Session will expire after 8 hours of inactivity
          </Typography>
          <Typography variant="caption" color="text.secondary">
            © {new Date().getFullYear()} Paisa On Salary
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;