import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Send, Bot, User } from 'lucide-react'; // İkonlar için
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'; // Tablo bileşenleri için
// Bot mesajları için maksimum karakter limiti
const MAX_MESSAGE_LENGTH = 300;
/**
 * Plan karşılaştırma verilerini tablo olarak gösteren yardımcı bileşen.
 */
const PlanComparisonTable = ({ plans }) => {
    if (!plans || plans.length === 0) {
        return <p className="text-gray-600 dark:text-gray-400">Karşılaştırılacak plan bulunamadı.</p>;
    }

    return (
        <div className="overflow-x-auto w-full  mt-4 rounded-lg shadow-md">
            <Table className="min-w-full bg-white dark:bg-gray-800">
                <TableHeader className="bg-gray-100 dark:bg-gray-700">
                    <TableRow>
                        <TableHead className="w-[150px] font-semibold text-gray-700 dark:text-gray-200">Özellik</TableHead>
                        {plans.map(plan => (
                            <TableHead key={plan.plan_id} className="text-center font-semibold text-gray-700 dark:text-gray-200">
                                {plan.plan_name} ({plan.provider_name})
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow className="bg-gray-50 dark:bg-gray-700">
                        <TableCell colSpan={plans.length + 1} className="font-bold text-lg text-blue-600 dark:text-blue-400">Genel Bilgiler</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-medium">Sağlayıcı</TableCell>
                        {plans.map(plan => (
                            <TableCell key={plan.plan_id} className="text-center">{plan.provider_name}</TableCell>
                        ))}
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-medium">Kategori</TableCell>
                        {plans.map(plan => (
                            <TableCell key={plan.plan_id} className="text-center">{plan.category_name || 'Bilinmiyor'}</TableCell>
                        ))}
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-medium">Fiyat</TableCell>
                        {plans.map(plan => (
                            <TableCell key={plan.plan_id} className="text-center font-bold text-blue-600 dark:text-blue-400">
                                {plan.price} {plan.currency}
                            </TableCell>
                        ))}
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-medium">Özellikler Özeti</TableCell>
                        {plans.map(plan => (
                            <TableCell key={plan.plan_id} className="text-center text-sm">
                                {plan.features_summary || 'Belirtilmemiş.'}
                            </TableCell>
                        ))}
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-medium">Detay Linki</TableCell>
                        {plans.map(plan => (
                            <TableCell key={plan.plan_id} className="text-center">
                                {plan.link ? (
                                    <a href={plan.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                        Görüntüle
                                    </a>
                                ) : (
                                    'Yok'
                                )}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    );
};

/**
 * AIChatbot bileşeni, web hosting konularında yapay zeka ile sohbet arayüzü sağlar.
 * Kullanıcıların sorularını sormasına ve yapay zeka yanıtlarını görmesine olanak tanır.
 */
const AIChatbot = ({ onClose }) => {
    const [messages, setMessages] = useState([]); // Sohbet mesajlarını tutar
    const [input, setInput] = useState(''); // Kullanıcı girişini tutar
    const [isTyping, setIsTyping] = useState(false); // Yapay zekanın yazıp yazmadığını belirtir
    const messagesEndRef = useRef(null); // Sohbet kutusunu aşağı kaydırmak için referans
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';


    // Sohbet kutusunu her yeni mesajda aşağı kaydırır
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    /**
     * Kullanıcının mesajını gönderir ve yapay zeka yanıtını backend API'sinden alır.
     */
    const handleSendMessage = async () => {
        if (input.trim() === '') return;

        const userMessage = { sender: 'user', text: input.trim() };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setInput('');
        setIsTyping(true); // Yapay zeka yazıyor...

        try {
            // Backend API'sine istek gönder

            const response = await fetch(`${API_BASE_URL}/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ message: userMessage.text }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Yapay zeka yanıtı alınamadı.');
            }

            const data = await response.json();

            // Yanıt tipine göre mesajı ayarla
            let aiMessage;
            if (data.type === 'structured' && Array.isArray(data.data)) {
                aiMessage = { sender: 'bot', type: 'structured', data: data.data };
            } else {
                aiMessage = { sender: 'bot', type: 'text', text: data.reply };
            }

            setMessages((prevMessages) => [...prevMessages, aiMessage]);

        } catch (error) {
            setMessages((prevMessages) => [...prevMessages, { sender: 'bot', type: 'text', text: 'Üzgünüm, şu anda yanıt veremiyorum. Lütfen daha sonra tekrar deneyin.' }]);
            throw new Error('Yapay zeka yanıtı alınırken hata:', error);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <Card className="fixed w-80 h-[500px] bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col z-50">
            <CardHeader className="flex flex-row items-center justify-between border-b dark:border-gray-700 py-3 px-4">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Bot className="h-6 w-6 text-blue-600" /> KolayHosting AI Asistanı
                </CardTitle>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-8 w-8 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                    aria-label="Sohbeti Kapat"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.length === 0 && (
                    <div className="text-center text-gray-500 dark:text-gray-300 mt-10">
                        Merhaba! Size web hosting konusunda nasıl yardımcı olabilirim?
                    </div>
                )}
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        {msg.sender === 'bot' && (
                            <Bot className="h-7 w-7 text-blue-600 flex-shrink-0" />
                        )}
                        <div className={`
                            max-w-[75%] p-3 rounded-xl shadow-sm
                            ${msg.sender === 'user'
                                ? 'bg-blue-500 text-white rounded-br-none' // Kullanıcı mesajı
                                : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-bl-none' // Bot mesajı
                            }
                            ${msg.type === 'structured' ? '!max-w-full !rounded-none !rounded-b-lg' : ''}
                        `}>
                            {msg.type === 'text' ? (
                                <LongTextMessage content={msg.text} />
                            ) : (
                                <PlanComparisonTable plans={msg.data} />
                            )}
                        </div>
                        {msg.sender === 'user' && (
                            <User className="h-7 w-7 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                        )}
                    </div>
                ))}
                {isTyping && (
                    <div className="flex items-end gap-2 justify-start">
                        <Bot className="h-7 w-7 text-blue-600 flex-shrink-0" />
                        <div className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 p-3 rounded-xl rounded-bl-none">
                            <div className="flex space-x-1">
                                <span className="animate-bounce" style={{ animationDelay: '0s' }}>.</span>
                                <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>.</span>
                                <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </CardContent>
            <div className="border-t dark:border-gray-700 p-4 flex items-center gap-2">
                <Input
                    type="text"
                    placeholder="Sorunuzu buraya yazın..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-grow focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    disabled={isTyping}
                />
                <Button onClick={handleSendMessage} disabled={isTyping}>
                    <Send className="h-5 w-5" />
                    <span className="sr-only">Gönder</span>
                </Button>
            </div>
        </Card>
    );
};

// Uzun metin mesajlarını yönetmek için yeni yardımcı bileşen
const LongTextMessage = ({ content }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const shouldTruncate = content.length > MAX_MESSAGE_LENGTH;
    const displayedContent = shouldTruncate && !isExpanded
        ? `${content.substring(0, MAX_MESSAGE_LENGTH)}...`
        : content;

    return (
        <div>
            <p className="break-words">{displayedContent}</p>
            {shouldTruncate && (
                <Button
                    variant="link"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-0 h-auto mt-1 text-blue-400 hover:text-blue-300 dark:text-blue-300 dark:hover:text-blue-200"
                >
                    {isExpanded ? 'Daha az göster' : 'Daha fazla oku'}
                </Button>
            )}
        </div>
    );
};

export default AIChatbot;

