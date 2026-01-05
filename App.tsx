
import React, { useState, useMemo, useCallback, useRef } from 'react';
import ChatInterface from './components/ChatInterface';
import TryOnPanel from './components/TryOnPanel';
import { SAMPLE_GARMENTS } from './constants';
import { Garment, TryOnResult } from './types';
import { getAIService } from './services/serviceFactory';

const App: React.FC = () => {
  const [garments, setGarments] = useState<Garment[]>(SAMPLE_GARMENTS);
  const [selectedGarments, setSelectedGarments] = useState<Garment[]>([]);
  const [isBuilderMode, setIsBuilderMode] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [agentComment, setAgentComment] = useState<string | null>(null);
  const [externalStyleRequest, setExternalStyleRequest] = useState<{ garmentName: string; description: string; category: string } | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [voiceTranscription, setVoiceTranscription] = useState<{ text: string; role: string } | null>(null);

  // Custom Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState<string>('');
  const garmentInputRef = useRef<HTMLInputElement>(null);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    garments.forEach(g => g.tags.forEach(t => tags.add(t)));
    return Array.from(tags);
  }, [garments]);

  const filteredGarments = useMemo(() => {
    if (!activeTag) return garments;
    return garments.filter(g => g.tags.includes(activeTag));
  }, [activeTag, garments]);

  const toggleGarment = (garment: Garment) => {
    setSelectedGarments(prev => {
      const isSelected = prev.find(g => g.id === garment.id);

      if (!isBuilderMode) {
        return isSelected ? [] : [garment];
      }

      if (isSelected) {
        return prev.filter(g => g.id !== garment.id);
      } else {
        return [...prev, garment];
      }
    });
  };

  const handleGarmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStep('Scanning Texture...');

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;

        setUploadStep('AI Analyzing silhouette...');
        const result = await getAIService().processGarment(base64);

        setUploadStep('Enhancing Studio quality...');
        const finalImage = result.enhancedImage || base64;

        const newGarment: Garment = {
          id: `custom-${Date.now()}`,
          name: result.name,
          description: result.description,
          category: result.category as any,
          fit: result.fit as any,
          imageUrl: finalImage,
          tags: result.tags
        };

        setGarments(prev => [newGarment, ...prev]);
        setIsUploading(false);
        setUploadStep('');
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      alert("Failed to process garment. Ensure the image is clear.");
      setIsUploading(false);
    }
  };

  const handleStyleAdvice = (e: React.MouseEvent, garment: Garment) => {
    e.stopPropagation();

    const chatContainer = document.querySelector('.chat-interface-container');
    chatContainer?.classList.add('ring-4', 'ring-indigo-500/20', 'scale-[1.01]');
    setTimeout(() => chatContainer?.classList.remove('ring-4', 'ring-indigo-500/20', 'scale-[1.01]'), 1000);

    setExternalStyleRequest({
      garmentName: garment.name,
      description: garment.description,
      category: garment.category
    });
    setTimeout(() => setExternalStyleRequest(null), 100);
  };

  const handleTryOnComplete = async (result: TryOnResult) => {
    if (result.recommendation) {
      setAgentComment(result.recommendation);
      setTimeout(() => setAgentComment(null), 100);
    }
  };

  const handleVoiceTranscription = useCallback((text: string, role: string) => {
    setVoiceTranscription({ text, role });
    setTimeout(() => setVoiceTranscription(null), 50);
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-8 lg:p-12 flex flex-col max-w-[1600px] mx-auto gap-8 relative">
      {/* Image Preview Overlay */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl w-full flex flex-col items-center">
            <img
              src={previewImage}
              className="max-h-[85vh] w-auto rounded-3xl shadow-2xl border-4 border-white animate-in zoom-in-95 duration-500"
              alt="Preview"
            />
            <button className="absolute -top-6 -right-6 w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-900 shadow-2xl hover:scale-110 transition-transform">
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="animate-in fade-in slide-in-from-left duration-700">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <span className="text-indigo-600">Style</span>
            <span className="font-light italic text-gray-500">Studio</span>
          </h1>
          <p className="text-gray-500 mt-1 font-medium">Premium AI Fashion Assistant & Virtual Try-On</p>
        </div>
        <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right duration-700">
          <div className="glass px-5 py-2.5 rounded-2xl flex items-center gap-3 shadow-md border border-white/40">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-inner">
              <i className="fas fa-crown"></i>
            </div>
            <span className="text-sm font-bold text-gray-700 tracking-tight">Premium Member</span>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 h-auto lg:h-[calc(100vh-15rem)]">
        {/* Left: Chat - 4 Columns */}
        <div className="lg:col-span-4 h-full min-h-[500px] chat-interface-container transition-all duration-500 rounded-3xl">
          <ChatInterface
            onAgentMessage={(msg) => console.log("Agent said:", msg)}
            externalMessage={agentComment}
            externalStyleRequest={externalStyleRequest}
            voiceTranscription={voiceTranscription}
          />
        </div>

        {/* Center: Try On Studio - 5 Columns */}
        <div className="lg:col-span-5 h-full min-h-[600px]">
          <TryOnPanel
            selectedGarments={selectedGarments}
            onTryOnComplete={handleTryOnComplete}
            isBuilderMode={isBuilderMode}
          />
        </div>

        {/* Right: Catalog & Trends - 3 Columns */}
        <div className="lg:col-span-3 h-full flex flex-col gap-6 overflow-hidden">
          {/* Collection Section */}
          <div className="glass rounded-3xl h-[60%] flex flex-col shadow-xl overflow-hidden border border-white/50">
            <div className="p-5 flex flex-col h-full overflow-hidden">
              <div className="flex flex-col gap-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                      <i className="fas fa-tshirt text-sm"></i>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Collection</h3>
                  </div>
                </div>

                <div className="bg-gray-200/50 p-1.5 rounded-2xl border border-white/20 flex shadow-inner relative">
                  <button
                    onClick={() => {
                      setIsBuilderMode(false);
                      if (selectedGarments.length > 1) setSelectedGarments([selectedGarments[0]]);
                    }}
                    className={`flex-1 py-2 rounded-xl text-[11px] font-black tracking-wide uppercase transition-all duration-300 z-10 ${!isBuilderMode ? 'bg-white shadow-lg text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Classic
                  </button>
                  <button
                    onClick={() => setIsBuilderMode(true)}
                    className={`flex-1 py-2 rounded-xl text-[11px] font-black tracking-wide uppercase transition-all duration-300 z-10 ${isBuilderMode ? 'bg-indigo-600 shadow-lg text-white' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Builder
                  </button>
                </div>

                <button
                  onClick={() => garmentInputRef.current?.click()}
                  disabled={isUploading}
                  className={`w-full group relative py-3 rounded-2xl border-2 border-dashed transition-all flex items-center justify-center gap-3 overflow-hidden ${isUploading ? 'border-indigo-400 bg-indigo-50' : 'border-indigo-200 bg-white/40 hover:bg-white hover:border-indigo-400'
                    }`}
                >
                  {isUploading ? (
                    <p className="text-[10px] font-black text-indigo-700 uppercase animate-pulse">{uploadStep}</p>
                  ) : (
                    <>
                      <i className="fas fa-plus text-indigo-500"></i>
                      <span className="text-[11px] font-black uppercase text-gray-700 tracking-widest">Add Piece</span>
                    </>
                  )}
                </button>
                <input type="file" ref={garmentInputRef} className="hidden" accept="image/*" onChange={handleGarmentUpload} />
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                {filteredGarments.map((garment) => {
                  const isSelected = selectedGarments.some(g => g.id === garment.id);
                  const selectionIndex = selectedGarments.findIndex(g => g.id === garment.id);

                  return (
                    <div
                      key={garment.id}
                      onClick={() => toggleGarment(garment)}
                      className={`group relative p-4 rounded-3xl border premium-card-hover cursor-pointer overflow-hidden ${isSelected
                        ? 'border-indigo-600 bg-white scale-[1.02] ring-4 ring-indigo-600/20 z-10 shadow-2xl shadow-indigo-500/10'
                        : 'border-white/40 bg-white/30'
                        }`}
                    >
                      <div className="flex gap-4 relative z-10">
                        <div className="relative flex-shrink-0 group/img overflow-hidden rounded-2xl shadow-md bg-white">
                          <img
                            src={garment.imageUrl}
                            className="w-24 h-32 rounded-2xl object-cover transition-all duration-700 hover:scale-110"
                            alt={garment.name}
                          />
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 w-7 h-7 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-[10px] font-black shadow-xl border-2 border-white z-30 animate-in zoom-in duration-300">
                              {isBuilderMode ? selectionIndex + 1 : <i className="fas fa-check"></i>}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[8px] font-black uppercase tracking-widest block ${isSelected ? 'text-indigo-600' : 'text-gray-400'}`}>
                                {garment.category}
                              </span>
                              <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md ${isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                {garment.fit}
                              </span>
                            </div>
                            <h4 className={`font-bold leading-tight truncate text-sm transition-colors ${isSelected ? 'text-indigo-900' : 'text-gray-900'}`}>
                              {garment.name}
                            </h4>
                            <div className="flex gap-1 mt-2 flex-wrap">
                              {garment.tags.slice(0, 2).map(tag => (
                                <span key={tag} className="text-[7px] font-black uppercase tracking-tighter bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">{tag}</span>
                              ))}
                            </div>
                          </div>
                          <button
                            onClick={(e) => handleStyleAdvice(e, garment)}
                            className={`mt-3 w-full py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${isSelected
                              ? 'bg-indigo-600 text-white shadow-lg'
                              : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white'
                              }`}
                          >
                            <i className="fas fa-wand-magic-sparkles"></i>
                            Style Tips
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Style News & Trends Section */}
          <div className="glass rounded-3xl flex-1 flex flex-col shadow-xl overflow-hidden border border-white/50">
            <div className="p-5 flex flex-col h-full overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-lg">
                  <i className="fas fa-newspaper text-sm"></i>
                </div>
                <h3 className="text-lg font-bold text-gray-800 tracking-tight">Style News</h3>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {[
                  { title: "Milan Fashion Week", desc: "Minimalism is back with structured wool-blend overcoats and neutral palettes.", time: "2h ago", tag: "Trend" },
                  { title: "Sustainability in Silk", desc: "Explore the new eco-certified cerulean dyes making waves in premium wrap dresses.", time: "5h ago", tag: "Innovation" },
                  { title: "Leather Aesthetics", desc: "Classic crimson and deep charcoal are the definitive colors for this winter's outerwear.", time: "1d ago", tag: "Style" }
                ].map((news, i) => (
                  <div key={i} className="bg-white/40 border border-white/50 rounded-2xl p-4 premium-card-hover cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[8px] font-black bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full uppercase tracking-widest">{news.tag}</span>
                      <span className="text-[8px] text-gray-400 font-bold uppercase">{news.time}</span>
                    </div>
                    <h5 className="text-xs font-black text-gray-900 mb-1 leading-tight">{news.title}</h5>
                    <p className="text-[10px] text-gray-500 leading-relaxed font-medium line-clamp-2">{news.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="glass rounded-3xl p-5 flex flex-col md:flex-row items-center justify-between text-xs text-gray-600 gap-4 border border-white/40 shadow-sm mt-auto">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <p className="font-semibold">&copy; 2024 AI Style Studio. Powered by AI.</p>
        </div>
        <div className="flex gap-8 font-bold uppercase tracking-widest text-[10px]">
          <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
          <a href="#" className="hover:text-indigo-600 transition-colors">Terms</a>
          <a href="#" className="hover:text-indigo-600 transition-colors">Support</a>
        </div>
      </footer>
    </div>
  );
};

export default App;
