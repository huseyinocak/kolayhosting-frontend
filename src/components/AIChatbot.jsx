import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Send, Bot, User } from 'lucide-react'; // İkonlar için
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'; // Tablo bileşenleri için

/**
 * Plan karşılaştırma verilerini tablo olarak gösteren yardımcı bileşen.
 */
const PlanComparisonTable = ({ plans }) => {
    if (!plans || plans.length === 0) {
        return <p className="text-gray-600 dark:text-gray-400">Karşılaştırılacak plan bulunamadı.</p>;
    }

    return (
        <div className="overflow-x-auto w-full">
            <Table className="min-w-full bg-white dark:bg-gray-800 rounded-md overflow-hidden shadow-sm">
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
            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
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
        <div className="relative h-full w-full">
            <Card className="flex flex-col h-full w-full shadow-lg rounded-lg overflow-hidden">
                <CardHeader className="bg-blue-600 dark:bg-blue-800 text-white py-3 px-4 flex-shrink-0 flex justify-between items-center">
                    <CardTitle className="text-xl font-bold flex items-center">
                        <Bot className="mr-2" /> KolayHosting AI Asistanı
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow p-4 overflow-y-auto space-y-4 bg-gray-50 dark:bg-gray-700">
                    {messages.length === 0 && (
                        <div className="text-center text-gray-500 dark:text-gray-300 mt-10">
                            Merhaba! Size web hosting konusunda nasıl yardımcı olabilirim?
                        </div>
                    )}
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex items-start ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`flex items-center p-3 rounded-lg max-w-[80%] ${
                                    msg.sender === 'user'
                                        ? 'bg-blue-500 text-white rounded-br-none'
                                        : 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-100 rounded-bl-none'
                                } ${msg.type === 'structured' ? 'block !items-start !max-w-full' : ''}`}
                            >
                                {msg.sender === 'bot' && msg.type === 'text' && <Bot className="h-5 w-5 mr-2 flex-shrink-0" />}
                                {msg.type === 'text' ? (
                                    <p className="text-sm">{msg.text}</p>
                                ) : (
                                    <PlanComparisonTable plans={msg.data} />
                                )}
                                {msg.sender === 'user' && <User className="h-5 w-5 ml-2 flex-shrink-0" />}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex items-start justify-start">
                            <div className="flex items-center p-3 rounded-lg bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-100 rounded-bl-none">
                                <Bot className="h-5 w-5 mr-2 flex-shrink-0" />
                                <span className="animate-pulse">Yapay zeka yazıyor...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </CardContent>
                <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600 flex-shrink-0">
                    <div className="flex space-x-2">
                        <Input
                            type="text"
                            placeholder="Sorunuzu buraya yazın..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            className="flex-grow"
                            disabled={isTyping}
                        />
                        <Button onClick={handleSendMessage} disabled={isTyping}>
                            <Send className="h-5 w-5" />
                            <span className="sr-only">Gönder</span>
                        </Button>
                    </div>
                </div>
            </Card>
            <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-900 shadow-md z-20"
                aria-label="Sohbeti Kapat"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </Button>
        </div>
    );
};

export default AIChatbot;

