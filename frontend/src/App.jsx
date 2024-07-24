import React from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink } from 'react-router-dom';
import AuthForm from './pages/AuthForm.jsx';
import TaskBoardContainer from './pages/TaskBoardContainer.jsx';

const App = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <nav className="bg-blue-600 p-4 text-white mb-4">
        <NavLink 
          to="/" 
          className={({ isActive }) => isActive ? "mr-4 text-yellow-400" : "mr-4"}
        >
          Login
        </NavLink>
        <NavLink 
          to="/home" 
          className={({ isActive }) => isActive ? "text-yellow-400" : ""}
        >
          Home
        </NavLink>
      </nav>
      <main className="flex flex-col items-center">
        <Routes>
          <Route path="/" element={<AuthForm />} />
          <Route path="/home" element={<TaskBoardContainer />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
