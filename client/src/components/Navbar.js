import React from 'react'
import { Link } from 'react-router-dom'
import '../styles/Navbar.css'
import { auth, googleProvider } from './../firebaseConfig';
import { useAuth } from './../context/AuthContext';
import { useNavigate } from 'react-router-dom';



const Navbar = ({ room }) => {
    const { setUser } = useAuth();  // Assuming setUser is exposed by AuthContext
    const navigate = useNavigate();

    const logout = async () => {
        await auth.signOut();
        navigate("/");
    }

    return (
        <div>
        <nav className="navbar"> 
            <div className="navbar-container">
            <ul className='nav-menu'>
                <li className='nav-item'>
                <Link to={`/chat?room=${room}`} className='nav-links'>
                    Chat
                </Link>
                </li>
                <li className='nav-item'>
                <Link to={`/calendar?room=${room}`} className='nav-links'>
                    Calendar
                </Link>
                </li>
                <li className='nav-item'>
                <Link to={`/resources?room=${room}`} className='nav-links'>
                    Resources
                </Link>
                </li>
                <li className='nav-item'>
                <Link to={`/members?room=${room}`} className='nav-links'>
                    Members
                </Link>
                </li>
                <li className='nav-item'>
                <Link to={`/homepage?room=${room}`} className='nav-links'>
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
    )
}

export default Navbar