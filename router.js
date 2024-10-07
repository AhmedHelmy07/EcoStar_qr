import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Login';
import ManagerPanel from './ManagerPanel';
import Home from './Home';  // صفحة رئيسية افتراضية إذا كنت تريد

const AppRouter = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/manager" element={<ManagerPanel />} />
                <Route path="/home" element={<Home />} />
            </Routes>
        </Router>
    );
};

export default AppRouter;
