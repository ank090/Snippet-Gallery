import { useState } from "react";
import { Code2 } from "lucide-react";

const Auth = ({ isSignUp, setIsSignUp, handleAuth, isLoading, error }) => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const onSubmit = async (e) => {
        e.preventDefault();
        await handleAuth(email, password);
        if (isSignUp) { setPassword('') };
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-brand">
                    <Code2/>
                    <span>Snippet Gallery</span>
                </div>
                <h2>{isSignUp ? "Create Account" : "Sign In"}</h2>
                {error && <div className="auth-error">{error}</div>}
                <form className="auth-form" onSubmit={onSubmit}>
                    <input type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={((e) => setEmail(e.target.value))}
                        required
                    >
                    </input>
                    <input type="password"
                        placeholder="Password"
                        value={password}
                        onChange={((e) => setPassword(e.target.value))}
                        required
                    >
                    </input>
                    <button className="submit-button" type="submit" disabled={isLoading}>
                        {isLoading ? "Processing.." : isSignUp ? "Sign Up" : "Log In"}
                    </button>
                </form>
                <p className="auth-footer">
                    {isSignUp ? "Alredy have an accoun?" : "Create account"}{" "}
                    <button
                        className="auth-link"
                        type="button"
                        onClick={() => setIsSignUp(!isSignUp)}
                    >
                        {isSignUp ? "Log In" : "Sign Up"}
                    </button>
                </p>
            </div>
        </div>
    );
}
export default Auth;