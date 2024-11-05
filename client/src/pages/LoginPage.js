import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
    const { login, signup } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLogin) {
            await login(email, password);
        } else {
            await signup(email, password);
        }
    };

    return (
        <div>
            <h2>{isLogin ? 'Login' : 'Signup'}</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">{isLogin ? 'Login' : 'Signup'}</button>
            </form>
            <button onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? 'Need an account? Signup' : 'Have an account? Login'}
            </button>
        </div>
    );
}

export default LoginPage;
