import React from 'react';
import { Link } from 'react-router-dom';
import { User } from '../types';

interface NavbarProps {
  user: User;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <i className="fas fa-tasks"></i> TodoList
        </Link>
        
        <div className="navbar-nav ms-auto">
          <Link className="nav-link" to="/">
            <i className="fas fa-home"></i> 대시보드
          </Link>
          <Link className="nav-link" to="/tasks">
            <i className="fas fa-list"></i> 작업 목록
          </Link>
          <Link className="nav-link" to="/add-task">
            <i className="fas fa-plus"></i> 작업 추가
          </Link>
          <button className="nav-link btn btn-link text-white" onClick={onLogout}>
            <i className="fas fa-sign-out-alt"></i> 로그아웃
          </button>
          <span className="navbar-text ms-3">
            <i className="fas fa-user"></i> {user.username}
          </span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
