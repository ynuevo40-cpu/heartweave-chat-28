import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="text-center max-w-md w-full">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-full mb-8 glow-primary">
          <MessageCircle className="w-8 h-8 text-white" />
        </div>
        
        <Card className="glass border-border/50 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-6xl font-bold cyber-glow mb-2">404</CardTitle>
            <h1 className="text-2xl font-bold">Página No Encontrada</h1>
            <p className="text-muted-foreground">
              Oops! La página que buscas no existe en H Chat
            </p>
          </CardHeader>
          
          <CardContent className="text-center">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Es posible que el enlace sea incorrecto o que la página haya sido movida.
              </p>
              
              <div className="flex flex-col gap-3">
                <Button 
                  asChild 
                  className="bg-gradient-primary hover:scale-105 transition-all glow-primary"
                >
                  <Link to="/">
                    <Home className="h-4 w-4 mr-2" />
                    Volver al Inicio
                  </Link>
                </Button>
                
                <Button 
                  asChild 
                  variant="outline" 
                  className="border-border/50 hover:bg-background-secondary"
                >
                  <Link to="/chat">Ir al Chat</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;
