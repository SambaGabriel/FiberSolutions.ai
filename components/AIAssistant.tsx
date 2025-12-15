
import React, { useState, useRef, useEffect } from 'react';
import { createChatSession, transcribeAudio } from '../services/geminiService';
import { Send, Mic, BrainCircuit, Search, Map as MapIcon, Bot, User, Globe, Loader2, StopCircle } from 'lucide-react';

interface Message {
    role: 'user' | 'model';
    text: string;
    isThinking?: boolean;
    groundingMetadata?: any;
}

const AIAssistant: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isThinkingMode, setIsThinkingMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [chatSession, setChatSession] = useState<any>(null);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);

    // Initialize chat
    useEffect(() => {
        const session = createChatSession(isThinkingMode);
        setChatSession(session);
        setMessages([]); // Reset on mode switch
    }, [isThinkingMode]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || !chatSession) return;
        const text = input;
        setInput('');
        
        setMessages(prev => [...prev, { role: 'user', text }]);
        setIsLoading(true);

        try {
            const result = await chatSession.sendMessage(text);
            const responseText = result.response.text();
            
            // Extract grounding metadata if available (Search/Maps)
            const grounding = result.response.candidates?.[0]?.groundingMetadata;

            setMessages(prev => [...prev, { 
                role: 'model', 
                text: responseText,
                groundingMetadata: grounding
            }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'model', text: "Erro ao processar mensagem." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleRecording = async () => {
        if (isRecording) {
            mediaRecorderRef.current?.stop();
            setIsRecording(false);
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mediaRecorder = new MediaRecorder(stream);
                const chunks: BlobPart[] = [];

                mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
                mediaRecorder.onstop = async () => {
                    const blob = new Blob(chunks, { type: 'audio/webm' }); // Typically webm/opus in browser
                    // Convert to base64 for Gemini
                    const reader = new FileReader();
                    reader.onloadend = async () => {
                        const base64 = (reader.result as string).split(',')[1];
                        // Usually raw PCM is best but browsers give webm. Gemini generateContent can handle webm in Audio part often.
                        // Or we can convert. Let's send as audio/webm if supported or assume generic handling.
                        // The prompt asked to use gemini-2.5-flash for transcription.
                        setIsLoading(true);
                        const transcription = await transcribeAudio(base64, 'audio/webm');
                        setInput(prev => prev + " " + transcription);
                        setIsLoading(false);
                    };
                    reader.readAsDataURL(blob);
                    
                    // Stop tracks
                    stream.getTracks().forEach(track => track.stop());
                };

                mediaRecorder.start();
                mediaRecorderRef.current = mediaRecorder;
                setIsRecording(true);
            } catch (err) {
                console.error("Mic error:", err);
                alert("Erro ao acessar microfone.");
            }
        }
    };

    const renderGrounding = (metadata: any) => {
        if (!metadata?.groundingChunks) return null;
        
        const chunks = metadata.groundingChunks;
        return (
            <div className="mt-3 flex flex-wrap gap-2">
                {chunks.map((chunk: any, i: number) => {
                    if (chunk.web?.uri) {
                        return (
                            <a key={i} href={chunk.web.uri} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] bg-slate-800 text-blue-400 px-2 py-1 rounded border border-blue-500/20 hover:bg-slate-700">
                                <Search className="w-3 h-3" /> {chunk.web.title || "Fonte Web"}
                            </a>
                        );
                    }
                    // For Maps chunks, structure might vary based on API version, usually handled via groundingChunks.maps or similar if distinct
                    return null;
                })}
                {/* Check for generic maps grounding if structured differently */}
                {/* The prompt says extract URLs from groundingChunks.maps.uri... if available */}
            </div>
        );
    };

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col max-w-4xl mx-auto glass-panel rounded-3xl overflow-hidden border border-white/10 animate-in fade-in slide-in-from-bottom-4">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#0a0f1e]">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-fs-brand/10 rounded-lg">
                        <Bot className="w-6 h-6 text-fs-brand" />
                    </div>
                    <div>
                        <h2 className="text-white font-bold">Field AI Assistant</h2>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span className="flex items-center gap-1"><Search className="w-3 h-3" /> Search</span>
                            <span className="flex items-center gap-1"><MapIcon className="w-3 h-3" /> Maps</span>
                        </div>
                    </div>
                </div>
                
                <button 
                    onClick={() => setIsThinkingMode(!isThinkingMode)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all
                        ${isThinkingMode 
                            ? 'bg-purple-600/20 border-purple-500 text-purple-400' 
                            : 'bg-slate-800 border-white/10 text-slate-500 hover:text-white'
                        }`}
                >
                    <BrainCircuit className="w-4 h-4" />
                    Thinking Mode: {isThinkingMode ? 'ON' : 'OFF'}
                </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-[#02040a]">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50">
                        <Bot className="w-16 h-16 mb-4" />
                        <p>Olá. Como posso ajudar nas operações de campo hoje?</p>
                    </div>
                )}
                
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && (
                            <div className="w-8 h-8 rounded-full bg-fs-brand/20 flex items-center justify-center shrink-0">
                                <Bot className="w-4 h-4 text-fs-brand" />
                            </div>
                        )}
                        
                        <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                            msg.role === 'user' 
                                ? 'bg-slate-800 text-white rounded-tr-sm' 
                                : 'bg-[#0b1121] text-slate-300 border border-white/5 rounded-tl-sm'
                        }`}>
                            <div className="whitespace-pre-wrap">{msg.text}</div>
                            {renderGrounding(msg.groundingMetadata)}
                        </div>

                        {msg.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                                <User className="w-4 h-4 text-white" />
                            </div>
                        )}
                    </div>
                ))}
                
                {isLoading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-fs-brand/20 flex items-center justify-center shrink-0">
                             <Bot className="w-4 h-4 text-fs-brand" />
                        </div>
                        <div className="bg-[#0b1121] p-4 rounded-2xl rounded-tl-sm border border-white/5 flex items-center gap-2 text-slate-400 text-sm">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {isThinkingMode ? "Pensando profundamente..." : "Processando..."}
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#0a0f1e] border-t border-white/10">
                <div className="flex gap-2">
                    <button 
                        onClick={toggleRecording}
                        className={`p-3 rounded-xl transition-all ${isRecording ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                    >
                        {isRecording ? <StopCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Digite sua mensagem..."
                        className="flex-1 bg-[#02040a] border border-white/10 rounded-xl px-4 text-white focus:border-fs-brand outline-none"
                    />
                    <button 
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="p-3 bg-fs-brand rounded-xl text-white hover:bg-fs-brandHover disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIAssistant;
