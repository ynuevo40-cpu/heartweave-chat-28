import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Users, Trophy, Award, Heart, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import BackButton from '@/components/BackButton';

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      
      <main className="pb-20 md:pl-20">
        {/* Back Button for mobile/small screens */}
        <div className="md:hidden p-4">
          <BackButton />
        </div>
        
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 py-16 text-center">
            <div className="space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-primary rounded-full mb-8 glow-primary float">
                <MessageCircle className="w-10 h-10 text-white" />
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold cyber-glow">
                H Chat
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
                La comunidad de chat más futurista con sistema de banners coleccionables
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Button 
                  asChild 
                  size="lg"
                  className="bg-gradient-primary hover:scale-105 transition-all glow-primary text-lg px-8 py-6"
                >
                  <Link to="/register">Crear Cuenta</Link>
                </Button>
                
                <Button 
                  asChild 
                  variant="outline" 
                  size="lg"
                  className="border-border/50 hover:bg-background-secondary text-lg px-8 py-6"
                >
                  <Link to="/login">Iniciar Sesión</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Chat Feature */}
            <Card className="glass border-border/50 hover:scale-105 transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Chat en Tiempo Real</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Conversa con usuarios de todo el mundo en nuestro chat futurista con efectos visuales únicos.
                </p>
              </CardContent>
            </Card>

            {/* Banners Feature */}
            <Card className="glass border-border/50 hover:scale-105 transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Sistema de Banners</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Colecciona banners únicos ganando corazones. Desde comunes hasta legendarios.
                </p>
              </CardContent>
            </Card>

            {/* Hearts Feature */}
            <Card className="glass border-border/50 hover:scale-105 transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Corazones Permanentes</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Recibe corazones de otros usuarios que quedan guardados para siempre en tu perfil.
                </p>
              </CardContent>
            </Card>

            {/* Rankings Feature */}
            <Card className="glass border-border/50 hover:scale-105 transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Rankings Globales</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Compite por estar en el top de usuarios más populares de la comunidad.
                </p>
              </CardContent>
            </Card>

            {/* Community Feature */}
            <Card className="glass border-border/50 hover:scale-105 transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Comunidad Activa</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Únete a miles de usuarios activos en una experiencia de chat completamente nueva.
                </p>
              </CardContent>
            </Card>

            {/* Innovation Feature */}
            <Card className="glass border-border/50 hover:scale-105 transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Diseño Futurista</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Experimenta una interfaz vanguardista con efectos glassmorphism y animaciones suaves.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <Card className="glass border-primary/30 bg-primary/5 shadow-2xl">
            <CardContent className="pt-8 pb-8">
              <h2 className="text-3xl font-bold mb-4">
                ¿Listo para unirte a H Chat?
              </h2>
              <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                Comienza tu aventura ahora y obtén tu primer banner "Nuevo en H" 🌱
              </p>
              <Button 
                asChild 
                size="lg"
                className="bg-gradient-primary hover:scale-105 transition-all glow-primary text-lg px-12 py-6"
              >
                <Link to="/register">¡Empezar Ahora!</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer Info */}
        <div className="max-w-4xl mx-auto px-4 py-8 text-center border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Nota:</strong> Esta es una demo de la aplicación. Para funcionalidad completa con autenticación y base de datos real, conecta Supabase desde el panel superior.
          </p>
        </div>
      </main>
    </div>
  );
}
