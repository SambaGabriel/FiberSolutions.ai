
import React, { useState, useRef } from 'react';
import { editImageWithGemini, generateVideoWithVeo } from '../services/geminiService';
import { Image as ImageIcon, Clapperboard, Wand2, UploadCloud, Download, Play, RefreshCw, X, Film } from 'lucide-react';
import FiberLoader from './FiberLoader';

const MediaStudio: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'image' | 'video'>('image');
    
    // --- IMAGE STATE ---
    const [imgFile, setImgFile] = useState<string | null>(null);
    const [editPrompt, setEditPrompt] = useState('');
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    
    // --- VIDEO STATE ---
    const [videoSourceImg, setVideoSourceImg] = useState<string | null>(null);
    const [videoPrompt, setVideoPrompt] = useState('');
    const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
    const [isVideoGenerating, setIsVideoGenerating] = useState(false);
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
    const [veoKeyError, setVeoKeyError] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // -- HANDLERS --

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const res = reader.result as string;
                if (type === 'image') {
                    setImgFile(res);
                    setEditedImage(null);
                } else {
                    setVideoSourceImg(res);
                    setGeneratedVideo(null);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEditImage = async () => {
        if (!imgFile || !editPrompt) return;
        setIsEditing(true);
        try {
            const base64 = imgFile.split(',')[1];
            const result = await editImageWithGemini(base64, editPrompt);
            if (result) {
                setEditedImage(result);
            } else {
                alert("Não foi possível editar a imagem.");
            }
        } catch (error) {
            console.error(error);
            alert("Erro na edição.");
        } finally {
            setIsEditing(false);
        }
    };

    const handleGenerateVideo = async () => {
        if (!videoSourceImg) return;
        setIsVideoGenerating(true);
        setVeoKeyError(false);
        try {
            const base64 = videoSourceImg.split(',')[1];
            const videoUrl = await generateVideoWithVeo(base64, videoPrompt || "Animate this image", aspectRatio);
            setGeneratedVideo(videoUrl);
        } catch (error: any) {
            console.error(error);
            if (error.message === "VEO_KEY_REQUIRED") {
                setVeoKeyError(true);
            } else {
                alert("Erro na geração de vídeo: " + error.message);
            }
        } finally {
            setIsVideoGenerating(false);
        }
    };

    const handleSelectKey = async () => {
        if ((window as any).aistudio?.openSelectKey) {
            await (window as any).aistudio.openSelectKey();
            // User selected key, try again? Usually re-trigger or ask user to click generate again.
            setVeoKeyError(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4">
            {/* Header / Tabs */}
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Clapperboard className="w-8 h-8 text-fs-brand" /> Media Studio
                    </h2>
                    <p className="text-slate-400 mt-1">Ferramentas Criativas Gemini & Veo</p>
                </div>
                
                <div className="bg-[#0b1121] p-1 rounded-xl border border-white/5 flex gap-1">
                    <button 
                        onClick={() => setActiveTab('image')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'image' ? 'bg-fs-brand text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        <ImageIcon className="w-4 h-4" /> Editor de Imagem
                    </button>
                    <button 
                        onClick={() => setActiveTab('video')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'video' ? 'bg-fs-brand text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        <Film className="w-4 h-4" /> Veo Video Gen
                    </button>
                </div>
            </div>

            {/* CONTENT AREA */}
            <div className="glass-panel rounded-3xl p-8 border border-white/10 min-h-[500px]">
                
                {/* --- IMAGE EDITOR TAB --- */}
                {activeTab === 'image' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div 
                                onClick={() => !imgFile && fileInputRef.current?.click()}
                                className={`
                                    relative aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden
                                    ${imgFile ? 'border-white/20' : 'border-slate-700 hover:border-fs-brand/50 cursor-pointer bg-slate-900/50'}
                                `}
                            >
                                {imgFile ? (
                                    <>
                                        <img src={imgFile} alt="Source" className="w-full h-full object-contain" />
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setImgFile(null); setEditedImage(null); }}
                                            className="absolute top-2 right-2 p-2 bg-black/60 rounded-full text-white hover:bg-red-500/80 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </>
                                ) : (
                                    <div className="text-center p-6">
                                        <UploadCloud className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                                        <p className="text-sm font-bold text-white">Carregar Imagem</p>
                                    </div>
                                )}
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'image')} />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase">Prompt de Edição</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={editPrompt} 
                                        onChange={(e) => setEditPrompt(e.target.value)}
                                        placeholder="Ex: Add a safety helmet to the worker" 
                                        className="flex-1 bg-[#02040a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-fs-brand outline-none"
                                    />
                                    <button 
                                        onClick={handleEditImage}
                                        disabled={!imgFile || !editPrompt || isEditing}
                                        className="bg-fs-brand px-4 rounded-xl text-white hover:bg-fs-brandHover disabled:opacity-50"
                                    >
                                        <Wand2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#02040a] rounded-2xl border border-white/10 flex items-center justify-center relative overflow-hidden">
                            {isEditing ? (
                                <div className="text-center space-y-4">
                                    <FiberLoader size={60} text="Editando Pixels..." />
                                </div>
                            ) : editedImage ? (
                                <>
                                    <img src={editedImage} alt="Edited" className="w-full h-full object-contain" />
                                    <a href={editedImage} download="edited-image.png" className="absolute bottom-4 right-4 bg-fs-brand p-3 rounded-xl text-white shadow-lg hover:scale-105 transition-transform">
                                        <Download className="w-5 h-5" />
                                    </a>
                                </>
                            ) : (
                                <div className="text-slate-600 text-sm font-medium">O resultado aparecerá aqui</div>
                            )}
                        </div>
                    </div>
                )}

                {/* --- VIDEO VEO TAB --- */}
                {activeTab === 'video' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div 
                                onClick={() => !videoSourceImg && fileInputRef.current?.click()}
                                className={`
                                    relative aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden
                                    ${videoSourceImg ? 'border-white/20' : 'border-slate-700 hover:border-purple-500/50 cursor-pointer bg-slate-900/50'}
                                `}
                            >
                                {videoSourceImg ? (
                                    <>
                                        <img src={videoSourceImg} alt="Source" className="w-full h-full object-contain" />
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setVideoSourceImg(null); setGeneratedVideo(null); }}
                                            className="absolute top-2 right-2 p-2 bg-black/60 rounded-full text-white hover:bg-red-500/80 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </>
                                ) : (
                                    <div className="text-center p-6">
                                        <UploadCloud className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                                        <p className="text-sm font-bold text-white">Carregar Imagem Base</p>
                                    </div>
                                )}
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'video')} />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Aspect Ratio</label>
                                    <div className="flex bg-[#02040a] p-1 rounded-lg border border-white/10">
                                        <button onClick={() => setAspectRatio('16:9')} className={`flex-1 py-2 text-xs font-bold rounded ${aspectRatio === '16:9' ? 'bg-purple-600 text-white' : 'text-slate-500'}`}>16:9</button>
                                        <button onClick={() => setAspectRatio('9:16')} className={`flex-1 py-2 text-xs font-bold rounded ${aspectRatio === '9:16' ? 'bg-purple-600 text-white' : 'text-slate-500'}`}>9:16</button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase">Prompt de Animação</label>
                                <textarea 
                                    value={videoPrompt} 
                                    onChange={(e) => setVideoPrompt(e.target.value)}
                                    placeholder="Ex: Cinematic drone shot of the field, moving forward..." 
                                    className="w-full bg-[#02040a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none min-h-[80px]"
                                />
                            </div>

                            {veoKeyError ? (
                                <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-xl text-center">
                                    <p className="text-purple-300 text-sm font-bold mb-3">Necessário Chave de API Paga para Veo</p>
                                    <button onClick={handleSelectKey} className="bg-purple-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-purple-500 transition-colors">
                                        Selecionar Chave
                                    </button>
                                    <div className="mt-2 text-xs text-slate-400">
                                        <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline hover:text-white">Ver documentação de faturamento</a>
                                    </div>
                                </div>
                            ) : (
                                <button 
                                    onClick={handleGenerateVideo}
                                    disabled={!videoSourceImg || isVideoGenerating}
                                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 py-4 rounded-xl text-white font-bold shadow-lg hover:shadow-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isVideoGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-white" />}
                                    {isVideoGenerating ? 'Gerando com Veo...' : 'Gerar Vídeo'}
                                </button>
                            )}
                        </div>

                        <div className="bg-[#02040a] rounded-2xl border border-white/10 flex items-center justify-center relative overflow-hidden aspect-video lg:aspect-auto">
                            {isVideoGenerating ? (
                                <div className="text-center space-y-4 px-6">
                                    <FiberLoader size={80} text="Veo está criando..." />
                                    <p className="text-xs text-slate-500 max-w-xs mx-auto">Isso pode levar alguns minutos. Aguarde.</p>
                                </div>
                            ) : generatedVideo ? (
                                <video src={generatedVideo} controls autoPlay loop className="w-full h-full object-contain" />
                            ) : (
                                <div className="text-slate-600 text-sm font-medium flex flex-col items-center">
                                    <Film className="w-12 h-12 mb-2 opacity-50" />
                                    O vídeo aparecerá aqui
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default MediaStudio;
