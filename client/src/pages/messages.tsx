import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Send, Users, Plus } from "lucide-react";
import type { ConversationWithDetails } from "@/lib/types";
import { motion, type Variants, type AnimationProps } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const floatingAnimation: AnimationProps["animate"] = {
  y: [-4, 4],
  transition: {
    duration: 2,
    repeat: Infinity,
    repeatType: "mirror",
    ease: "easeInOut"
  }
};

const glowingAnimation: AnimationProps["animate"] = {
  opacity: [0.5, 1, 0.5],
  scale: [0.98, 1, 0.98],
  transition: {
    duration: 3,
    repeat: Infinity,
    repeatType: "mirror",
    ease: "easeInOut"
  }
};

export default function Messages() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");

  // Get contact parameter from URL if present
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const contactUserId = urlParams.get("contact");
    if (contactUserId && isAuthenticated) {
      // Create conversation with the specified user
      createConversationMutation.mutate({
        otherUserId: parseInt(contactUserId),
      });
    }
  }, [isAuthenticated]);

  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ["/api/conversations"],
    enabled: isAuthenticated,
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/conversations", selectedConversation, "messages"],
    enabled: !!selectedConversation,
  });

  const createConversationMutation = useMutation({
    mutationFn: async (data: { otherUserId: number; productId?: number }) => {
      const response = await apiRequest("POST", "/api/conversations", data);
      return response.json();
    },
    onSuccess: (conversation) => {
      setSelectedConversation(conversation.id);
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось создать диалог",
        variant: "destructive",
      });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { content: string }) => {
      if (!selectedConversation) throw new Error("No conversation selected");
      const response = await apiRequest("POST", `/api/conversations/${selectedConversation}/messages`, data);
      return response.json();
    },
    onSuccess: () => {
      setMessageText("");
      queryClient.invalidateQueries({ 
        queryKey: ["/api/conversations", selectedConversation, "messages"] 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось отправить сообщение",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    sendMessageMutation.mutate({ content: messageText.trim() });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString("ru-RU", { 
        hour: "2-digit", 
        minute: "2-digit" 
      });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString("ru-RU", { 
        weekday: "short",
        hour: "2-digit", 
        minute: "2-digit" 
      });
    } else {
      return date.toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit", 
        minute: "2-digit" 
      });
    }
  };

  const getOtherUser = (conversation: any) => {
    return conversation.user1Id === user?.id 
      ? { id: conversation.user2Id, ...conversation.user2 }
      : { id: conversation.user1Id, ...conversation.user1 };
  };

  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900/20 to-slate-900">
        <Header />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center"
        >
          <motion.div animate={glowingAnimation}>
            <MessageCircle className="h-20 w-20 text-blue-400 mx-auto mb-4" />
          </motion.div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-4">
            Доступ ограничен
          </h1>
          <p className="text-slate-300 mb-6 text-lg">Войдите в систему для просмотра сообщений</p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              onClick={() => window.location.href = "/login"} 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-indigo-600 hover:to-blue-500 text-white px-6 py-3 rounded-xl"
            >
              Войти
            </Button>
          </motion.div>
        </motion.div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900/20 to-slate-900">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-3 mb-4">
            <motion.div animate={floatingAnimation}>
              <MessageCircle className="h-10 w-10 text-blue-400" />
            </motion.div>
            <motion.h1 
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-indigo-500 to-blue-600 bg-clip-text text-transparent"
              animate={floatingAnimation}
            >
              Диалоги
            </motion.h1>
          </div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-300 text-lg"
          >
            Общайтесь с продавцами и покупателями
          </motion.p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]"
        >
          {/* Conversations List */}
          <motion.div variants={itemVariants}>
            <Card className="lg:col-span-1 bg-slate-800/50 backdrop-blur-lg border-slate-700/50 shadow-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">Диалоги</h2>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-slate-300 hover:text-white hover:bg-slate-700/50"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  {conversationsLoading ? (
                    <div className="p-4 space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center space-x-3 animate-pulse">
                          <div className="w-10 h-10 bg-slate-700/50 rounded-full"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-slate-700/50 rounded w-3/4"></div>
                            <div className="h-3 bg-slate-700/50 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : conversations.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-6 text-center"
                    >
                      <motion.div animate={glowingAnimation}>
                        <Users className="h-16 w-16 text-blue-400 mx-auto mb-3" />
                      </motion.div>
                      <p className="text-slate-300 text-sm">Нет диалогов</p>
                      <p className="text-slate-400 text-xs mt-1">
                        Начните общение с продавцами
                      </p>
                    </motion.div>
                  ) : (
                    conversations.map((conversation: any) => {
                      const otherUser = getOtherUser(conversation);
                      const isSelected = selectedConversation === conversation.id;
                      
                      return (
                        <motion.div
                          key={conversation.id}
                          variants={itemVariants}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => setSelectedConversation(conversation.id)}
                          className={`p-4 border-b border-slate-700/50 hover:bg-slate-700/50 cursor-pointer transition-all duration-200 ${
                            isSelected ? "bg-blue-900/20 border-r-2 border-r-blue-400" : ""
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10 ring-2 ring-offset-2 ring-offset-slate-800 ring-blue-500/50">
                              <AvatarImage src={otherUser.profileImageUrl} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                                {getUserInitials(otherUser.firstName, otherUser.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-white truncate">
                                  {otherUser.firstName} {otherUser.lastName}
                                </p>
                                <span className="text-xs text-slate-400">
                                  {formatTime(conversation.updatedAt)}
                                </span>
                              </div>
                              <p className="text-sm text-slate-300 truncate">
                                {conversation.lastMessage || "Начните диалог"}
                              </p>
                            </div>
                            {conversation.unreadCount > 0 && (
                              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs px-2 py-1 rounded-full">
                                {conversation.unreadCount}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>

          {/* Messages Area */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="bg-slate-800/50 backdrop-blur-lg border-slate-700/50 shadow-xl h-full">
              {selectedConversation ? (
                <>
                  <CardHeader className="pb-3 border-b border-slate-700/50">
                    {(() => {
                      const conversation = conversations.find((c: any) => c.id === selectedConversation);
                      if (!conversation) return null;
                      const otherUser = getOtherUser(conversation);
                      
                      return (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center space-x-3"
                        >
                          <Avatar className="h-10 w-10 ring-2 ring-offset-2 ring-offset-slate-800 ring-blue-500/50">
                            <AvatarImage src={otherUser.profileImageUrl} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                              {getUserInitials(otherUser.firstName, otherUser.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {otherUser.firstName} {otherUser.lastName}
                            </h3>
                            <p className="text-sm text-slate-400">
                              {conversation.product ? `Товар: ${conversation.product.title}` : "Личные сообщения"}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })()}
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[400px] p-4">
                      {messagesLoading ? (
                        <div className="space-y-4">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex items-start space-x-3 animate-pulse">
                              <div className="w-8 h-8 bg-slate-700/50 rounded-full"></div>
                              <div className="flex-1 space-y-2">
                                <div className="h-4 bg-slate-700/50 rounded w-1/4"></div>
                                <div className="h-16 bg-slate-700/50 rounded w-3/4"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : messages.length === 0 ? (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-center py-8"
                        >
                          <motion.div animate={glowingAnimation}>
                            <MessageCircle className="h-16 w-16 text-blue-400 mx-auto mb-3" />
                          </motion.div>
                          <p className="text-slate-300">Начните диалог</p>
                        </motion.div>
                      ) : (
                        <motion.div variants={containerVariants} initial="hidden" animate="visible">
                          {messages.map((message: any, index: number) => {
                            const isCurrentUser = message.userId === user?.id;
                            return (
                              <motion.div
                                key={message.id}
                                variants={itemVariants}
                                className={`flex items-start space-x-3 mb-4 ${isCurrentUser ? "flex-row-reverse space-x-reverse" : ""}`}
                              >
                                <Avatar className="h-8 w-8 ring-2 ring-offset-2 ring-offset-slate-800 ring-blue-500/50">
                                  <AvatarImage src={message.user.profileImageUrl} />
                                  <AvatarFallback className={`text-sm ${
                                    isCurrentUser 
                                      ? "bg-gradient-to-br from-blue-500 to-indigo-600" 
                                      : "bg-gradient-to-br from-slate-600 to-slate-700"
                                  } text-white`}>
                                    {getUserInitials(message.user.firstName, message.user.lastName)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className={`flex flex-col ${isCurrentUser ? "items-end" : ""}`}>
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className="text-sm text-slate-400">
                                      {formatTime(message.createdAt)}
                                    </span>
                                  </div>
                                  <div className={`rounded-2xl px-4 py-2 max-w-md ${
                                    isCurrentUser
                                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                                      : "bg-slate-700/50 backdrop-blur-sm text-white"
                                  }`}>
                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </motion.div>
                      )}
                    </ScrollArea>
                    <div className="p-4 border-t border-slate-700/50">
                      <form onSubmit={handleSendMessage} className="flex space-x-2">
                        <Input
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          placeholder="Введите сообщение..."
                          className="flex-1 bg-slate-700/50 backdrop-blur-sm border-slate-600/50 text-white placeholder:text-slate-400 focus:border-blue-500/50"
                        />
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button 
                            type="submit" 
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-indigo-600 hover:to-blue-500 text-white"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      </form>
                    </div>
                  </CardContent>
                </>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full p-8 text-center"
                >
                  <motion.div animate={glowingAnimation}>
                    <MessageCircle className="h-20 w-20 text-blue-400 mb-4" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-white mb-2">Выберите диалог</h3>
                  <p className="text-slate-300">
                    Выберите диалог из списка слева или начните новый
                  </p>
                </motion.div>
              )}
            </Card>
          </motion.div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
