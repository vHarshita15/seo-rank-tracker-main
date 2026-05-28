import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Analyze from "./pages/Analyze";
import Report from "./pages/Report";
import History from "./pages/History";
import RankTracker from "./pages/RankTracker";
import RankDetail from "./pages/RankDetail";
import { Toaster } from "react-hot-toast";

export default function App() {
    return (
        <>
            <Toaster />
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/analyze" element={<Analyze />} />
                <Route path="/report/:id" element={<Report />} />
                <Route path="/history" element={<History />} />
                <Route path="/rank-tracker" element={<RankTracker />} />
                <Route path="/rank/:id" element={<RankDetail />} />
            </Routes>
        </>
    );
}