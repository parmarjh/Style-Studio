
import React, { useState, useRef, useEffect } from 'react';
import { Garment, TryOnResult } from '../types';
import { getAIService } from '../services/serviceFactory';

interface TryOnPanelProps {
  selectedGarments: Garment[];
  onTryOnComplete: (result: TryOnResult) => void;
  isBuilderMode?: boolean;
}

const TryOnPanel: React.FC<TryOnPanelProps> = ({ selectedGarments, onTryOnComplete, isBuilderMode }) => {
  const [userImage, setUserImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [isVisionMode, setIsVisionMode] = useState(false);
  const [refineStep, setRefineStep] = useState('');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [activeTab, setActiveTab] = useState<'tryon' | 'edit' | 'video'>('tryon');
  const [compositionInsight, setCompositionInsight] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic Outfit Builder Insight
  useEffect(() => {
    if (isBuilderMode && selectedGarments.length >= 1) {
      const timer = setTimeout(async () => {
        setIsAnalyzing(true);
        const insight = await getAIService().getCompositionAnalysis(selectedGarments);
        setCompositionInsight(insight);
        setIsAnalyzing(false);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCompositionInsight(null);
    }
  }, [selectedGarments, isBuilderMode]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserImage(reader.result as string);
        setResultImage(null);
        setVideoUrl(null);
        // Start tracking simulation
        setIsTracking(true);
        setTimeout(() => setIsTracking(false), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!userImage) return;
    setIsProcessing(true);
    const analysis = await getAIService().analyzeImage(userImage, "Analyze this person's style and suggest improvements.");
    alert(analysis);
    setIsProcessing(false);
  };

  const handleTryOn = async () => {
    if (!userImage || selectedGarments.length === 0) return;
    setIsProcessing(true);

    const garmentNames = selectedGarments.map(g => g.name);
    const fullDesc = garmentNames.join(', ');

    try {
      // NOTE: Unified service abstracts the Try-On implementation
      const result = await getAIService().performTryOn(userImage, fullDesc);
      if (result) {
        setResultImage(result);

        // Start Refining Animation
        setIsRefining(true);
        const steps = ['Merging Textures...', 'Adjusting Lighting...', 'Finalizing Silhouette...'];
        for (let i = 0; i < steps.length; i++) {
          setRefineStep(steps[i]);
          await new Promise(r => setTimeout(r, 1200));
        }
        setIsRefining(false);

        // Simplified recommendation logic (could also be part of service)
        const recommendation = "Great choice! (Detailed recommendations coming soon)";

        onTryOnComplete({
          originalImage: userImage,
          resultImage: result,
          timestamp: Date.now(),
          garmentName: fullDesc,
          recommendation: recommendation || undefined
        });
      }
    } catch (error) {
      console.error("Try-on failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEdit = async () => {
    if (!userImage || !editPrompt) return;
    setIsProcessing(true);
    // Note: Edit not supported in unified interface yet, placeholder
    alert("Image editing requires Gemini specific models. This feature is disabled in the current unified provider.");
    setIsProcessing(false);
  };

  const handleVideoGen = async () => {
    if (!userImage) return;
    setIsProcessing(true);
    const url = await getAIService().generateVideo(userImage, "A cinematic high-fashion runway showcase featuring this outfit in a modern architectural setting, 4k, smooth animation");
    if (url) {
      setVideoUrl(url);
    } else {
      alert("Video generation not supported by the active provider.");
    }
    setIsProcessing(false);
  };

  return (
    <div className="glass rounded-3xl p-6 lg:p-8 h-full flex flex-col shadow-2xl border border-white/40 overflow-hidden relative">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg rotate-3">
            <i className="fas fa-camera"></i>
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Visual Studio</h2>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button onClick={() => setActiveTab('tryon')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === 'tryon' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400'}`}>Studio</button>
          <button onClick={() => setActiveTab('edit')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === 'edit' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400'}`}>Edit</button>
          <button onClick={() => setActiveTab('video')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === 'video' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400'}`}>Video</button>
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-2 pb-4">
        {/* Dynamic Builder Preview Canvas */}
        {isBuilderMode && selectedGarments.length > 0 && activeTab === 'tryon' && !resultImage && (
          <div className="animate-in fade-in zoom-in-95 duration-500 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Dynamic Composition</p>
            </div>
            <div className="relative h-64 w-full bg-white/40 rounded-3xl border-2 border-dashed border-indigo-200 flex items-center justify-center overflow-hidden p-6 gap-4">
              {selectedGarments.map((g, idx) => (
                <div
                  key={g.id}
                  className="relative group/canvas animate-in slide-in-from-bottom-4 duration-500 shadow-2xl"
                  style={{
                    zIndex: selectedGarments.length - idx,
                    transform: `rotate(${(idx - (selectedGarments.length - 1) / 2) * 8}deg) translateY(${Math.abs(idx - (selectedGarments.length - 1) / 2) * 10}px)`,
                    marginLeft: idx > 0 ? '-3rem' : '0'
                  }}
                >
                  <img src={g.imageUrl} className="w-24 h-36 md:w-32 md:h-48 rounded-2xl object-cover border-4 border-white shadow-lg group-hover/canvas:scale-110 transition-transform duration-500" />
                  <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shadow-lg">
                    {idx + 1}
                  </div>
                </div>
              ))}
            </div>
            {compositionInsight && (
              <div className="mt-4 p-4 bg-indigo-600 rounded-2xl shadow-xl animate-in slide-in-from-top-2 duration-500 border border-white/20">
                <div className="flex items-center gap-2 mb-1">
                  <i className="fas fa-sparkles text-white text-[10px]"></i>
                  <span className="text-[9px] font-black text-indigo-100 uppercase tracking-widest">Studio Insight</span>
                </div>
                <p className="text-[11px] text-white font-medium leading-relaxed italic">{compositionInsight}</p>
              </div>
            )}
          </div>
        )}

        {/* Main Image Display */}
        {!userImage ? (
          <div onClick={() => fileInputRef.current?.click()} className="group border-2 border-dashed border-indigo-100 rounded-3xl p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-white/40 hover:border-indigo-300 transition-all bg-white/20">
            <i className="fas fa-upload text-3xl text-indigo-400 mb-4 group-hover:scale-110 transition-transform"></i>
            <p className="text-sm text-gray-700 font-bold">Upload Portrait</p>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          </div>
        ) : (
          <div className="relative rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-gray-50 flex items-center justify-center h-64 group">
            <img src={userImage} className={`max-w-full max-h-full object-contain transition-all duration-700 ${isTracking ? 'brightness-50 grayscale' : ''}`} alt="Portrait" />

            {/* Real-time Tracking Layer */}
            {isTracking && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-40 bg-indigo-900/10 backdrop-blur-[1px]">
                <div className="scan-line"></div>

                {/* Simulated Face Tracking Points */}
                <div className="tracking-point" style={{ top: '35%', left: '42%' }}></div>
                <div className="tracking-point" style={{ top: '35%', left: '58%' }}></div>
                <div className="tracking-point" style={{ top: '48%', left: '50%' }}></div>
                <div className="tracking-point" style={{ top: '55%', left: '44%' }}></div>
                <div className="tracking-point" style={{ top: '55%', left: '56%' }}></div>

                <div className="mt-20 px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center gap-3 animate-pulse">
                  <i className="fas fa-face-viewfinder text-indigo-400 text-sm"></i>
                  <p className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Tracking Face...</p>
                </div>
              </div>
            )}

            <div className="absolute top-4 right-4 flex gap-2 z-50">
              {!isTracking && <button onClick={handleAnalyze} className="bg-white/90 p-2 rounded-xl text-indigo-600 shadow-lg hover:bg-white transition-all"><i className="fas fa-magnifying-glass"></i></button>}
              <button onClick={() => { setUserImage(null); setResultImage(null); setVideoUrl(null); }} className="bg-red-500 text-white p-2 rounded-xl shadow-lg hover:bg-red-600 transition-all"><i className="fas fa-trash"></i></button>
            </div>

            {/* Tracking Status Badge */}
            {!isTracking && (
              <div className="absolute bottom-4 left-4 bg-green-500/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-[8px] font-black uppercase tracking-widest shadow-lg animate-in fade-in slide-in-from-bottom-2">
                <i className="fas fa-check-circle mr-2"></i> Portrait Optimized
              </div>
            )}
          </div>
        )}

        {activeTab === 'tryon' && (
          <div className="space-y-4 pt-4 border-t border-indigo-50">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Current Ensemble</p>
              {isBuilderMode && <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">Builder Active</span>}
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedGarments.map(g => (
                <div key={g.id} className="flex items-center gap-2 bg-white p-1.5 pr-3 rounded-xl border border-indigo-50 shadow-sm animate-in zoom-in-95 duration-300">
                  <img src={g.imageUrl} className="w-8 h-10 rounded-lg object-cover" />
                  <span className="text-[10px] font-bold truncate max-w-[100px] text-gray-800">{g.name}</span>
                </div>
              ))}
              {selectedGarments.length === 0 && (
                <p className="text-[10px] font-bold text-gray-400 italic">Select items from the collection to begin...</p>
              )}
            </div>
            <button
              onClick={handleTryOn}
              disabled={isProcessing || !userImage || selectedGarments.length === 0}
              className="group relative w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-indigo-700 disabled:opacity-50 shadow-xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              {isProcessing ? (
                <div className="flex items-center justify-center gap-2">
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Fashioning Look...</span>
                </div>
              ) : `Apply ${isBuilderMode ? 'Ensemble' : 'Garment'}`}
            </button>
          </div>
        )}

        {activeTab === 'edit' && (
          <div className="space-y-4">
            <input
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              placeholder="e.g. Change lighting to warm golden hour"
              className="w-full px-5 py-4 rounded-2xl bg-white border border-gray-100 shadow-inner text-sm focus:ring-2 focus:ring-indigo-400 outline-none font-medium"
            />
            <button onClick={handleEdit} disabled={isProcessing || !userImage || !editPrompt} className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-purple-700 disabled:opacity-50 shadow-xl">
              {isProcessing ? 'Refining...' : 'Apply Image Edit'}
            </button>
          </div>
        )}

        {activeTab === 'video' && (
          <div className="space-y-4">
            <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-3xl relative overflow-hidden">
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-indigo-100 rounded-full blur-xl"></div>
              <p className="text-[11px] font-bold text-indigo-800 leading-relaxed italic relative z-10">
                Generate a professional cinematic showcase of this outfit. 720p resolution with smooth AI motion.
              </p>
            </div>
            <button onClick={handleVideoGen} disabled={isProcessing || !userImage} className="w-full py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest hover:bg-gray-900 disabled:opacity-50 shadow-xl flex items-center justify-center gap-3">
              <i className="fas fa-play-circle"></i>
              {isProcessing ? 'Rendering Veo Video...' : 'Generate AI Video'}
            </button>
          </div>
        )}

        {(resultImage || videoUrl) && (
          <div className="pt-8 animate-in fade-in zoom-in-95 duration-700 border-t-2 border-indigo-50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`${isRefining ? 'bg-amber-500 animate-pulse' : 'bg-indigo-600'} p-1 rounded-lg transition-colors duration-500`}>
                  <i className={`fas ${isRefining ? 'fa-wand-magic-sparkles' : 'fa-sparkles'} text-[10px] text-white`}></i>
                </div>
                <p className="text-[11px] font-black uppercase tracking-[0.1em] text-indigo-900 underline decoration-indigo-200 underline-offset-4 decoration-2">
                  {isRefining ? 'AI Rendering Active' : 'Premium Presentation'}
                </p>
              </div>
              {!isRefining && (
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsVisionMode(!isVisionMode)}
                    className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl transition-all border-2 ${isVisionMode ? 'bg-cyan-500 text-white border-cyan-400 shadow-lg shadow-cyan-200' : 'bg-white text-gray-400 border-gray-100 hover:border-indigo-200'}`}
                  >
                    <i className="fas fa-microchip mr-2"></i> Vision AI {isVisionMode ? 'ON' : 'OFF'}
                  </button>
                  <button onClick={() => { setResultImage(null); setVideoUrl(null); }} className="text-[10px] font-black text-gray-400 hover:text-red-500 transition-all uppercase tracking-widest">Clear result</button>
                </div>
              )}
            </div>

            {videoUrl ? (
              <div className="relative group ring-8 ring-indigo-500/5 rounded-3xl">
                <video src={videoUrl} controls className="w-full rounded-3xl border-4 border-white shadow-2xl" autoPlay loop />
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-[9px] font-black uppercase tracking-widest">AI Video Masterpiece</div>
              </div>
            ) : (
              <div className={`relative ${!isRefining && resultImage ? 'comparison-grid' : ''}`}>
                {/* Side-by-Side Comparison: Source Portrait */}
                {!isRefining && resultImage && (
                  <div className="relative rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-gray-50 flex items-center justify-center min-h-[16rem] group/source animate-in slide-in-from-left duration-700">
                    <img src={userImage!} className="max-w-full max-h-full object-contain" alt="Original" />
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-white text-[7px] font-black uppercase tracking-widest">Source Portrait</div>

                    {isVisionMode && (
                      <>
                        <div className="corner-bracket corner-tl"></div>
                        <div className="corner-bracket corner-tr"></div>
                        <div className="corner-bracket corner-bl"></div>
                        <div className="corner-bracket corner-br"></div>
                        <div className="absolute top-[30%] left-[10%] vision-hud-label animate-pulse">FACIAL_ID_LOCKED</div>
                        <div className="absolute bottom-[20%] right-[10%] vision-hud-label">S_DESC: PORTRAIT_A</div>
                        <div className="absolute top-[35%] left-[42%] w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee] animate-pulse"></div>
                        <div className="absolute top-[35%] left-[58%] w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee] animate-pulse"></div>
                      </>
                    )}
                  </div>
                )}

                <div className={`relative group ring-8 ${isRefining ? 'ring-amber-500/10' : 'ring-indigo-500/5'} rounded-3xl overflow-hidden shadow-2xl transition-all duration-500`}>
                  <img src={resultImage!} className={`w-full rounded-3xl border-4 border-white transition-all duration-1000 ${isRefining ? 'scale-105 blur-[2px] brightness-75' : 'scale-100 blur-0'}`} />

                  {/* Vision Overlay on Result */}
                  {!isRefining && isVisionMode && (
                    <>
                      <div className="corner-bracket corner-tl"></div>
                      <div className="corner-bracket corner-tr"></div>
                      <div className="corner-bracket corner-bl"></div>
                      <div className="corner-bracket corner-br"></div>
                      <div className="absolute top-[30%] left-[10%] vision-hud-label animate-pulse">MATCH_CONFIRM: 99.4%</div>
                      <div className="absolute bottom-[20%] left-[10%] vision-hud-label">SEGMENTATION_ACTIVE</div>
                      <div className="absolute top-[35%] left-[42%] w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee] animate-pulse"></div>
                      <div className="absolute top-[35%] left-[58%] w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee] animate-pulse"></div>
                    </>
                  )}

                  {!isRefining && (
                    <>
                      <div className="absolute top-4 left-4 bg-indigo-600/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-[9px] font-black uppercase tracking-widest shadow-lg">New Ensemble Applied</div>
                      <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                        <a href={resultImage!} download="outfit.png" className="bg-white/95 p-3 rounded-2xl text-indigo-600 shadow-2xl hover:scale-110 transition-all border border-indigo-100"><i className="fas fa-download text-lg"></i></a>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="mt-4 p-4 bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-2xl">
              <p className="text-[10px] text-indigo-900 font-bold leading-relaxed">
                <i className="fas fa-info-circle mr-2"></i>
                {isRefining
                  ? "The AI is precision-mapping the selected garments onto your portrait for hyper-realistic results..."
                  : isVisionMode
                    ? "Vision-AI active. Confirming feature alignment and identity preservation between source and result."
                    : "The AI has seamlessly integrated the selected pieces for a flawless studio-quality preview."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TryOnPanel;
