import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, MessageCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import BackButton from '@/components/BackButton';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const { signIn, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/chat');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await signIn(formData.email, formData.password);
    if (!error) {
      navigate('/chat');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Back Button */}
        <div className="flex justify-start">
          <BackButton to="/" />
        </div>
        
        {/* Logo/Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-full mb-4 glow-primary">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold cyber-glow">H Chat</h1>
          <p className="text-muted-foreground mt-2">
            La mejor comunidad de chat futurista
          </p>
        </div>

        {/* Login Form */}
        <Card className="glass border-border/50 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
            <CardDescription>
              Ingresa a tu cuenta para continuar chateando
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="bg-background-secondary border-border/50"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="bg-background-secondary border-border/50 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-primary hover:scale-105 transition-all glow-primary disabled:opacity-50"
              >
                {loading ? 'Iniciando...' : 'Entrar'}
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              <div className="text-center">
                <Button variant="link" className="text-sm text-muted-foreground hover:text-primary">
                  ¿Olvidaste tu contraseña?
                </Button>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    ¿No tienes cuenta?
                  </span>
                </div>
              </div>
              
              <Button 
                asChild 
                variant="outline" 
                className="w-full border-border/50 hover:bg-background-secondary"
              >
                <Link to="/register">Crear Cuenta</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Banner */}
        <Card className="glass border-primary/30 bg-primary/5">
          <CardContent className="pt-6">
            <div className="text-center text-sm">
              <p className="text-primary font-semibold mb-1">🚀 ¡Sistema Real Activado!</p>
              <p className="text-muted-foreground">
                Login con Supabase habilitado. ¡Crea tu cuenta y comienza a chatear!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}