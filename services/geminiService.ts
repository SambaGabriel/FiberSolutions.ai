import { GoogleGenAI, Type } from "@google/genai";
import { AuditResult, AuditStatus, MapAnalysisResult } from "../types";

// Initialize Gemini Client
// Note: process.env.API_KEY is injected by the runtime environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const AUDIT_SYSTEM_INSTRUCTION = `
Você é uma IA especialista em auditoria de construção de redes de fibra óptica (FTTH/Backbone).
Seu objetivo é analisar fotos de campo e identificar componentes (postes, cabos, caixas de emenda, snowshoes) e erros de execução (fios baixos, falta de reserva técnica, falta de identificação, desordem).
Responda sempre em JSON estruturado.
`;

const MAP_SYSTEM_INSTRUCTION = `
Você é um Especialista Sênior em Engenharia OSP e Geoespacial (GIS).
Sua missão é analisar projetos de fibra óptica vindos de Mapas (Imagem/PDF) ou arquivos Google Earth (KML/XML).

MODO DE ANÁLISE GEOSPACIAL (KML/KMZ):
Se receber texto XML/KML:
1. Analise as tags <Coordinates>. Calcule a distância real geoespacial entre os pontos (Haversine).
2. Verifique a topografia implícita (se houver dados de altitude).
3. Identifique <Placemark> como ativos (Postes, Caixas).
4. Identifique <LineString> como cabos.

MODO DE ANÁLISE VISUAL (IMAGEM/PDF):
1. **SPLICE POINTS & OTIMIZAÇÃO:** Identifique caixas, analise a topologia visual (esquinas, finais de rua).
2. **LEITURA DE ATIVOS:** Conte EXATAMENTE a quantidade de:
   - "Snowshoes" (Reservas técnicas de cabo)
   - "Anchors" (Âncoras de solo / Guy wires)
   - "Coils" (Rolos de cabo em poste)
   - "Risers" (Descidas de cabo com proteção/U-Guard)
3. **METRAGEM:** Some os valores numéricos dos spans visualizados ou estime baseado na escala.

OBJETIVO FINAL:
Gere um Bill of Quantities (BoQ) preciso e recomende o melhor ponto de fusão (Splice Optimization).
`;

export const analyzeConstructionImage = async (base64Image: string): Promise<AuditResult> => {
    try {
        const model = 'gemini-2.5-flash'; 

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

        // Map string status to Enum
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
        // Fallback ZEROED (No fake data)
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

export const analyzeMapBoQ = async (inputData: string, mimeType: string = 'image/jpeg'): Promise<MapAnalysisResult> => {
    try {
        const model = 'gemini-2.5-flash';

        // Preparar o conteúdo baseada se é KML (Texto) ou Imagem/PDF (Binário Base64)
        const parts = [];
        
        if (mimeType === 'application/vnd.google-earth.kml+xml' || mimeType === 'text/xml') {
            // Tratamento para KML (Texto)
            parts.push({
                text: `DADOS KML/XML DO PROJETO GOOGLE EARTH:\n\n${inputData}`
            });
        } else {
            // Tratamento para Imagem/PDF (Base64)
            parts.push({
                inlineData: {
                    mimeType: mimeType, 
                    data: inputData
                }
            });
        }

        parts.push({
            text: "Realize a auditoria completa OSP. Conte Snowshoes, Âncoras, Risers e Coils. Calcule metragens. RECOMENDE O PONTO DE SPLICE IDEAL."
        });

        const response = await ai.models.generateContent({
            model: model,
            contents: {
                parts: parts
            },
            config: {
                systemInstruction: MAP_SYSTEM_INSTRUCTION,
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
                                estimatedLaborCost: { type: Type.NUMBER },
                                estimatedMaterialCost: { type: Type.NUMBER },
                                potentialSavings: { type: Type.NUMBER, description: "Valor potencial de economia detectado" }
                            }
                        },
                        detectedAnomalies: { type: Type.ARRAY, items: { type: Type.STRING } },
                        spliceRecommendation: {
                            type: Type.OBJECT,
                            properties: {
                                location: { type: Type.STRING, description: "Local sugerido para a fusão (Poste ID ou referência)" },
                                reason: { type: Type.STRING, description: "Motivo técnico da escolha" },
                                action: { type: Type.STRING, description: "Ação sugerida" }
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
        // Fallback ZEROED (No fake data)
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
            detectedAnomalies: [
                "Falha no processamento do arquivo ou chave de API inválida.",
                "Nenhum dado pôde ser extraído."
            ],
            spliceRecommendation: undefined
        };
    }
}