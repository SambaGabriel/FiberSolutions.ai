
import { GoogleGenAI, Type } from "@google/genai";
import { AuditResult, AuditStatus, MapAnalysisResult, UnitRates } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const AUDIT_SYSTEM_INSTRUCTION = `
Você é uma IA especialista em auditoria de construção de redes de fibra óptica (FTTH/Backbone).
Seu objetivo é analisar fotos de campo e identificar componentes (postes, cabos, caixas de emenda, snowshoes) e erros de execução (fios baixos, falta de reserva técnica, falta de identificação, desordem).
Responda sempre em JSON estruturado.
`;

const getMapSystemInstruction = (rates?: UnitRates) => `
Você é um Especialista Sênior em Engenharia OSP e Geoespacial (GIS).
Sua missão é analisar projetos de fibra óptica vindos de Mapas (Imagem/PDF) ou arquivos Google Earth (KML/XML).

TABELA DE PREÇOS DO CONTRATO (UNIT RATES) OBRIGATÓRIA:
Use EXATAMENTE estes valores para calcular o 'estimatedLaborCost':
${rates ? JSON.stringify(rates, null, 2) : "Use standard US averages."}

CÁLCULO FINANCEIRO:
1. Multiplique a metragem total de cabos (Strand/Fiber) pelas taxas de 'strand' ou 'fiber'.
2. Multiplique a contagem de ativos (Anchors, Snowshoes, etc) pelas suas taxas unitárias.
3. Some tudo em 'estimatedLaborCost'.

OBJETIVOS:
1. **Contagem Precisa:** Conte Snowshoes, Âncoras, Risers e Coils.
2. **Warehouse Pick List:** Gere uma lista de materiais clara para o Lineman retirar no armazém (ex: "5000ft Fiber", "12 Anchors").
3. **Análise Técnica:** Identifique anomalias ou oportunidades de otimização de fusão.
`;

// --- EXISTING AUDIT FUNCTIONS ---

export const analyzeConstructionImage = async (base64Image: string): Promise<AuditResult> => {
    try {
        // Updated to gemini-3-pro-preview as requested for "Analyze images" feature
        const model = 'gemini-3-pro-preview'; 

        const response = await ai.models.generateContent({
            model: model,
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: 'image/jpeg',
                            data: base64Image
                        }
                    },
                    {
                        text: "Analise esta foto de construção de rede de fibra óptica. Identifique itens instalados (postes, cordoalhas, caixas, reservas técnicas). Verifique se há falhas (tensão incorreta, falta de snowshoe, desorganização). Forneça um status de conformidade e pontuação."
                    }
                ]
            },
            config: {
                systemInstruction: AUDIT_SYSTEM_INSTRUCTION,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        complianceScore: { type: Type.NUMBER, description: "Nota de 0 a 100 da qualidade da instalação" },
                        status: { type: Type.STRING, enum: ["COMPLIANT", "DIVERGENT", "CRITICAL"] },
                        detectedItems: { type: Type.ARRAY, items: { type: Type.STRING } },
                        issues: { type: Type.ARRAY, items: { type: Type.STRING } },
                        aiSummary: { type: Type.STRING, description: "Breve resumo técnico da análise" }
                    },
                    required: ["complianceScore", "status", "detectedItems", "issues", "aiSummary"]
                }
            }
        });

        const jsonText = response.text || "{}";
        const result = JSON.parse(jsonText);

        let mappedStatus = AuditStatus.PENDING;
        if (result.status === 'COMPLIANT') mappedStatus = AuditStatus.COMPLIANT;
        else if (result.status === 'DIVERGENT') mappedStatus = AuditStatus.DIVERGENT;
        else if (result.status === 'CRITICAL') mappedStatus = AuditStatus.CRITICAL;

        return {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            status: mappedStatus,
            complianceScore: result.complianceScore || 0,
            detectedItems: result.detectedItems || [],
            issues: result.issues || [],
            aiSummary: result.aiSummary || "Análise concluída.",
            imageUrl: `data:image/jpeg;base64,${base64Image}`
        };

    } catch (error) {
        console.error("Erro na análise Gemini:", error);
        return {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            status: AuditStatus.PENDING,
            complianceScore: 0,
            detectedItems: [],
            issues: ["Erro ao conectar com a IA. Tente novamente."],
            aiSummary: "Não foi possível realizar a análise automática.",
            imageUrl: `data:image/jpeg;base64,${base64Image}`
        };
    }
};

export const analyzeMapBoQ = async (inputData: string, mimeType: string = 'image/jpeg', rates?: UnitRates): Promise<MapAnalysisResult> => {
    try {
        const model = 'gemini-2.5-flash';

        const parts = [];
        
        if (mimeType === 'application/vnd.google-earth.kml+xml' || mimeType === 'text/xml') {
            parts.push({
                text: `DADOS KML/XML DO PROJETO GOOGLE EARTH:\n\n${inputData}`
            });
        } else {
            parts.push({
                inlineData: {
                    mimeType: mimeType, 
                    data: inputData
                }
            });
        }

        parts.push({
            text: "Realize a auditoria completa OSP. Conte Snowshoes, Âncoras, Risers e Coils. Calcule metragens. Gere a lista de materiais para retirada no warehouse (Pick List). Calcule o custo de mão de obra usando as taxas fornecidas."
        });

        const response = await ai.models.generateContent({
            model: model,
            contents: {
                parts: parts
            },
            config: {
                systemInstruction: getMapSystemInstruction(rates),
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        totalCableLength: { type: Type.NUMBER, description: "Soma total de todos os spans detectados (em pés)" },
                        cableType: { type: Type.STRING, description: "Tipo de fibra predominante (ex: 48ct, 96ct, 288ct)" },
                        spanCount: { type: Type.NUMBER, description: "Número de vãos (spans) contados" },
                        equipmentCounts: { 
                            type: Type.ARRAY, 
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING, description: "Nome (Snowshoe, Anchor, Coil, Riser, Splice Case)" },
                                    quantity: { type: Type.NUMBER }
                                }
                            }
                        },
                        financials: {
                            type: Type.OBJECT,
                            properties: {
                                estimatedLaborCost: { type: Type.NUMBER, description: "Soma: (Metragem * Taxa) + (Ativos * Taxa)" },
                                estimatedMaterialCost: { type: Type.NUMBER },
                                potentialSavings: { type: Type.NUMBER }
                            }
                        },
                        materialList: {
                            type: Type.ARRAY,
                            description: "Lista exata de materiais para retirada no Warehouse",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    item: { type: Type.STRING },
                                    quantity: { type: Type.NUMBER },
                                    unit: { type: Type.STRING }
                                }
                            }
                        },
                        detectedAnomalies: { type: Type.ARRAY, items: { type: Type.STRING } },
                        spliceRecommendation: {
                            type: Type.OBJECT,
                            properties: {
                                location: { type: Type.STRING },
                                reason: { type: Type.STRING },
                                action: { type: Type.STRING }
                            }
                        }
                    }
                }
            }
        });

        const jsonText = response.text || "{}";
        return JSON.parse(jsonText) as MapAnalysisResult;

    } catch (error) {
        console.error("Erro na análise de Mapa Gemini:", error);
        return {
            totalCableLength: 0,
            cableType: "Desconhecido",
            spanCount: 0,
            equipmentCounts: [],
            financials: {
                estimatedLaborCost: 0,
                estimatedMaterialCost: 0,
                potentialSavings: 0
            },
            materialList: [],
            detectedAnomalies: [
                "Falha no processamento do arquivo ou chave de API inválida.",
            ],
            spliceRecommendation: undefined
        };
    }
}

// --- NEW AI FEATURES ---

// 1. IMAGE EDITING (gemini-2.5-flash-image)
export const editImageWithGemini = async (base64Image: string, prompt: string): Promise<string | null> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: 'image/png', // Assuming PNG for edit output compatibility, input can be jpeg
                            data: base64Image
                        }
                    },
                    { text: prompt }
                ]
            }
        });
        
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
        return null;
    } catch (error) {
        console.error("Error editing image:", error);
        throw error;
    }
};

// 2. VIDEO GENERATION (Veo)
export const generateVideoWithVeo = async (base64Image: string, prompt: string, aspectRatio: '16:9' | '9:16' = '16:9'): Promise<string> => {
    try {
        // Veo requires its own paid key check in some environments
        if ((window as any).aistudio && (window as any).aistudio.hasSelectedApiKey) {
            const hasKey = await (window as any).aistudio.hasSelectedApiKey();
            if (!hasKey) {
                throw new Error("VEO_KEY_REQUIRED");
            }
        }

        // Create a new instance for Veo calls to ensure key freshness if selected via UI
        const veoAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        let operation = await veoAi.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            image: {
                imageBytes: base64Image,
                mimeType: 'image/png', // Assuming standardized input
            },
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: aspectRatio
            }
        });

        // Polling
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            operation = await veoAi.operations.getVideosOperation({ operation: operation });
        }

        const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!videoUri) throw new Error("No video URI returned");

        // Fetch the actual video bytes
        const videoResponse = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
        const blob = await videoResponse.blob();
        return URL.createObjectURL(blob);

    } catch (error) {
        console.error("Veo Error:", error);
        throw error;
    }
};

// 3. AUDIO TRANSCRIPTION (gemini-2.5-flash)
export const transcribeAudio = async (base64Audio: string, mimeType: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: base64Audio
                        }
                    },
                    { text: "Transcribe this audio exactly as spoken." }
                ]
            }
        });
        return response.text || "";
    } catch (error) {
        console.error("Transcription error:", error);
        return "Error transcribing audio.";
    }
};

// 4. CHAT WITH TOOLS (Search, Maps, Thinking)
export const createChatSession = (thinkingMode: boolean = false) => {
    const model = thinkingMode ? 'gemini-3-pro-preview' : 'gemini-3-pro-preview'; // Request asks for 3-pro for chatbot
    
    const tools: any[] = [
        { googleSearch: {} },
        { googleMaps: {} }
    ];

    const config: any = {
        tools: tools,
        systemInstruction: "You are an expert Field Solutions AI assistant. Use Google Search to find up-to-date info and Google Maps for location data when asked. If the user asks for complex reasoning, use your thinking capabilities."
    };

    if (thinkingMode) {
        // Must use gemini-3-pro-preview and specific thinking budget
        config.thinkingConfig = { thinkingBudget: 32768 };
        // config.maxOutputTokens should NOT be set when using thinkingConfig
    }

    return ai.chats.create({
        model: model,
        config: config
    });
};
