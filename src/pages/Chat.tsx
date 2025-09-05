import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Heart, Send, Trash2, Clock, AlertTriangle, ArrowLeft, Menu, Smile, Sun, Moon } from 'lucide-react';
import { UserAvatar } from '@/components/UserAvatar';
import { BannerBadge } from '@/components/BannerBadge';
import { AppLayout } from '@/components/layouts/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import { useActivityRewards } from '@/hooks/useActivityRewards';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';

export default function Chat() {
  const [newMessage, setNewMessage] = useState('');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { messages, loading, sendMessage, giveHeart, deleteMessage, clearAllMessages } = useChat();
  const { giveActivityReward } = useActivityRewards();
  const { theme, toggleTheme } = useTheme();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Calculate time until chat resets (30 minutes from oldest message)
  useEffect(() => {
    if (messages.length === 0) return;

    const oldestMessage = messages.reduce((oldest, current) => 
      new Date(current.created_at) < new Date(oldest.created_at) ? current : oldest
    );

    const resetTime = new Date(new Date(oldestMessage.created_at).getTime() + 30 * 60 * 1000);
    
    const updateTimer = () => {
      const now = new Date();
      const diff = resetTime.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft('Chat reiniciado');
        clearAllMessages();
        return;
      }

      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);

      // Show warning at 5 minutes
      if (diff <= 5 * 60 * 1000 && diff > 4 * 60 * 1000 + 55000) {
        toast.warning('⚠️ El chat se reiniciará en 5 minutos', {
          duration: 5000
        });
      }

      // Start countdown at 30 seconds
      if (diff <= 30000 && diff > 0) {
        const secondsLeft = Math.ceil(diff / 1000);
        setCountdown(secondsLeft);
        
        if (secondsLeft === 30) {
          toast.error('🚨 Chat reiniciándose en 30 segundos...', {
            duration: 30000
          });
        }
      } else {
        setCountdown(null);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    await sendMessage(newMessage);
    giveActivityReward('first_message');
    setNewMessage('');
  };

  const handleGiveHeart = async (userId: string) => {
    await giveHeart(userId);
  };

  const handleUserClick = (userId: string) => {
    giveActivityReward('profile_visit');
    navigate(`/profile/${userId}`);
  };

  const commonEmojis = ['😀', '😂', '❤️', '👍', '👎', '😍', '😢', '😮', '😡', '🔥', '💪', '🎉', '👏', '🙏', '💯'];

  const addEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };


  return (
    <AppLayout>
      <div className="flex flex-col h-screen max-w-4xl mx-auto">
        {/* Chat Header */}
        <div className="glass border-b border-border/50 p-3 md:p-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(-1)}
                className="text-muted-foreground hover:text-foreground p-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-lg md:text-xl font-bold cyber-glow">H Chat</h1>
                <p className="text-xs text-muted-foreground">
                  {messages.length} mensajes • {user?.email?.split('@')[0]}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs">
              {/* Reset Timer */}
              {messages.length > 0 && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{timeLeft}</span>
                </div>
              )}
              
              {/* Countdown Warning */}
              {countdown && (
                <div className="flex items-center gap-1 text-destructive animate-pulse">
                  <AlertTriangle className="w-3 h-3" />
                  <span className="font-mono font-bold">{countdown}s</span>
                </div>
              )}
              
              <div className="flex items-center gap-1 text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                <span className="hidden sm:inline">En línea</span>
              </div>

              {/* Menu Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Menu className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-background border-border/50 z-50">
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    Mi Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/leaderboard')}>
                    Rankings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/banners')}>
                    Banners
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/banner-settings', { state: { from: '/chat' } })}>
                    Configurar Banners
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={toggleTheme}>
                    {theme === 'dark' ? (
                      <>
                        <Sun className="w-4 h-4 mr-2" />
                        Modo Claro
                      </>
                    ) : (
                      <>
                        <Moon className="w-4 h-4 mr-2" />
                        Modo Oscuro
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="text-center text-muted-foreground py-12">
              <div className="animate-pulse">Cargando mensajes...</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <div className="space-y-2">
                <p className="text-lg">¡Sé el primero en escribir un mensaje!</p>
                <p className="text-sm opacity-70">Inicia la conversación</p>
              </div>
            </div>
          ) : (
            messages.map((message, index) => {
              const isOwnMessage = user?.id === message.user_id;
              const prevMessage = messages[index - 1];
              const isConsecutiveMessage = prevMessage?.user_id === message.user_id;
              
              return (
                <div key={message.id} className={`flex gap-3 group ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar Column */}
                  <div className="flex flex-col items-center shrink-0">
                    {!isConsecutiveMessage && (
                      <UserAvatar 
                        src={message.profile?.avatar_url} 
                        name={message.profile?.username || 'Usuario'}
                        size="md"
                        className="mb-1"
                      />
                    )}
                    {!isOwnMessage && !isConsecutiveMessage && (
                      <div className="flex flex-col items-center gap-1 mt-1">
                        <button
                          onClick={() => handleGiveHeart(message.user_id)}
                          className="p-1.5 rounded-full hover:bg-heart/10 hover:scale-110 transition-all duration-200 group/heart"
                        >
                          <Heart className="w-4 h-4 text-muted-foreground group-hover/heart:text-heart group-hover/heart:fill-current transition-all" />
                        </button>
                        <span className="text-xs text-muted-foreground font-medium">
                          {message.profile?.hearts_count || 0}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Message Content */}
                  <div className={`flex-1 min-w-0 max-w-[75%] ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                    {/* User Info Header - Only show for first message in sequence */}
                    {!isConsecutiveMessage && (
                      <div className={`flex items-center gap-2 mb-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                        <button
                          onClick={() => handleUserClick(message.user_id)}
                          className="font-semibold text-sm text-foreground hover:text-primary transition-colors"
                        >
                          {message.profile?.username || 'Usuario'}
                        </button>
                        
                        {/* Banner Display */}
                        {message.equipped_banners
                          ?.sort((a, b) => a.position - b.position)
                          .slice(0, 1)
                          .map((banner, index) => (
                            <div key={index} className="flex items-center">
                              <BannerBadge
                                name={banner.banner.name}
                                emoji={banner.banner.emoji}
                                rarity={banner.banner.rarity as any}
                                size="sm"
                              />
                            </div>
                          ))}
                        
                        <span className="text-xs text-muted-foreground/70">
                          {new Date(message.created_at).toLocaleTimeString('es-ES', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    )}
                    
                    {/* Message Bubble */}
                    <div className={`relative flex items-start gap-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                      <div 
                        className={`
                          px-4 py-3 rounded-2xl shadow-sm border backdrop-blur-sm
                          ${isOwnMessage 
                            ? 'bg-primary text-primary-foreground border-primary/20 rounded-tr-md' 
                            : 'bg-card text-card-foreground border-border/50 rounded-tl-md'
                          }
                          ${isConsecutiveMessage ? 'mt-1' : 'mt-0'}
                          hover:shadow-md transition-all duration-200
                        `}
                      >
                        <p className="text-sm leading-relaxed break-words">
                          {message.content}
                        </p>
                      </div>
                      
                      {/* Delete Button for Own Messages */}
                      {isOwnMessage && (
                        <button
                          onClick={() => deleteMessage(message.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-destructive/10 transition-all duration-200 shrink-0 self-end mb-1"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive transition-colors" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="glass border-t border-border/50 p-4 shrink-0 mt-auto">
          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="mb-3 p-2 bg-background-secondary rounded-lg border border-border/50">
              <div className="flex flex-wrap gap-2">
                {commonEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => addEmoji(emoji)}
                    className="text-xl hover:bg-background-tertiary p-1 rounded transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <div className="flex-1 flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="px-3 h-10 text-muted-foreground hover:text-foreground"
              >
                <Smile className="w-4 h-4" />
              </Button>
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="flex-1 bg-background-secondary border-border/50 h-10"
                maxLength={500}
              />
            </div>
            <Button 
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-gradient-primary hover:scale-105 transition-all glow-primary disabled:opacity-50 px-4 h-10"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}