
import React, { useState, useEffect, useRef } from 'react';
import { Layers, AlertCircle, Maximize2, Globe, Mountain, Satellite, UploadCloud, Box, Eye, Crosshair, Zap, FileJson, CheckCircle2, LocateFixed, RefreshCw, Navigation, Tag, Info, Menu, Camera, Share2, Trash2, Download, Check, Settings, Image as ImageIcon, Copy, Map as MapIcon, X } from 'lucide-react';
import FiberLoader from './FiberLoader';

// Declaration for global libraries loaded via CDN
declare const L: any;
declare const JSZip: any;
declare const toGeoJSON: any;

const MapViewer: React.FC = () => {
    const [hasFile, setHasFile] = useState(false);
    const [fileName, setFileName] = useState('');
    const [loading, setLoading] = useState(false);
    const [gpsActive, setGpsActive] = useState(false);
    const [showLabels, setShowLabels] = useState(true); 
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [showMenu, setShowMenu] = useState(false);
    
    // Map State for Layer Switching
    const [mapType, setMapType] = useState<'hybrid' | 'roadmap'>('hybrid');
    const [mapInstance, setMapInstance] = useState<any>(null);

    const mapContainerRef = useRef<HTMLDivElement>(null);
    const geoJsonLayerRef = useRef<any>(null);
    const userMarkerRef = useRef<any>(null);
    const accuracyCircleRef = useRef<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const tileLayerRef = useRef<any>(null);

    // 1. Initialize Map Structure
    useEffect(() => {
        if (!mapContainerRef.current) return;
        if (mapInstance) return;

        // Init Leaflet Map
        const map = L.map(mapContainerRef.current, {
            center: [-23.5505, -46.6333], // Default SP
            zoom: 18, 
            maxZoom: 23, 
            zoomControl: false,
            attributionControl: false 
        });

        setMapInstance(map);

        return () => {
            map.off();
            map.remove();
        };
    }, []);

    // 2. Setup GPS Event Listeners (Separated to ensure context)
    useEffect(() => {
        if (!mapInstance) return;

        const handleLocationFound = (e: any) => {
            const radius = e.accuracy / 2;
            const latlng = e.latlng;

            // Create User Icon
            const userIcon = L.divIcon({
                className: 'bg-transparent',
                html: `<div class="relative flex h-4 w-4 transform -translate-x-1.5 -translate-y-1.5">
                          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-fs-brand opacity-75"></span>
                          <span class="relative inline-flex rounded-full h-4 w-4 bg-fs-brand border-2 border-white shadow-lg"></span>
                       </div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });

            // Update or Create Marker
            if (userMarkerRef.current) {
                userMarkerRef.current.setLatLng(latlng);
                userMarkerRef.current.setIcon(userIcon);
                if (accuracyCircleRef.current) {
                    accuracyCircleRef.current.setLatLng(latlng);
                    accuracyCircleRef.current.setRadius(radius);
                }
            } else {
                userMarkerRef.current = L.marker(latlng, { icon: userIcon, zIndexOffset: 1000 }).addTo(mapInstance);
                accuracyCircleRef.current = L.circle(latlng, { radius: radius, color: '#FF5500', fillOpacity: 0.05, weight: 1 }).addTo(mapInstance);
                
                userMarkerRef.current.bindPopup(`
                    <div class="font-sans text-center">
                        <h3 class="font-bold text-slate-900">Minha Posição</h3>
                        <p class="text-xs text-slate-500">Precisão: ~${Math.round(radius)}m</p>
                    </div>
                `);
            }

            // Fly to location on first fix or update
            mapInstance.flyTo(latlng, 19, { animate: true, duration: 1.5 });

            setGpsActive(true);
            setLoading(false);
            setErrorMsg(null);
        };

        const handleLocationError = (e: any) => {
            setLoading(false);
            setGpsActive(false);
            
            let msg = "Erro desconhecido no GPS.";
            if (e.code === 1) msg = "Permissão de GPS negada. Verifique as configurações do navegador.";
            else if (e.code === 2) msg = "Sinal de GPS indisponível no momento.";
            else if (e.code === 3) msg = "O GPS demorou muito para responder (Timeout).";
            
            console.warn("GPS Error:", e.message);
            setErrorMsg(msg);
        };

        mapInstance.on('locationfound', handleLocationFound);
        mapInstance.on('locationerror', handleLocationError);

        return () => {
            mapInstance.off('locationfound', handleLocationFound);
            mapInstance.off('locationerror', handleLocationError);
        };
    }, [mapInstance]);

    // 3. Handle Tile Layers
    useEffect(() => {
        if (!mapInstance) return;

        if (tileLayerRef.current) {
            mapInstance.removeLayer(tileLayerRef.current);
        }

        const googleHybrid = 'http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}';
        const googleRoadmap = 'http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
        const url = mapType === 'hybrid' ? googleHybrid : googleRoadmap;

        tileLayerRef.current = L.tileLayer(url, {
            maxZoom: 23,
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
            attribution: '© Google Maps'
        }).addTo(mapInstance);

    }, [mapInstance, mapType]);

    // 4. Handle Labels Toggle
    useEffect(() => {
        if (geoJsonLayerRef.current) {
            geoJsonLayerRef.current.eachLayer((layer: any) => {
                if (layer.getTooltip()) {
                    if (showLabels) {
                        layer.openTooltip();
                    } else {
                        layer.closeTooltip();
                    }
                }
            });
        }
    }, [showLabels]);


    const toggleGPS = () => {
        if (!mapInstance) return;
        if (loading) return; // Prevent double clicks/race conditions

        if (gpsActive) {
            // STOP GPS
            mapInstance.stopLocate();
            if (userMarkerRef.current) {
                mapInstance.removeLayer(userMarkerRef.current);
                userMarkerRef.current = null;
            }
            if (accuracyCircleRef.current) {
                mapInstance.removeLayer(accuracyCircleRef.current);
                accuracyCircleRef.current = null;
            }
            setGpsActive(false);
            setLoading(false);
        } else {
            // START GPS
            setLoading(true);
            setErrorMsg(null);
            
            // Force browser permission check by calling locate
            mapInstance.locate({ 
                setView: false, // We handle view manually in event for better control
                maxZoom: 21,
                enableHighAccuracy: true,
                watch: true,
                timeout: 15000 
            });
        }
    };

    const processGeoJSON = (geojson: any) => {
        if (!mapInstance) return;

        if (geoJsonLayerRef.current) {
            mapInstance.removeLayer(geoJsonLayerRef.current);
        }

        const geoLayer = L.geoJSON(geojson, {
            style: (feature: any) => {
                return {
                    color: '#3b82f6', 
                    weight: 3, 
                    opacity: 0.9,
                    dashArray: feature.properties?.name?.includes('Strand') ? '5, 5' : null
                };
            },
            pointToLayer: (feature: any, latlng: any) => {
                const name = feature.properties?.name?.toLowerCase() || '';
                
                let isBox = name.includes('cx') || name.includes('splice') || name.includes('box') || name.includes('ceo') || name.includes('cto');
                let isAnchor = name.includes('ancora') || name.includes('anchor') || name.includes('guy') || name.includes('estai');
                let isIssue = name.includes('alert') || name.includes('erro') || name.includes('atencao');
                
                let marker;

                if (isBox) {
                    const boxIcon = L.divIcon({
                        className: 'bg-transparent',
                        html: `
                            <div class="relative w-6 h-6 bg-cyan-500 border-2 border-white rounded-sm shadow-[0_0_15px_rgba(6,182,212,0.8)] flex items-center justify-center transform hover:scale-125 transition-transform z-50">
                                <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
                            </div>
                        `,
                        iconSize: [24, 24],
                        iconAnchor: [12, 12]
                    });
                    marker = L.marker(latlng, { icon: boxIcon, zIndexOffset: 100 });
                } else if (isAnchor) {
                     const anchorIcon = L.divIcon({
                        className: 'bg-transparent',
                        html: `
                            <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)] transform hover:scale-125 transition-transform"></div>
                        `,
                        iconSize: [12, 12],
                        iconAnchor: [6, 6]
                    });
                    marker = L.marker(latlng, { icon: anchorIcon, zIndexOffset: 50 });
                } else if (isIssue) {
                     const issueIcon = L.divIcon({
                        className: 'bg-transparent',
                        html: `
                            <div class="relative w-4 h-4 bg-amber-500 rounded-full border-2 border-white shadow-lg">
                                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            </div>
                        `,
                        iconSize: [16, 16],
                        iconAnchor: [8, 8]
                    });
                    marker = L.marker(latlng, { icon: issueIcon, zIndexOffset: 200 });
                } else {
                    marker = L.circleMarker(latlng, {
                        radius: 4,
                        fillColor: '#10b981',
                        color: '#fff',
                        weight: 1.5,
                        opacity: 1,
                        fillOpacity: 1
                    });
                }

                if (feature.properties?.name) {
                    marker.bindTooltip(feature.properties.name, {
                        permanent: true,
                        direction: (isBox || isAnchor) ? 'bottom' : 'top',
                        className: 'pole-label',
                        offset: (isBox || isAnchor) ? [0, 10] : [0, -4],
                        opacity: 1
                    });
                }

                return marker;
            },
            onEachFeature: (feature: any, layer: any) => {
                if (feature.properties) {
                    const name = feature.properties.name || 'Objeto Sem Nome';
                    
                    layer.bindPopup(`
                        <div class="font-sans min-w-[150px]">
                            <h3 class="font-bold text-sm text-slate-900">${name}</h3>
                            <div class="mt-2 text-[10px] text-slate-400 font-mono">
                                ${layer.getLatLng ? `${layer.getLatLng().lat.toFixed(5)}, ${layer.getLatLng().lng.toFixed(5)}` : ''}
                            </div>
                        </div>
                    `);
                }
            }
        }).addTo(mapInstance);

        geoJsonLayerRef.current = geoLayer;

        try {
            const bounds = geoLayer.getBounds();
            if (bounds.isValid()) {
                mapInstance.fitBounds(bounds, { 
                    padding: [50, 50], 
                    animate: true, 
                    duration: 1.5,
                    maxZoom: 19 
                });
            }
        } catch (e) {
            console.log("Could not fit bounds");
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setErrorMsg(null);
        setFileName(file.name);
        setHasFile(false);

        try {
            let kmlString = "";

            if (file.name.toLowerCase().endsWith('.kmz')) {
                if (!(window as any).JSZip) throw new Error("Biblioteca JSZip não carregada.");
                const zip = await JSZip.loadAsync(file);
                const kmlFile = Object.values(zip.files).find((f: any) => f.name.toLowerCase().endsWith('.kml')) as any;
                if (!kmlFile) throw new Error("Arquivo KML não encontrado dentro do KMZ.");
                kmlString = await kmlFile.async('string');
            } else {
                kmlString = await file.text();
            }

            const parser = new DOMParser();
            const kmlDom = parser.parseFromString(kmlString, 'text/xml');
            
            if (!(window as any).toGeoJSON) throw new Error("Biblioteca toGeoJSON não carregada.");
            const geojson = toGeoJSON.kml(kmlDom);

            if (!geojson || !geojson.features || geojson.features.length === 0) {
                throw new Error("Nenhuma coordenada válida encontrada no arquivo.");
            }

            setHasFile(true);
            processGeoJSON(geojson);

        } catch (err: any) {
            console.error(err);
            setErrorMsg(err.message || "Erro ao processar arquivo de mapa.");
        } finally {
            setLoading(false);
        }
    };

    const resetMap = () => {
        setHasFile(false);
        setFileName('');
        setShowMenu(false);
        if (geoJsonLayerRef.current && mapInstance) {
            mapInstance.removeLayer(geoJsonLayerRef.current);
            geoJsonLayerRef.current = null;
        }
        if (mapInstance) {
             mapInstance.setView([-23.5505, -46.6333], 18);
        }
    };
    
    // -- ACTIONS --

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500 pb-6">
            
            {/* Header Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        Mapas
                        {hasFile && <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full uppercase tracking-wider font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Online
                        </span>}
                    </h2>
                    <p className="text-slate-400 font-light">
                        {hasFile ? `Visualizando: ${fileName}` : 'Importe seu arquivo .KMZ ou .KML do Google Earth'}
                    </p>
                </div>
                
                {hasFile && (
                    <div className="flex gap-3">
                         <button 
                            onClick={resetMap}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span className="font-bold text-sm">Trocar Arquivo</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Main Stage */}
            <div className="relative flex-1 rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl bg-[#020617] group perspective-container">
                
                {/* 1. UPLOAD OVERLAY */}
                {!hasFile && !loading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-[1000] bg-slate-900/90 backdrop-blur-md">
                         <div 
                            onClick={triggerFileInput}
                            className="text-center max-w-lg p-12 border-2 border-dashed border-slate-700 rounded-3xl hover:border-fs-brand/50 hover:bg-slate-800/50 transition-all group/drop cursor-pointer bg-slate-900/50"
                         >
                                <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 group-hover/drop:scale-110 group-hover/drop:shadow-glow transition-all duration-500 border border-white/5">
                                    <Globe className="w-12 h-12 text-fs-brand" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Importar Google Earth</h3>
                                <p className="text-slate-400 mb-8 leading-relaxed">
                                    Suporte nativo para arquivos <strong>.KMZ e .KML</strong>. <br/>
                                    A plataforma extrai automaticamente rotas e ativos.
                                </p>
                                
                                {errorMsg && (
                                    <div className="mb-6 bg-rose-500/20 text-rose-400 p-3 rounded-xl border border-rose-500/30 text-sm font-medium flex items-center justify-center gap-2 animate-pulse">
                                        <AlertCircle className="w-4 h-4" /> {errorMsg}
                                    </div>
                                )}

                                <div className="bg-action-gradient text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg hover:-translate-y-1 transition-all inline-flex items-center gap-3">
                                    <UploadCloud className="w-5 h-5" />
                                    Selecionar Arquivo
                                </div>
                                
                                <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    onChange={handleFileUpload} 
                                    accept=".kml,.kmz,.xml,application/vnd.google-earth.kml+xml,application/vnd.google-earth.kmz" 
                                    className="hidden" 
                                />
                            </div>
                         <div className="mt-8 flex items-center gap-2 text-slate-500 text-sm">
                             <Navigation className="w-4 h-4" />
                             Ou utilize o GPS para visualizar sua posição no mapa vazio
                             <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    setHasFile(true); 
                                    // Pequeno delay para garantir que o estado 'hasFile' propagou e o componente não está desmontando
                                    setTimeout(() => toggleGPS(), 100);
                                }} 
                                disabled={loading}
                                className="text-fs-brand font-bold hover:underline ml-1 disabled:opacity-50 disabled:cursor-not-allowed"
                             >
                                 Abrir Mapa GPS
                             </button>
                         </div>
                    </div>
                )}

                {/* 2. LOADING STATE WITH CANCEL */}
                {loading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-[1001] bg-slate-900/90 backdrop-blur-md p-6 text-center">
                        <FiberLoader size={80} text={gpsActive || !hasFile ? 'Buscando Satélites...' : 'Espinando Mapa...'} />
                        <button 
                            onClick={() => {
                                if(gpsActive) toggleGPS(); // Reuse stop logic
                                setLoading(false);
                            }}
                            className="mt-6 px-6 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-white/10 flex items-center gap-2 transition-colors"
                        >
                            <X className="w-4 h-4" /> Cancelar
                        </button>
                    </div>
                )}

                {/* 3. MAP CONTAINER */}
                <div 
                    id="map" 
                    ref={mapContainerRef} 
                    className="w-full h-full bg-[#020617] z-0"
                    style={{ transformOrigin: 'center bottom' }} 
                ></div>

                {/* Floating Map Controls (Right) */}
                <div className="absolute top-6 right-6 flex flex-col items-end gap-3 z-[400]">
                    
                    {/* MENU TOGGLE */}
                    <div className="relative">
                        <button 
                            onClick={() => setShowMenu(!showMenu)}
                            className={`
                                p-3 backdrop-blur-md rounded-xl border transition-all shadow-lg group
                                ${showMenu
                                    ? 'bg-fs-brand text-white border-fs-brand shadow-glow' 
                                    : 'bg-slate-900/90 text-white border-white/10 hover:bg-slate-800'
                                }
                            `}
                            title="Menu de Opções"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        {/* DROPDOWN MENU */}
                        {showMenu && (
                            <div className="absolute top-0 right-14 w-64 bg-[#0a0f1e]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-right-2 z-50">
                                <div className="p-3 border-b border-white/5 bg-white/5">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Settings className="w-3 h-3" /> Opções de Visualização
                                    </p>
                                </div>
                                
                                <div className="p-2 space-y-1">
                                    <p className="px-3 pt-2 pb-1 text-[10px] font-bold text-fs-brand uppercase">Camadas</p>
                                    <button 
                                        onClick={() => setMapType('hybrid')}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${mapType === 'hybrid' ? 'bg-fs-brand/20 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                    >
                                        <div className="flex items-center gap-2"><Satellite className="w-4 h-4" /> Satélite Híbrido</div>
                                        {mapType === 'hybrid' && <Check className="w-3 h-3 text-fs-brand" />}
                                    </button>
                                    <button 
                                        onClick={() => setMapType('roadmap')}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${mapType === 'roadmap' ? 'bg-fs-brand/20 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                    >
                                        <div className="flex items-center gap-2"><MapIcon className="w-4 h-4" /> Mapa de Ruas</div>
                                        {mapType === 'roadmap' && <Check className="w-3 h-3 text-fs-brand" />}
                                    </button>

                                    <div className="h-px bg-white/5 my-1" />

                                    {/* ACTIONS */}
                                    <button 
                                        onClick={() => {
                                            if (!mapInstance) return;
                                            const center = mapInstance.getCenter();
                                            navigator.clipboard.writeText(`${center.lat.toFixed(6)}, ${center.lng.toFixed(6)}`);
                                            alert("Coordenadas copiadas!");
                                            setShowMenu(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium text-left"
                                    >
                                        <Copy className="w-4 h-4 text-blue-400" />
                                        Copiar Coordenadas
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* GPS Toggle Button */}
                    <button 
                        onClick={toggleGPS}
                        disabled={loading}
                        className={`
                            p-3 backdrop-blur-md rounded-xl border transition-all shadow-lg group relative
                            ${gpsActive 
                                ? 'bg-fs-brand text-white border-fs-brand shadow-glow' 
                                : 'bg-slate-900/80 text-white border-white/10 hover:bg-slate-800'
                            }
                            ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                        title={gpsActive ? "Desativar GPS" : "Minha Localização"}
                    >
                        {gpsActive ? (
                            <Crosshair className="w-5 h-5 animate-pulse" />
                        ) : (
                            <Navigation className="w-5 h-5" />
                        )}
                    </button>

                    {/* Show/Hide Labels Toggle */}
                    {hasFile && (
                        <button 
                            onClick={() => setShowLabels(!showLabels)}
                            className={`
                                p-3 backdrop-blur-md rounded-xl border transition-all shadow-lg group mt-2
                                ${showLabels 
                                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' 
                                    : 'bg-slate-900/80 text-slate-400 border-white/10 hover:bg-slate-800'
                                }
                            `}
                            title="Mostrar/Ocultar Números dos Postes"
                        >
                            <Tag className="w-5 h-5" />
                        </button>
                    )}

                    <button 
                        onClick={() => {
                            if (mapInstance) mapInstance.zoomIn();
                        }}
                        className="p-3 bg-slate-900/80 backdrop-blur-md rounded-xl text-white border border-white/10 hover:bg-fs-brand transition-colors shadow-lg mt-2"
                    >
                        <Maximize2 className="w-5 h-5" />
                    </button>
                    
                    <button 
                        onClick={() => {
                            if (geoJsonLayerRef.current && mapInstance) {
                                mapInstance.fitBounds(geoJsonLayerRef.current.getBounds(), { animate: true });
                            } else if (gpsActive && userMarkerRef.current && mapInstance) {
                                mapInstance.flyTo(userMarkerRef.current.getLatLng(), 19);
                            }
                        }}
                        className="p-3 bg-slate-900/80 backdrop-blur-md rounded-xl text-white border border-white/10 hover:bg-fs-brand transition-colors shadow-lg mt-2"
                        title="Recentralizar Rota"
                    >
                        <LocateFixed className="w-5 h-5" />
                    </button>
                </div>

                {/* Fixed Overlay Info (Bottom Left) */}
                {hasFile && (
                    <div className="absolute bottom-6 left-6 flex flex-col gap-2 z-[400] pointer-events-none">
                         {fileName && (
                            <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-2 border-l-4 border-l-fs-brand pointer-events-auto">
                                <FileJson className="w-4 h-4 text-fs-brand" />
                                <span className="text-xs font-bold text-white max-w-[200px] truncate">{fileName}</span>
                            </div>
                         )}
                         <div className="text-[10px] text-slate-500 px-2">© Google Maps {mapType === 'hybrid' ? 'Satellite' : 'Roadmap'}</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MapViewer;
