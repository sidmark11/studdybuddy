import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Navbar.css';
import { auth } from './../firebaseConfig';
import { useAuth } from './../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const { setUser } = useAuth();  // Assuming setUser is exposed by AuthContext
    const navigate = useNavigate();
    const location = useLocation();

    // Extract the room parameter from the current URL
    const params = new URLSearchParams(location.search);
    const room = params.get('room') || '';

    const logout = async () => {
        await auth.signOut();
        navigate("/");
    };

    // Helper function to append the room parameter to a path
    const getPathWithRoom = (path) => (room ? `${path}?room=${room}` : path);

    return (
        <div>
            <nav className="navbar">
                <div className="navbar-container">
                    <ul className='nav-menu'>
                        <li className='nav-item'>
                            <Link to={getPathWithRoom('/chat')} className='nav-links'>
                                Chat
                            </Link>
                        </li>
                        <li className='nav-item'>
                            <Link to={getPathWithRoom('/calendar')} className='nav-links'>
                                Calendar
                            </Link>
                        </li>
                        <li className='nav-item'>
                            <Link to={getPathWithRoom('/resources')} className='nav-links'>
                                Resources
                            </Link>
                        </li>
                        <li className='nav-item'>
                            <Link to={getPathWithRoom('/members')} className='nav-links'>
                                Members
                            </Link>
                        </li>
                        <li className='nav-item'>
                            <Link to={getPathWithRoom('/homepage')} className='nav-links'>
                                Home
                            </Link>
                        </li>
                        <li className='nav-item'>
                            <Link onClick={logout} className='nav-links'>
                                Logout
                            </Link>
                        </li>
                    </ul>
                    <div>
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default Navbar;
