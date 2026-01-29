import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ArrowRight, Brain, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { api } from '@/services/api';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: "Hello! I'm your ESG Analytics Assistant. Ask me about ESG scores, company sustainability, or environmental risks. You can also mention a company symbol (like AAPL or MSFT) for specific insights.",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [company, setCompany] = useState<string>('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Extract company symbol from message
    const extractCompanySymbol = (text: string): string | null => {
        const symbolMatch = text.match(/\b([A-Z]{1,5})\b/);
        return symbolMatch ? symbolMatch[1] : null;
    };

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        // Check for company symbol in the message
        const detectedSymbol = extractCompanySymbol(input);
        const companyToUse = detectedSymbol || company;

        try {
            const response = await api.sendChatMessage(
                input,
                companyToUse || undefined,
                messages.slice(-6).map(m => ({ role: m.role, content: m.content }))
            );

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.response || "I couldn't generate a response. Please try again.",
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);

            // Update company context if detected
            if (detectedSymbol) {
                setCompany(detectedSymbol);
            }
        } catch {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "I'm having trouble connecting to the server. Please make sure the backend is running.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const quickPrompts = [
        "What is ESG?",
        "Explain environmental risk",
        "What affects controversy scores?",
    ];

    return (
        <>
            {/* Chat Button */}
            <motion.div
                className="fixed bottom-6 right-6 z-50"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: 'spring' }}
            >
                <Button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`h-14 w-14 rounded-full shadow-lg ${isOpen
                            ? 'bg-red-500 hover:bg-red-600'
                            : 'bg-gradient-to-r from-[#9429FF] to-[#9EFFCD] hover:opacity-90'
                        }`}
                >
                    <AnimatePresence mode="wait">
                        {isOpen ? (
                            <motion.div
                                key="close"
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: 90, opacity: 0 }}
                            >
                                <X className="h-6 w-6" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="open"
                                initial={{ rotate: 90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: -90, opacity: 0 }}
                            >
                                <Sparkles className="h-6 w-6" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Button>
            </motion.div>

            {/* Chat Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)]"
                    >
                        <Card className="backdrop-blur-xl bg-background/95 border-white/20 shadow-2xl overflow-hidden">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-[#9429FF] to-[#9EFFCD] p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <Brain className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white">ESG Assistant</h3>
                                        <p className="text-xs text-white/80">Powered by Groq AI</p>
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="h-[350px] overflow-y-auto p-4 space-y-4">
                                {messages.map((message) => (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                                    >
                                        <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${message.role === 'user'
                                                ? 'bg-[#9429FF]'
                                                : 'bg-gradient-to-r from-[#9429FF] to-[#9EFFCD]'
                                            }`}>
                                            {message.role === 'user' ? (
                                                <Zap className="h-4 w-4 text-white" />
                                            ) : (
                                                <Brain className="h-4 w-4 text-white" />
                                            )}
                                        </div>
                                        <div className={`max-w-[75%] p-3 rounded-2xl ${message.role === 'user'
                                                ? 'bg-[#9429FF] text-white rounded-tr-sm'
                                                : 'bg-muted rounded-tl-sm'
                                            }`}>
                                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                        </div>
                                    </motion.div>
                                ))}

                                {/* Loading indicator */}
                                {isLoading && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex gap-3"
                                    >
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#9429FF] to-[#9EFFCD] flex items-center justify-center">
                                            <Brain className="h-4 w-4 text-white" />
                                        </div>
                                        <div className="bg-muted p-3 rounded-2xl rounded-tl-sm">
                                            <div className="flex gap-1">
                                                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Quick Prompts */}
                            {messages.length <= 2 && (
                                <div className="px-4 pb-2">
                                    <div className="flex flex-wrap gap-2">
                                        {quickPrompts.map((prompt) => (
                                            <button
                                                key={prompt}
                                                onClick={() => setInput(prompt)}
                                                className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                                            >
                                                {prompt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Company Context */}
                            {company && (
                                <div className="px-4 pb-2">
                                    <span className="text-xs text-muted-foreground">
                                        Context: <span className="text-[#9EFFCD] font-medium">{company}</span>
                                    </span>
                                </div>
                            )}

                            {/* Input */}
                            <div className="p-4 border-t border-white/10">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Ask about ESG..."
                                        className="flex-1 bg-muted rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#9429FF]/50"
                                        disabled={isLoading}
                                    />
                                    <Button
                                        onClick={sendMessage}
                                        disabled={!input.trim() || isLoading}
                                        className="bg-gradient-to-r from-[#9429FF] to-[#9EFFCD] hover:opacity-90 rounded-xl px-4"
                                    >
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Chatbot;
