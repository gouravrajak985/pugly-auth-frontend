
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SignIn } from './auth/SignIn';
import { SignUp } from './auth/SignUp';
import { VerifyOtp } from './auth/VerifyOtp';
import { Dashboard } from './dashboard/Dashboard';
import { CheckUser } from './auth/CheckUser';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CheckUser/>} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verify-otp/:email" element={<VerifyOtp />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}
export default App;
