import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { EyeIcon, EyeOffIcon, LogInIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { FaGoogle, FaGithub } from 'react-icons/fa'
import '@/styles/auth.css'

const Login = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signIn(email, password);
    } catch (error: any) {
      setError(error.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
    } catch (error: any) {
      setError(error.message || 'Failed to sign in with Google');
    }
  };

  const handleGithubLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
    } catch (error: any) {
      setError(error.message || 'Failed to sign in with GitHub');
    }
  };

  return (
    <div className="auth-container">
      <Card className="w-full max-w-md card-shadow animate-slide-up">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 bg-brand-500 text-white rounded-lg flex items-center justify-center">
              <LogInIcon className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Entrar</CardTitle>
          <CardDescription className="text-center">
            Acesse sua conta do Checklist Inteligente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="auth-form space-y-4">
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <Link to="/forgot-password" className="text-sm text-brand-500 hover:text-brand-600">
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full h-11 bg-brand-500 hover:bg-brand-600" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                ou
              </span>
            </div>
          </div>
          <div className="social-buttons">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="social-button google"
            >
              <FaGoogle /> Google
            </button>
            
            <button
              type="button"
              onClick={handleGithubLogin}
              className="social-button github"
            >
              <FaGithub /> GitHub
            </button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="relative w-full flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
            </div>
            <div className="relative z-0 bg-card px-4 text-sm text-muted-foreground">
              ou
            </div>
          </div>
          <Button variant="outline" className="w-full h-11" onClick={() => navigate("/register")}>
            Criar nova conta
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
