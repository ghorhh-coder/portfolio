'use client';

import { useEffect, useRef, useState } from 'react';

const TOTAL_FRAMES = 121;

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const requestRef = useRef<number | null>(null);
  const targetFrameRef = useRef<number>(0);
  const currentFrameRef = useRef<number>(0);

  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [activeProjectModal, setActiveProjectModal] = useState<string | null>(null);
  const [activeOpenSourceTab, setActiveOpenSourceTab] = useState<'coolify' | 'archestra'>('coolify');
  const [activeQLinkTab, setActiveQLinkTab] = useState<'screenshots' | 'terminal'>('screenshots');
  const [activeQLinkImg, setActiveQLinkImg] = useState<number>(0);
  const [lightboxImageIndex, setLightboxImageIndex] = useState<number | null>(null);

  // ── PromptOps Video Player State ──
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoIsPlaying, setVideoIsPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoVolume, setVideoVolume] = useState(1);
  const [videoMuted, setVideoMuted] = useState(false);
  const [videoShowControls, setVideoShowControls] = useState(true);
  const videoControlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Gating system states
  const [gateUnlocked, setGateUnlocked] = useState(true); // default to true to prevent server hydration mismatches
  const [gateStep, setGateStep] = useState(0);
  const [gateQ1, setGateQ1] = useState('');
  const [gateQ2, setGateQ2] = useState('');
  const [gateQ3, setGateQ3] = useState('');
  const [gateQ4, setGateQ4] = useState('');
  const [gateQ5, setGateQ5] = useState('');
  const [rejectButtonPhase, setRejectButtonPhase] = useState<'initial' | 'transition'>('initial');
  const [supportButtonPhase, setSupportButtonPhase] = useState<'initial' | 'transition'>('initial');

  // Sync open-source tab when corresponding modal triggers
  useEffect(() => {
    if (activeProjectModal === 'coolify') {
      setActiveOpenSourceTab('coolify');
    } else if (activeProjectModal === 'archestra') {
      setActiveOpenSourceTab('archestra');
    }
  }, [activeProjectModal]);

  // Continuous button animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setRejectButtonPhase(prev => prev === 'initial' ? 'transition' : 'initial');
      setSupportButtonPhase(prev => prev === 'initial' ? 'transition' : 'initial');
    }, 2500);
    return () => clearInterval(interval);
  }, []);
  
  // Smart header state to hide/show on scroll
  const [showHeader, setShowHeader] = useState(true);
  const showHeaderRef = useRef(true);
  const lastScrollYRef = useRef(0);

  // Theme Toggle State and Persistence
  const [isLightTheme, setIsLightTheme] = useState(false);

  // Keydown listener to close active project modal, lightbox, or vetting gate on Escape & navigate lightbox with Arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (lightboxImageIndex !== null) {
          setLightboxImageIndex(null);
        } else if (activeProjectModal !== null) {
          setActiveProjectModal(null);
        } else if (!gateUnlocked) {
          unlockGate();
        }
      } else if (lightboxImageIndex !== null) {
        if (e.key === 'ArrowLeft') {
          setLightboxImageIndex(prev => prev !== null ? (prev === 0 ? 5 : prev - 1) : null);
        } else if (e.key === 'ArrowRight') {
          setLightboxImageIndex(prev => prev !== null ? (prev === 5 ? 0 : prev + 1) : null);
        }
      }
    };
    if (activeProjectModal || lightboxImageIndex !== null || !gateUnlocked) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [activeProjectModal, lightboxImageIndex, gateUnlocked]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme === 'light') {
        setIsLightTheme(true);
        document.documentElement.classList.add('light');
      }
      
      // Default to unlocked for all new visitors (gate_unlocked is null)
      // Only lock if explicitly requested
      const isExplicitlyLocked = localStorage.getItem('gate_unlocked') === 'false';
      setGateUnlocked(!isExplicitlyLocked);
    }
  }, []);

  // Vibe score calculation
  const calculateVibeScore = () => {
    let score = 70;
    if (gateQ1 === "Fully Remote (Asynchronous)") score += 10;
    if (gateQ1 === "Hybrid (Location-based)") score += 5;
    
    if (gateQ2 === "Python / FastAPI / AI Orchestration" || gateQ2 === "Next.js / React / TypeScript") score += 10;
    if (gateQ2 === "Node.js / Express / Backends") score += 5;
    
    if (gateQ3 === "Shipping high-fidelity MVPs & Product Demos rapidly") score += 10;
    if (gateQ3 === "Building frontend interfaces, heavy backend microservices & databases") score += 5;
    
    if (gateQ4 === "Competitive Salary + Equity Options") score += 10;
    if (gateQ4 === "Standard Entry-Level / Fresher Range") score += 5;
    
    return score;
  };

  // Timer loop for alignment analytics simulation (Step 6)
  useEffect(() => {
    if (gateStep === 6) {
      const timer = setTimeout(() => {
        setGateStep(7);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [gateStep]);

  const unlockGate = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gate_unlocked', 'true');
    }
    setGateUnlocked(true);
  };

  const resetGate = () => {
    setGateUnlocked(false);
    setGateStep(0);
    setGateQ1('');
    setGateQ2('');
    setGateQ3('');
    setGateQ4('');
    setGateQ5('');
  };

  const handleSelectOption = (opt: string) => {
    if (gateStep === 1) {
      setGateQ1(opt);
    } else if (gateStep === 2) {
      setGateQ2(opt);
    } else if (gateStep === 3) {
      setGateQ3(opt);
    } else if (gateStep === 4) {
      setGateQ4(opt);
    }
  };

  const handleNextStep = () => {
    if (gateStep < 5) {
      setGateStep(gateStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (gateStep > 0) {
      setGateStep(gateStep - 1);
    }
  };

  const isOptionSelected = () => {
    if (gateStep === 1) return gateQ1 !== '';
    if (gateStep === 2) return gateQ2 !== '';
    if (gateStep === 3) return gateQ3 !== '';
    if (gateStep === 4) return gateQ4 !== '';
    return true;
  };

  const getSelectedAnswer = () => {
    if (gateStep === 1) return gateQ1;
    if (gateStep === 2) return gateQ2;
    if (gateStep === 3) return gateQ3;
    if (gateStep === 4) return gateQ4;
    return '';
  };

  const questions = [
    {
      q: "What is your startup's operational work model?",
      opts: ["Fully Remote (Asynchronous)", "Hybrid (Location-based)", "On-site / Office"]
    },
    {
      q: "Which tech stack does your core product rely on?",
      opts: ["Python / FastAPI / AI Orchestration", "Next.js / React / TypeScript", "Node.js / Express / Backends", "Other / Non-JS Stacks"]
    },
    {
      q: "What is the primary operational priority for this engineering role?",
      opts: ["Shipping high-fidelity MVPs & Product Demos rapidly", "Building frontend interfaces, heavy backend microservices & databases", "Legacy codebase maintenance & refactoring"]
    },
    {
      q: "What is the budget / range allocated for this AI Product role?",
      opts: ["Competitive Salary + Equity Options", "Standard Entry-Level / Fresher Range", "Undetermined / Open to Negotiation"]
    }
  ];

  const toggleTheme = () => {
    const nextTheme = !isLightTheme;
    setIsLightTheme(nextTheme);
    if (typeof window !== 'undefined') {
      if (nextTheme) {
        document.documentElement.classList.add('light');
        localStorage.setItem('theme', 'light');
      } else {
        document.documentElement.classList.remove('light');
        localStorage.setItem('theme', 'dark');
      }
    }
  };

  // 1. Progressive ultra-fast frame loader with instant unlock & fallback streaming
  useEffect(() => {
    let loadedCount = 0;
    const images: HTMLImageElement[] = new Array(TOTAL_FRAMES);
    const CRITICAL_MIN_FRAMES = 8; // Unlock preloader almost INSTANTLY (under 250ms)

    const checkProgress = () => {
      loadedCount++;
      const progress = Math.min(100, Math.round((loadedCount / TOTAL_FRAMES) * 100));
      setLoadProgress(progress);

      if (loadedCount >= CRITICAL_MIN_FRAMES || loadedCount === TOTAL_FRAMES) {
        setLoading(false);
      }
    };

    const loadedIndices = new Set<number>();

    const fetchFrame = (i: number) => {
      if (loadedIndices.has(i)) return;
      loadedIndices.add(i);

      const img = new Image();
      const frameNum = String(i).padStart(3, '0');
      img.src = `/frames/frame_${frameNum}.jpg`;
      img.onload = () => {
        images[i] = img;
        checkProgress();
      };
      img.onerror = () => {
        checkProgress();
      };
    };

    // Priority load first 15 key frames for instant startup
    for (let i = 0; i < 15; i++) {
      fetchFrame(i);
    }

    // Stream all remaining frames concurrently in background
    for (let i = 15; i < TOTAL_FRAMES; i++) {
      fetchFrame(i);
    }

    imagesRef.current = images;
  }, []);

  // Nearest-neighbor frame fallback to guarantee 0 lag and 0 black screen
  const getBestAvailableImage = (targetIndex: number): HTMLImageElement | null => {
    const images = imagesRef.current;
    if (images[targetIndex] && images[targetIndex].complete && images[targetIndex].naturalWidth > 0) {
      return images[targetIndex];
    }
    for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
      const prev = targetIndex - offset;
      if (prev >= 0 && images[prev] && images[prev].complete && images[prev].naturalWidth > 0) {
        return images[prev];
      }
      const next = targetIndex + offset;
      if (next < TOTAL_FRAMES && images[next] && images[next].complete && images[next].naturalWidth > 0) {
        return images[next];
      }
    }
    return null;
  };

  // Canvas drawing with automatic responsive viewport scaling (half-screen & full-screen compatible)
  const drawFrame = (frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const img = getBestAvailableImage(frameIndex);

    if (!ctx || !img) return;

    const width = window.innerWidth || document.documentElement.clientWidth || 1920;
    const height = window.innerHeight || document.documentElement.clientHeight || 1080;

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    ctx.clearRect(0, 0, width, height);

    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = width / height;

    let dWidth = width;
    let dHeight = height;
    let dx = 0;
    let dy = 0;

    if (canvasRatio > imgRatio) {
      dHeight = width / imgRatio;
      dy = (height - dHeight) / 2;
    } else {
      dWidth = height * imgRatio;
      dx = (width - dWidth) / 2;
    }

    ctx.drawImage(img, dx, dy, dWidth, dHeight);
  };

  // 2. Track scroll and resize with immediate canvas update
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      if (docHeight > 0) {
        const progress = Math.max(0, Math.min(1, currentScrollY / docHeight));
        targetFrameRef.current = progress * (TOTAL_FRAMES - 1);
      }

      const lastScrollY = lastScrollYRef.current;
      const nextShowHeader = currentScrollY <= 80 || currentScrollY < lastScrollY;

      if (showHeaderRef.current !== nextShowHeader) {
        showHeaderRef.current = nextShowHeader;
        setShowHeader(nextShowHeader);
      }

      lastScrollYRef.current = currentScrollY;
    };

    const handleResize = () => {
      drawFrame(Math.round(currentFrameRef.current));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    
    handleResize();
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 3. Animation loop (lerp)
  useEffect(() => {
    const updateFrame = () => {
      const target = targetFrameRef.current;
      const current = currentFrameRef.current;
      
      const diff = target - current;
      if (Math.abs(diff) > 0.02) {
        currentFrameRef.current = current + diff * 0.18;
      } else {
        currentFrameRef.current = target;
      }

      drawFrame(Math.round(currentFrameRef.current));
      requestRef.current = requestAnimationFrame(updateFrame);
    };

    requestRef.current = requestAnimationFrame(updateFrame);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  return (
    <main className="relative bg-[#030303] text-white overflow-x-hidden selection:bg-red-500 selection:text-white flex flex-col items-center justify-start p-4 md:p-8 gap-8">
      {/* Preloader overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#030303]">
          <div className="flex flex-col items-center gap-4">
            <span className="font-sans text-xs tracking-[0.4em] font-semibold text-white/50 uppercase">
              Loading Experience
            </span>
            <div className="w-48 h-[2px] bg-white/10 rounded-full overflow-hidden relative">
              <div 
                className="h-full bg-red-500 transition-all duration-300 ease-out"
                style={{ width: `${loadProgress}%` }}
              />
            </div>
            <span className="font-sans text-[10px] tracking-wider text-red-400 font-bold">
              {loadProgress}%
            </span>
          </div>
        </div>
      )}

      {/* Screen background viewport */}
      {gateUnlocked && (
        <div className="fixed inset-0 w-full h-full z-0 overflow-hidden bg-black pointer-events-none">
          <canvas ref={canvasRef} className="w-full h-full block object-cover opacity-65 md:opacity-85" />
          
          {/* Subtle cinematic gradient vignette */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#030303]/30 via-transparent to-[#030303]/60 pointer-events-none" />
        </div>
      )}
 
      {/* Smart Header fixed at top of viewport (With responsive margins & frosted glass) */}
      {!loading && gateUnlocked && (
        <header 
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out backdrop-blur-xl bg-black/60 border-b border-white/[0.08] ${
            showHeader ? 'translate-y-0 opacity-100' : '-translate-y-24 opacity-0 pointer-events-none'
          }`}
        >
          <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-8 md:px-12 py-3 flex items-center justify-between gap-3 sm:gap-4 flex-nowrap">
            {/* Logo Badge */}
            <a 
              href="#" 
              className="font-display text-[14px] sm:text-[16px] md:text-[17px] font-extrabold tracking-[0.24em] text-white hover:text-red-500 transition-colors duration-300 select-none shrink-0"
            >
              VIBE<span className="text-red-500">CODER</span>
            </a>
   
            {/* Navigation Links - Responsively scaled */}
            <nav className="hidden sm:flex items-center flex-nowrap justify-center gap-x-2.5 sm:gap-x-4 md:gap-x-6 shrink-0">
              <a href="#about" className="text-[10px] sm:text-[11px] font-semibold tracking-[0.18em] text-zinc-400 hover:text-white transition-colors duration-300 uppercase">About</a>
              <a href="#work" className="text-[10px] sm:text-[11px] font-semibold tracking-[0.18em] text-zinc-400 hover:text-white transition-colors duration-300 uppercase">Projects</a>
              <a href="#tech" className="text-[10px] sm:text-[11px] font-semibold tracking-[0.18em] text-zinc-400 hover:text-white transition-colors duration-300 uppercase">Tech Stack</a>
              <a href="#experience" className="text-[10px] sm:text-[11px] font-semibold tracking-[0.18em] text-zinc-400 hover:text-white transition-colors duration-300 uppercase">Experience</a>
              <a href="#contact" className="text-[10px] sm:text-[11px] font-semibold tracking-[0.18em] text-zinc-400 hover:text-white transition-colors duration-300 uppercase">Contact</a>
            </nav>
   
            {/* Right actions */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0 flex-nowrap">
              {/* Vetting Gate Button - Continuous animated color cycle */}
              <button 
                onClick={resetGate}
                className="group relative inline-flex items-center gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-full bg-zinc-950/90 hover:bg-black border border-white/20 hover:border-white/40 shadow-[0_4px_15px_rgba(0,0,0,0.6)] transition-all duration-300 cursor-pointer shrink-0"
                title="Cognitive Vetting Gate Questionnaire"
              >
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
                <span className="font-black text-[9.5px] sm:text-[10.5px] tracking-[0.18em] uppercase animate-color-cycle">
                  VETTING GATE
                </span>
              </button>

              {/* Resume Header Glass Pill */}
              <a 
                href="/resume.html"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative px-3 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.12] border border-white/[0.14] hover:border-white/30 backdrop-blur-xl font-bold text-[9.5px] sm:text-[10.5px] tracking-[0.18em] text-white transition-all duration-300 uppercase flex items-center gap-1.5 shrink-0 no-underline shadow-[0_2px_10px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.25)] hover:shadow-[0_4px_15px_rgba(255,255,255,0.1),inset_0_1px_1px_rgba(255,255,255,0.4)] overflow-hidden"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out pointer-events-none" />
                <span className="relative z-10">RESUME</span>
                <svg className="relative z-10 w-3 h-3 text-zinc-300 group-hover:text-white transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </header>
      )}

      {/* Content overlays (Scrollable Layout Flow) */}
      {!loading && gateUnlocked && (
         <div className="relative z-10 w-full flex flex-col items-center gap-6 sm:gap-8">
          
          {/* Section 1: Hero Section with Safe Clearance */}
          <section className="flex flex-col justify-center items-center w-full max-w-[1440px] pl-6 pr-6 sm:pl-12 sm:pr-12 md:pl-16 md:pr-16 mx-auto pt-32 sm:pt-36 md:pt-40 lg:pt-44 pb-4 select-none relative">
            <div className="w-full relative">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-14 items-start w-full relative">
                
                {/* Left Column: Bio & Core Info */}
                <div className="md:col-span-7 lg:col-span-7 flex flex-col items-start text-left w-full">
                  
                  {/* Dynamic tag badge - Open for B2B Projects */}
                  <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 mb-5 sm:mb-6 select-none shadow-[0_2px_10px_rgba(16,185,129,0.05)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
                    <span className="text-[10px] sm:text-[10.5px] font-bold tracking-[0.2em] uppercase text-emerald-400">Open for B2B Projects</span>
                  </div>
                  
                  {/* Main Heading */}
                  <h1 className="text-[2.6rem] sm:text-[3.3rem] lg:text-[3.7rem] xl:text-[4.2rem] font-display font-black tracking-tight uppercase leading-[1.08] text-white mb-5 sm:mb-6">
                    Building <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
                      Intelligent Software
                    </span> <br />
                    for the Real World
                  </h1>
                  
                  {/* Short Description */}
                  <p className="max-w-lg text-[14.5px] sm:text-[16.5px] font-sans text-zinc-300 tracking-wide font-light leading-relaxed break-words mb-6 sm:mb-7">
                    AI-First Contractor & AI-Product Engineer building production-ready software, intelligent automation, and modern web apps.
                  </p>
   
                  {/* Action Buttons (Premium soft gradient & glass) */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-5 w-full sm:w-auto mb-7 sm:mb-8">
                    <a 
                      href="#work" 
                      className="group relative transition-all duration-300 ease-out hover:scale-[1.02] shadow-[0_4px_20px_rgba(220,38,38,0.15)] hover:-translate-y-0.5"
                      style={{ 
                        backgroundColor: 'var(--accent)', 
                        color: '#ffffff', 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '19px', 
                        padding: '15px 34px', 
                        borderRadius: '12px', 
                        fontSize: '12.5px', 
                        fontWeight: 'bold', 
                        letterSpacing: '0.15em', 
                        textTransform: 'uppercase',
                        textDecoration: 'none'
                      }}
                    >
                      <span>View Projects</span>
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                      </svg>
                    </a>
                    
                    <a 
                      href="#contact" 
                      className="group relative transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-0.5"
                      style={{ 
                        border: '1px solid rgba(255, 255, 255, 0.15)', 
                        backgroundColor: 'rgba(255, 255, 255, 0.03)', 
                        color: '#ffffff', 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '19px', 
                        padding: '15px 34px', 
                        borderRadius: '12px', 
                        fontSize: '12.5px', 
                        fontWeight: 'bold', 
                        letterSpacing: '0.15em', 
                        textTransform: 'uppercase',
                        textDecoration: 'none'
                      }}
                    >
                      <span>Contact Me</span>
                      <svg className="w-4 h-4 text-zinc-400 group-hover:text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                    </a>
                  </div>
   
                  {/* Tech Stack Chips (Premium upscaled glass tags with glowing hovers) */}
                  <div className="flex flex-col gap-6 items-start w-full">
                    <span className="font-sans text-[11px] tracking-[0.25em] font-bold text-zinc-500 uppercase select-none">Tech Stack</span>
                    <div className="flex flex-wrap gap-3 max-w-2xl">
                      {/* Next.js Badge */}
                      <span className="relative group h-[42px] pl-5 pr-6 inline-flex items-center gap-2.5 text-[13px] font-semibold tracking-wide rounded-xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md text-zinc-250 hover:text-white hover:border-red-500/50 hover:bg-white/[0.07] hover:shadow-[0_0_20px_rgba(255,255,255,0.08)] transition-all duration-300 cursor-pointer select-none">
                        <svg className="w-[20px] h-[20px] text-white shrink-0" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="90" cy="90" r="90" fill="black"/>
                          <path d="M149.508 157.52L69.142 54.027H54.027V125.973H67.876V75.632L135.811 162.771C140.716 161.261 145.318 159.488 149.508 157.52Z" fill="white"/>
                          <rect x="112.124" y="54.027" width="13.849" height="71.946" fill="white"/>
                        </svg>
                        Next.js
                        {/* Tooltip bubble - Left anchored to prevent screen edge clipping */}
                        <div className="absolute top-full mt-3 left-0 w-[260px] p-4 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-2xl opacity-0 scale-95 -translate-y-2 pointer-events-none transition-all duration-300 ease-out group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 group-hover:pointer-events-auto z-50 flex flex-col gap-1.5 text-left">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
                            <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Framework Experience</span>
                          </div>
                          <p className="text-[12px] font-normal leading-relaxed text-zinc-300 normal-case tracking-normal">
                            Built <strong>13-14 web application projects</strong> and software tools with SSR, server actions, and clean architecture.
                          </p>
                          <div className="absolute bottom-full left-6 border-x-[6px] border-x-transparent border-b-[6px] border-b-white/10" />
                        </div>
                      </span>
                      
                      {/* React Badge */}
                      <span className="relative group h-[42px] pl-5 pr-6 inline-flex items-center gap-2.5 text-[13px] font-semibold tracking-wide rounded-xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md text-zinc-250 hover:text-white hover:border-red-500/50 hover:bg-white/[0.07] hover:shadow-[0_0_20px_rgba(0,216,255,0.12)] transition-all duration-300 cursor-pointer select-none">
                        <svg className="w-[20px] h-[20px] text-[#00d8ff] animate-[spin_20s_linear_infinite] shrink-0" viewBox="-11.5 -10.23174 23 20.46348" fill="none">
                          <ellipse rx="11" ry="4.2" stroke="currentColor" strokeWidth="1.2"/>
                          <ellipse rx="11" ry="4.2" transform="rotate(60)" stroke="currentColor" strokeWidth="1.2"/>
                          <ellipse rx="11" ry="4.2" transform="rotate(120)" stroke="currentColor" strokeWidth="1.2"/>
                          <circle r="2" fill="currentColor"/>
                        </svg>
                        React
                        {/* Tooltip bubble */}
                        <div className="absolute top-full mt-3 left-0 sm:left-1/2 sm:-translate-x-1/2 w-[260px] p-4 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-2xl opacity-0 scale-95 -translate-y-2 pointer-events-none transition-all duration-300 ease-out group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 group-hover:pointer-events-auto z-50 flex flex-col gap-1.5 text-left">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
                            <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">UI & Client Apps</span>
                          </div>
                          <p className="text-[12px] font-normal leading-relaxed text-zinc-300 normal-case tracking-normal">
                            Built <strong>2-3 desktop and web apps</strong> utilizing robust state systems, modular components, and responsive views.
                          </p>
                          <div className="absolute bottom-full left-8 sm:left-1/2 sm:-translate-x-1/2 border-x-[6px] border-x-transparent border-b-[6px] border-b-white/10" />
                        </div>
                      </span>
   
                      {/* TypeScript Badge */}
                      <span className="relative group h-[42px] pl-5 pr-6 inline-flex items-center gap-2.5 text-[13px] font-semibold tracking-wide rounded-xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md text-zinc-250 hover:text-white hover:border-red-500/50 hover:bg-white/[0.07] hover:shadow-[0_0_20px_rgba(49,120,198,0.12)] transition-all duration-300 cursor-pointer select-none">
                        <svg className="w-[20px] h-[20px] text-[#3178c6] rounded-[4px] shrink-0" viewBox="0 0 100 100" fill="currentColor">
                          <path d="M0 0h100v100H0z" fill="#3178c6"/>
                          <path d="M36.1 40.5h-8.7V75h-9V40.5H9.7v-7.3h26.4v7.3zm31.7 20c0 3.2-1 5.9-3.1 7.9-2 2-4.8 3-8.3 3-2.9 0-5.6-.6-8-1.9V61.7c2.5 1.7 4.9 2.5 7.1 2.5 1.5 0 2.7-.4 3.6-1.1s1.3-1.8-1.3-3.2c0-1.2-.4-2.2-1.1-3-1-.9-2.5-1.9-4.7-3.1-2.9-1.6-5.1-3.2-6.5-4.8-1.4-1.6-2.1-3.6-2.1-6 0-3 1.1-5.5 3.2-7.5s5-3 8.7-3c2.7 0 5.2.5 7.4 1.6V48c-2.3-1.4-4.3-2.1-6-2.1-1.3 0-2.3.3-3.1.9s-1.2 1.4-1.2 2.5c0 1 .3 1.8 1 2.5.7.7 2 1.6 3.9 2.7 3.1 1.7 5.4 3.4 6.8 5.2s2.1 4 2.1 6.3z" fill="#fff"/>
                        </svg>
                        TypeScript
                        {/* Tooltip bubble */}
                        <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 w-[260px] p-4 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-2xl opacity-0 scale-95 -translate-y-2 pointer-events-none transition-all duration-300 ease-out group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 group-hover:pointer-events-auto z-50 flex flex-col gap-1.5 text-left">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
                            <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Type Safety</span>
                          </div>
                          <p className="text-[12px] font-normal leading-relaxed text-zinc-300 normal-case tracking-normal">
                            Leveraged TS in <strong>6-7 scale applications</strong>, implementing strong typing, solid OOP interfaces, and reliable data contracts.
                          </p>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-x-[6px] border-x-transparent border-b-[6px] border-b-white/10" />
                        </div>
                      </span>
   
                      {/* Python Badge */}
                      <span className="relative group h-[42px] pl-5 pr-6 inline-flex items-center gap-2.5 text-[13px] font-semibold tracking-wide rounded-xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md text-zinc-250 hover:text-white hover:border-red-500/50 hover:bg-white/[0.07] hover:shadow-[0_0_20px_rgba(255,222,87,0.12)] transition-all duration-300 cursor-pointer select-none">
                        <svg className="w-[20px] h-[20px] text-[#ffde57] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M11.93 0C5.33 0 5.48 2.87 5.48 2.87l.06 2.97h6.58v.92H5.56S2.67 6.63 2.67 13.22c0 6.6 2.57 6.35 2.57 6.35h1.53v-2.15s-.08-2.57 2.53-2.57h6.29s2.44.1 2.44-2.48V6.08s.16-6.08-6.1-6.08zm-2.76 1.83a.92.92 0 1 1 0 1.84.92.92 0 0 1 0-1.84zM12.07 24c6.6 0 6.45-2.87 6.45-2.87l-.06-2.97h-6.58v-.92h6.56s2.89.13 2.89-6.46c0-6.6-2.57-6.35-2.57-6.35h-1.53v2.15s.08 2.57-2.53 2.57h-6.29s-2.44-.1-2.44 2.48v6.29s-.16 6.08 6.1 6.08zm2.76-1.83a.92.92 0 1 1 0-1.84.92.92 0 0 1 0 1.84z" />
                        </svg>
                        Python
                        {/* Tooltip bubble */}
                        <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 w-[260px] p-4 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-2xl opacity-0 scale-95 -translate-y-2 pointer-events-none transition-all duration-300 ease-out group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 group-hover:pointer-events-auto z-50 flex flex-col gap-1.5 text-left">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
                            <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Core Language</span>
                          </div>
                          <p className="text-[12px] font-normal leading-relaxed text-zinc-300 normal-case tracking-normal">
                            Built <strong>17-18 projects</strong> (AI Agents, automation scripts, custom bots, pipelines) using Python as my primary backend tool.
                          </p>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-x-[6px] border-x-transparent border-b-[6px] border-b-white/10" />
                        </div>
                      </span>
   
                      {/* FastAPI Badge */}
                      <span className="relative group h-[42px] pl-5 pr-6 inline-flex items-center gap-2.5 text-[13px] font-semibold tracking-wide rounded-xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md text-zinc-250 hover:text-white hover:border-red-500/50 hover:bg-white/[0.07] hover:shadow-[0_0_20px_rgba(0,150,136,0.12)] transition-all duration-300 cursor-pointer select-none">
                        <svg className="w-[20px] h-[20px] text-[#009688] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0L1.75 6v12L12 24l10.25-6V6L12 0zm-1.25 18v-4.5H8.5l4.75-7.5v4.5h2.25L10.75 18z" />
                        </svg>
                        FastAPI
                        {/* Tooltip bubble - Right anchored */}
                        <div className="absolute top-full mt-3 right-0 left-auto translate-x-0 w-[260px] p-4 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-2xl opacity-0 scale-95 -translate-y-2 pointer-events-none transition-all duration-300 ease-out group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 group-hover:pointer-events-auto z-50 flex flex-col gap-1.5 text-left">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
                            <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">API Development</span>
                          </div>
                          <p className="text-[12px] font-normal leading-relaxed text-zinc-300 normal-case tracking-normal">
                            Designed high-speed microservices, structured REST endpoints, and background workers for automated AI tools.
                          </p>
                          <div className="absolute bottom-full right-6 border-x-[6px] border-x-transparent border-b-[6px] border-b-white/10" />
                        </div>
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Right Column: Cinematic Portrait & checklist glass overlay card */}
                {/* Right Column: Cinematic Portrait & checklist glass overlay card */}
                <div className="md:col-span-5 lg:col-span-5 flex items-start justify-center md:justify-end w-full select-none pt-4 sm:pt-6 md:pt-10 lg:pt-12">
                  <div className="relative w-[280px] h-[340px] sm:w-[330px] sm:h-[400px] md:w-[320px] md:h-[390px] lg:w-[410px] lg:h-[490px] xl:w-[460px] xl:h-[550px] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] group border border-white/10 mt-6 sm:mt-8 md:mt-4 lg:mt-6">
                    <img 
                      src="/developer.png" 
                      alt="Developer Portrait" 
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-all duration-700 ease-out"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                    
                    {/* Floating Glass Checklist Card */}
                    <div className="absolute bottom-5 right-5 sm:bottom-6 sm:right-6 w-[190px] sm:w-[230px] p-3.5 sm:p-4.5 rounded-2xl bg-black/55 border border-white/10 backdrop-blur-lg shadow-2xl flex flex-col gap-2.5 sm:gap-3">
                      {[
                        { text: "AI Products" },
                        { text: "Automation" },
                        { text: "Modern Web Apps" }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 font-bold text-white text-[10.5px] sm:text-xs">
                          <span className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full bg-red-600/15 border border-red-500/25 flex items-center justify-center text-red-500 shrink-0 select-none">
                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          </span>
                          <span className="break-words text-zinc-100">{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 1.5: Currently Building - Responsive Balance on all screen sizes */}
          <section className="w-full max-w-[1440px] pl-6 pr-6 sm:pl-12 sm:pr-12 md:pl-16 md:pr-16 mx-auto pt-2 sm:pt-4 pb-14 sm:pb-18 md:pb-20 select-none relative z-10">
            <div className="flex items-center justify-center gap-4 mb-6 sm:mb-8 select-none">
              <span className="h-px bg-gradient-to-r from-transparent to-white/10 flex-1" />
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
              <span className="text-[10px] font-bold tracking-[0.25em] text-zinc-400 uppercase">Currently Building</span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
              <span className="h-px bg-gradient-to-l from-transparent to-white/10 flex-1" />
            </div>

            <div className="flex flex-wrap items-stretch justify-center gap-4 sm:gap-5 w-full">
              {[
                { 
                  title: "Main Project", 
                  desc: "Q-Link Encrypted App", 
                  id: "qlink",
                  icon: (
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  )
                },
                { 
                  title: "AI SaaS", 
                  desc: "Building intelligent products", 
                  id: "promptops",
                  icon: (
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                    </svg>
                  )
                },
                { 
                  title: "Developer Tools", 
                  desc: "Creating tools for developers", 
                  id: "kora_ide",
                  icon: (
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                    </svg>
                  )
                },
                { 
                  title: "Automation", 
                  desc: "Automating complex workflows", 
                  id: "web_search_agent",
                  icon: (
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                    </svg>
                  )
                },
                { 
                  title: "Open Source", 
                  desc: "Contributing to the community", 
                  id: "open_source",
                  icon: (
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.193 22 16.44 22 12.017 22 6.484 17.522 2 12 2z" />
                    </svg>
                  )
                }
              ].map((card) => (
                <div 
                  key={card.id} 
                  className="flex-1 min-w-[230px] max-w-[340px] p-5 sm:p-6 rounded-2xl bg-zinc-950/40 border border-white/[0.05] hover:border-red-500/20 backdrop-blur-md flex items-center gap-4 sm:gap-5 hover:-translate-y-1 transition-all duration-300 ease-out select-none shadow-[0_4px_15px_rgba(0,0,0,0.15)] min-h-[96px] cursor-pointer"
                  onClick={() => setActiveProjectModal(card.id)}
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center shrink-0">
                    {card.icon}
                  </div>
                  <div className="flex flex-col gap-1 min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white break-words truncate">{card.title}</h3>
                    <p className="text-[11.5px] sm:text-[12px] text-zinc-400 font-light leading-snug break-words">{card.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Section 2: Selected Work (Featured Projects Card Panel) - Pushed down comfortably */}
      {!loading && gateUnlocked && (
        <section id="work" className="relative z-10 w-full max-w-[1440px] rounded-xl sm:rounded-2xl crystal-glass p-8 sm:p-10 lg:p-12 relative overflow-hidden select-none mt-12 sm:mt-16 md:mt-20 lg:mt-24">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-20">
            <div className="flex flex-col gap-4">
              <span className="text-[11px] font-semibold tracking-[0.25em] text-red-400 uppercase inline-block">Featured Work</span>
              <h2 className="text-3xl sm:text-5xl font-display font-bold uppercase inline-block text-white break-words">Selected Projects</h2>
            </div>
 
            {/* Premium profile.json Terminal Card with Syntax Highlighting */}
            <div className="max-w-[280px] w-full p-5 rounded-2xl bg-zinc-950/80 border border-white/[0.08] hover:border-red-500/30 hover:bg-zinc-950/90 backdrop-blur-xl shadow-[0_25px_50px_rgba(0,0,0,0.6)] flex flex-col gap-3.5 transition-all duration-500 scale-95 sm:scale-100 hover:shadow-[0_25px_50px_rgba(239,68,68,0.15)] select-none">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                </div>
                <span className="text-[10px] text-zinc-500 font-mono tracking-wider">profile.json</span>
              </div>
              <div className="font-mono text-[11px] leading-relaxed text-zinc-300">
                <p><span className="text-pink-500">const</span> developer = &#123;</p>
                <p className="pl-4"><span className="text-purple-400">role</span>: <span className="text-emerald-400">&quot;AI Product Engineer&quot;</span>,</p>
                <p className="pl-4"><span className="text-purple-400">status</span>: <span className="text-emerald-400">&quot;Building&quot;</span>,</p>
                <p className="pl-4"><span className="text-purple-400">location</span>: <span className="text-emerald-400">&quot;India&quot;</span>,</p>
                <p className="pl-4"><span className="text-purple-400">availability</span>: <span className="text-amber-400">true</span></p>
                <p>&#125;;</p>
              </div>
            </div>
          </div>
 
          {/* Bento Grid: 1 Col (Mobile) -> 2 Col (Tablet) -> 3 Col (Desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Project 1 - PromptOps */}
            <div 
              className="group sm:col-span-2 lg:col-span-2 relative overflow-hidden rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-transparent border border-white/[0.1] hover:border-white/30 backdrop-blur-2xl transition-all duration-500 flex flex-col justify-between min-h-[260px] sm:min-h-[290px] shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.15)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.3)] cursor-pointer hover:scale-[1.01]"
              onClick={() => setActiveProjectModal("promptops")}
            >
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-red-500/20 transition-all duration-700" />
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/[0.07] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

              <div className="relative z-10 flex justify-between items-center">
                <div className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/[0.15] flex items-center justify-center text-xs sm:text-sm font-bold text-red-400 shadow-inner group-hover:border-red-500/40 transition-colors">01</div>
                <span className="text-[10px] font-bold tracking-widest text-zinc-300 uppercase bg-white/[0.05] px-3.5 py-1.5 rounded-full border border-white/[0.1] backdrop-blur-md">Full Stack SaaS</span>
              </div>
              <div className="relative z-10 mt-6">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold uppercase tracking-wider mb-2 text-white group-hover:text-red-300 transition-colors break-words">PromptOps (AI SaaS)</h3>
                <p className="text-zinc-400 font-light text-sm sm:text-base leading-relaxed break-words">A production-grade prompt operations and analysis hub designed to audit, filter, and inspect complex system prompts of commercial AI agents and models.</p>
              </div>
            </div>
 
            {/* Project 2 - Web Search Agent */}
            <div 
              className="group sm:col-span-1 lg:col-span-1 relative overflow-hidden rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-transparent border border-white/[0.1] hover:border-white/30 backdrop-blur-2xl transition-all duration-500 flex flex-col justify-between min-h-[260px] sm:min-h-[290px] shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.15)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.3)] cursor-pointer hover:scale-[1.01]"
              onClick={() => setActiveProjectModal("web_search_agent")}
            >
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/20 transition-all duration-700" />
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/[0.07] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

              <div className="relative z-10 flex justify-between items-center">
                <div className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/[0.15] flex items-center justify-center text-xs sm:text-sm font-bold text-cyan-400 shadow-inner group-hover:border-cyan-500/40 transition-colors">02</div>
                <span className="text-[10px] font-bold tracking-widest text-zinc-300 uppercase bg-white/[0.05] px-3.5 py-1.5 rounded-full border border-white/[0.1] backdrop-blur-md">Automation</span>
              </div>
              <div className="relative z-10 mt-6">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold uppercase tracking-wider mb-2 text-white group-hover:text-cyan-300 transition-colors break-words">Web Search Agent</h3>
                <p className="text-zinc-400 font-light text-sm sm:text-base leading-relaxed break-words">An autonomous multi-agent system executing recursive search, extraction, and automated report aggregation loops.</p>
              </div>
            </div>
 
            {/* Project 3 - Kora IDE */}
            <div 
              className="group sm:col-span-1 lg:col-span-1 relative overflow-hidden rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-transparent border border-white/[0.1] hover:border-white/30 backdrop-blur-2xl transition-all duration-500 flex flex-col justify-between min-h-[260px] sm:min-h-[290px] shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.15)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.3)] cursor-pointer hover:scale-[1.01]"
              onClick={() => setActiveProjectModal("kora_ide")}
            >
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/20 transition-all duration-700" />
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/[0.07] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

              <div className="relative z-10 flex justify-between items-center">
                <div className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/[0.15] flex items-center justify-center text-xs sm:text-sm font-bold text-amber-400 shadow-inner group-hover:border-amber-500/40 transition-colors">03</div>
                <span className="text-[10px] font-bold tracking-widest text-zinc-300 uppercase bg-white/[0.05] px-3.5 py-1.5 rounded-full border border-white/[0.1] backdrop-blur-md">Developer Tool</span>
              </div>
              <div className="relative z-10 mt-6">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold uppercase tracking-wider mb-2 text-white group-hover:text-amber-300 transition-colors break-words">Kora IDE</h3>
                <p className="text-zinc-400 font-light text-sm sm:text-base leading-relaxed break-words">Autonomous local AI-powered code editor connecting Monaco workspace buffers with local LLM diagnostics.</p>
              </div>
            </div>
 
            {/* Project 4 - Q-Link Platform */}
            <div 
              className="group sm:col-span-2 lg:col-span-2 relative overflow-hidden rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-transparent border border-white/[0.1] hover:border-white/30 backdrop-blur-2xl transition-all duration-500 flex flex-col justify-between min-h-[260px] sm:min-h-[290px] shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.15)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.3)] cursor-pointer hover:scale-[1.01]"
              onClick={() => setActiveProjectModal("qlink")}
            >
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-700" />
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/[0.07] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

              <div className="relative z-10 flex justify-between items-center">
                <div className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/[0.15] flex items-center justify-center text-xs sm:text-sm font-bold text-emerald-400 shadow-inner group-hover:border-emerald-500/40 transition-colors">04</div>
                <span className="text-[10px] font-bold tracking-widest text-zinc-300 uppercase bg-white/[0.05] px-3.5 py-1.5 rounded-full border border-white/[0.1] backdrop-blur-md">Secure Real-Time PWA</span>
              </div>
              <div className="relative z-10 mt-6">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold uppercase tracking-wider mb-2 text-white group-hover:text-emerald-300 transition-colors break-words">Q-Link Platform</h3>
                <p className="text-zinc-400 font-light text-sm sm:text-base leading-relaxed break-words">Next-generation real-time encrypted communications platform with WebSocket state engines, ephemeral media auto-purge, and desktop integration.</p>
              </div>
            </div>
          </div>
        </section>
      )}
 
      {/* Section 3: Metrics / Highlights Section */}
      {!loading && gateUnlocked && (
        <section className="relative z-10 w-full max-w-[1440px] rounded-xl sm:rounded-2xl crystal-glass p-8 sm:p-10 lg:p-12 select-none">
          <div className="max-w-[1440px] mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              
              {/* Metric 1 */}
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md flex flex-col gap-2 hover:border-red-500/20 hover:bg-white/[0.04] transition-all duration-300 shadow-[0_5px_15px_rgba(0,0,0,0.05)]">
                <span className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-500 leading-none tracking-tight">5+</span>
                <span className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">Production Apps</span>
              </div>
 
              {/* Metric 2 */}
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md flex flex-col gap-2 hover:border-red-500/20 hover:bg-white/[0.04] transition-all duration-300 shadow-[0_5px_15px_rgba(0,0,0,0.05)]">
                <span className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-500 leading-none tracking-tight">120+</span>
                <span className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">Deployments</span>
              </div>
 
              {/* Metric 3 */}
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md flex flex-col gap-2 hover:border-red-500/20 hover:bg-white/[0.04] transition-all duration-300 shadow-[0_5px_15px_rgba(0,0,0,0.05)]">
                <span className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-500 leading-none tracking-tight">15+</span>
                <span className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">Technologies</span>
              </div>
 
              {/* Metric 4 */}
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md flex flex-col gap-2 hover:border-red-500/20 hover:bg-white/[0.04] transition-all duration-300 shadow-[0_5px_15px_rgba(0,0,0,0.05)]">
                <span className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-500 leading-none tracking-tight">50+</span>
                <span className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">Open Source PRs</span>
              </div>
 
            </div>
          </div>
        </section>
      )}
 
      {/* Section: B2B Contractor Experience & Track Record */}
      {!loading && gateUnlocked && (
        <section id="experience" className="relative z-10 w-full max-w-[1440px] rounded-xl sm:rounded-2xl crystal-glass p-6 sm:p-10 lg:p-12 select-none flex flex-col gap-10 sm:gap-14 overflow-hidden">
          
          {/* Ambient Glow Effects */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* 1. Header & Executive Overview Card */}
          <div className="flex flex-col gap-6 relative z-10">
            <div className="flex flex-col gap-3 text-left">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-semibold tracking-[0.25em] text-red-400 uppercase inline-block">
                  Proven Track Record
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[9.5px] font-bold tracking-widest uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                  ACTIVE FOR MONTHLY RETAINERS
                </span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-display font-bold uppercase text-white break-words text-left">
                Contract Engagements &amp; Services
              </h2>
            </div>

            {/* Executive Professional Overview Box */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl flex flex-col gap-4 text-left hover:border-red-500/30 transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_#ef4444]" />
                  <span className="text-xs font-mono font-bold tracking-widest text-white uppercase">
                    B2B Independent Contractor &amp; AI Architect
                  </span>
                </div>
                <span className="text-[10.5px] font-mono text-zinc-400 uppercase tracking-widest bg-white/[0.04] px-3 py-1 rounded-full border border-white/5">
                  5X VELOCITY MODEL
                </span>
              </div>
              <p className="text-zinc-200 text-sm sm:text-base font-light leading-relaxed text-left break-words">
                AI-First Software Contractor specializing in rapid application deployment, multi-agent AI orchestration, and secure full-stack architectures. Leveraging state-of-the-art LLMs and agentic workflows to build, iterate, and ship production-ready platforms 5x faster than traditional software engineering lifecycles. Operating strictly via flat monthly retainers.
              </p>
              <div className="flex flex-wrap gap-2.5 pt-3 border-t border-white/5">
                <span className="px-3.5 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-[10.5px] font-bold tracking-wider">
                  FLAT MONTHLY RETAINERS
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-zinc-300 font-mono text-[10.5px] font-semibold tracking-wider">
                  5X SPEEDUP METHODOLOGY
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10.5px] font-semibold tracking-wider">
                  ASYNC &amp; US OVERLAP READY
                </span>
              </div>

              {/* AI IDE & Agentic Evolution Telemetry Bar */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                <span className="text-zinc-400 text-[10.5px] font-semibold uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  AI IDE TOOLING TIMELINE:
                </span>
                <div className="flex items-center gap-2 flex-wrap text-[10.5px]">
                  <span className="px-2.5 py-0.5 rounded bg-white/[0.05] border border-white/10 text-zinc-300">Cursor (5M)</span>
                  <span className="text-zinc-500">&rarr;</span>
                  <span className="px-2.5 py-0.5 rounded bg-white/[0.05] border border-white/10 text-zinc-300">Devin / Windsurf (1.5Y)</span>
                  <span className="text-zinc-500">&rarr;</span>
                  <span className="px-2.5 py-0.5 rounded bg-red-500/20 border border-red-500/30 text-red-300 font-bold">Google Antigravity (4M)</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Contract Engagement Timeline Cards */}
          <div className="flex flex-col gap-6 text-left relative z-10">
            <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-zinc-500 uppercase">
              Contract Engagements
            </span>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Engagement 1 */}
              <div className="p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-red-500/40 backdrop-blur-xl flex flex-col justify-between gap-6 transition-all duration-500 hover:scale-[1.01] shadow-[0_20px_50px_rgba(0,0,0,0.4)] group">
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <span className="text-red-400 text-xs font-mono font-bold tracking-wider uppercase">Contract Placement</span>
                      <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-wide text-white mt-1 text-left break-words">
                        Lead AI Product Engineer (Contract)
                      </h3>
                    </div>
                    <span className="px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-300 font-mono text-[10.5px] font-semibold">
                      4 Months
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap mt-1">
                    <span className="text-zinc-300 text-xs font-semibold tracking-wide">
                      Confidential Startup (Valued at $6.5M)
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-red-500/20 text-red-300 font-mono text-[9.5px] font-bold">
                      0.3% EQUITY MILESTONE
                    </span>
                  </div>

                  <ul className="flex flex-col gap-3 mt-3">
                    <li className="flex items-start gap-3 text-xs sm:text-sm text-zinc-300 font-light leading-relaxed text-left break-words">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-2 shadow-[0_0_8px_#ef4444]" />
                      <span>Engineered from scratch a highly scalable, full-stack application for a bootstrapped founder, securing 0.3% founding equity based on architectural milestone delivery.</span>
                    </li>
                    <li className="flex items-start gap-3 text-xs sm:text-sm text-zinc-300 font-light leading-relaxed text-left break-words">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-2 shadow-[0_0_8px_#ef4444]" />
                      <span>Architected and deployed a custom, zero-knowledge client-side encryption framework using the Web Crypto API (AES-GCM/Diffie-Hellman) guaranteeing sub-100ms processing latency and absolute data privacy.</span>
                    </li>
                    <li className="flex items-start gap-3 text-xs sm:text-sm text-zinc-300 font-light leading-relaxed text-left break-words">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-2 shadow-[0_0_8px_#ef4444]" />
                      <span>Integrated robust authentication structures supporting frictionless 1-click OAuth pipelines via Google, GitHub, and Microsoft for 10K+ user sessions.</span>
                    </li>
                    <li className="flex items-start gap-3 text-xs sm:text-sm text-zinc-300 font-light leading-relaxed text-left break-words">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-2 shadow-[0_0_8px_#ef4444]" />
                      <span>Eliminated server-side single points of failure by shipping serverless edge workers, semantic caching (Redis), and automated push notification synchronization maintaining 99.9% uptime.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Engagement 2 */}
              <div className="p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-red-500/40 backdrop-blur-xl flex flex-col justify-between gap-6 transition-all duration-500 hover:scale-[1.01] shadow-[0_20px_50px_rgba(0,0,0,0.4)] group">
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <span className="text-red-400 text-xs font-mono font-bold tracking-wider uppercase">Track Record &amp; Capabilities</span>
                      <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-wide text-white mt-1 text-left break-words">
                        Independent AI Product Engineer &amp; Systems Specialist
                      </h3>
                    </div>
                    <span className="px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-300 font-mono text-[10.5px] font-semibold">
                      2+ Years Experience
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap mt-1">
                    <span className="text-zinc-300 text-xs font-semibold tracking-wide">
                      AI Software Architecture &amp; Autonomous Systems
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-[9.5px] font-bold">
                      80% SPEEDUP PIPELINE
                    </span>
                  </div>

                  <ul className="flex flex-col gap-3 mt-3">
                    <li className="flex items-start gap-3 text-xs sm:text-sm text-zinc-300 font-light leading-relaxed text-left break-words">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-2 shadow-[0_0_8px_#ef4444]" />
                      <span>Mastered 2+ years of SOTA AI IDE &amp; Agentic Tooling evolution (Cursor AI &rarr; Windsurf / Devin AI &rarr; Google Antigravity) to accelerate software delivery velocity by up to 5x.</span>
                    </li>
                    <li className="flex items-start gap-3 text-xs sm:text-sm text-zinc-300 font-light leading-relaxed text-left break-words">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-2 shadow-[0_0_8px_#ef4444]" />
                      <span>Engineered production-grade RAG &amp; agentic workflows using LangGraph, pgvector, and Pinecone, reducing token costs by ~40% via dynamic model routing (Gemini 3.6 Flash / Sonnet).</span>
                    </li>
                    <li className="flex items-start gap-3 text-xs sm:text-sm text-zinc-300 font-light leading-relaxed text-left break-words">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-2 shadow-[0_0_8px_#ef4444]" />
                      <span>Implemented end-to-end LLM Evaluation pipelines (LangSmith / OpenTelemetry) and adversarial prompt guardrails, achieving 95%+ instruction compliance and zero hallucination leaks.</span>
                    </li>
                    <li className="flex items-start gap-3 text-xs sm:text-sm text-zinc-300 font-light leading-relaxed text-left break-words">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-2 shadow-[0_0_8px_#ef4444]" />
                      <span>Shipped production-grade code bases across complex TypeScript &amp; Python ecosystems, specializing in Next.js 16, React 19, Node.js, FastAPI (Asyncio), Prisma ORM, and Neon PostgreSQL.</span>
                    </li>
                  </ul>
                </div>
              </div>

            </div>
          </div>

          {/* 3. Categorized Core Technical Stack Matrix */}
          <div className="flex flex-col gap-6 text-left relative z-10">
            <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-zinc-500 uppercase">
              Core Technical Capabilities
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  category: "AI & Agentic Orchestration",
                  skills: ["Gemini 3.6 Flash / Pro", "LangGraph & LangChain", "Vector DBs (pgvector/Pinecone)", "LLM Evals (LangSmith/OpenTelemetry)", "Prompt Guardrails & RAG", "+ Dynamic Model Routing"]
                },
                {
                  category: "Frontend & Native Apps",
                  skills: ["Next.js 16 (App Router)", "React 19 & TypeScript", "Desktop Apps (.msi, .exe)", "Mobile Apps (.apk, PWA)", "Glassmorphic UI Design", "+ Any Modern UI Framework"]
                },
                {
                  category: "Backend & Ecosystem",
                  skills: ["Python (Asyncio / FastAPI)", "Node.js & Express", "Prisma ORM & Postgres", "Redis (Semantic Caching)", "Token & Cost Optimization", "+ Agnostic Stack Integration"]
                },
                {
                  category: "Security & Distribution",
                  skills: ["Zero-Knowledge Crypto", "OAuth 2.0 Auth", "Native Installers (.msi/.exe)", "Vercel Edge & Cloudflare", "CI/CD Build Automation", "+ Enterprise Custom Systems"]
                }
              ].map((group, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-red-500/30 transition-all duration-300 backdrop-blur-md flex flex-col justify-between gap-3 text-left">
                  <div className="flex flex-col gap-3">
                    <span className="text-red-400 text-xs font-bold uppercase tracking-wider text-left">{group.category}</span>
                    <div className="flex flex-col gap-2 mt-1">
                      {group.skills.map((skill, sIdx) => {
                        const isMore = skill.startsWith("+");
                        return (
                          <div key={sIdx} className={`flex items-center gap-2 text-xs font-mono ${isMore ? 'text-red-400 font-bold mt-1 pt-1 border-t border-white/5' : 'text-zinc-300'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isMore ? 'bg-red-500 animate-pulse shadow-[0_0_6px_#ef4444]' : 'bg-white/20'}`} />
                            <span>{skill}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. PDF Resume Download Card - Zero Clipping, High Contrast, Apple Architecture */}
          <div className="relative z-10 w-full h-auto min-h-fit py-8 sm:py-9 lg:py-10 px-6 sm:px-10 lg:px-12 rounded-3xl bg-gradient-to-r from-zinc-950 via-zinc-900/90 to-zinc-950 border border-white/20 hover:border-white/35 backdrop-blur-2xl flex flex-col lg:flex-row items-center justify-between gap-8 shadow-[0_30px_80px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.15)] transition-all duration-500 group/card">
            {/* Ambient Background Glows */}
            <div className="absolute -right-16 -top-16 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none group-hover/card:bg-red-600/20 transition-all duration-700" />
            <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none group-hover/card:bg-emerald-600/15 transition-all duration-700" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_70%)] pointer-events-none rounded-3xl" />

            {/* Left Content Column - High Contrast & Unconstrained Auto Height */}
            <div className="relative z-10 flex-1 min-w-0 flex flex-col gap-3 text-center lg:text-left w-full">
              <div className="flex items-center gap-3 flex-wrap justify-center lg:justify-start">
                <h3 className="text-white text-xl sm:text-2xl font-bold tracking-tight font-display m-0 p-0">
                  Need an Official B2B Contractor Resume?
                </h3>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-[10.5px] font-bold tracking-wider backdrop-blur-md shadow-inner">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  2+ YRS AI IDE TRACK RECORD
                </span>
              </div>

              {/* Subtext with High WCAG Contrast & Milestone Chips */}
              <div className="text-zinc-200 text-sm sm:text-[14px] leading-relaxed font-normal flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 flex-wrap justify-center lg:justify-start">
                  <span className="text-zinc-300">Structured 1-page executive sheet highlighting:</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-white/10 border border-white/20 text-white font-medium text-xs">Cursor AI (5M)</span>
                  <span className="text-zinc-400 font-bold">&rarr;</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-white/10 border border-white/20 text-white font-medium text-xs">Windsurf/Devin (1.5Y)</span>
                  <span className="text-zinc-400 font-bold">&rarr;</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 font-medium text-xs">Antigravity (4M)</span>
                </div>
                <p className="text-zinc-300 text-xs sm:text-[13px] font-light m-0 p-0">
                  Engineering progression, high-concurrency real-time engines, and verifiable production architecture.
                </p>
              </div>
            </div>

            {/* Right Action Column - Apple Glass Button with Proper Vertical Alignment */}
            <div className="relative z-10 shrink-0 flex flex-col items-center lg:items-end gap-2 w-full lg:w-auto">
              <a
                href="/resume.html"
                target="_blank"
                rel="noopener noreferrer"
                className="group/btn relative inline-flex items-center justify-center gap-3 px-8 sm:px-9 py-4 rounded-2xl bg-gradient-to-b from-white/[0.16] via-white/[0.08] to-white/[0.02] hover:from-white/[0.24] hover:via-white/[0.12] hover:to-white/[0.04] border border-white/30 hover:border-white/60 text-white font-bold text-xs sm:text-[13px] tracking-wider uppercase backdrop-blur-2xl transition-all duration-300 shadow-[0_15px_35px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.4),inset_0_-1px_1px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_50px_rgba(255,255,255,0.15),inset_0_1px_2px_rgba(255,255,255,0.6)] cursor-pointer no-underline overflow-hidden w-full sm:w-auto"
              >
                {/* Shimmer Light Beam */}
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/35 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />
                {/* Ambient Halo */}
                <span className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-red-500/25 via-rose-500/25 to-purple-500/25 opacity-0 group-hover/btn:opacity-100 blur-md transition-opacity duration-500 -z-10" />

                <span className="relative z-10 whitespace-nowrap leading-none">View / Print B2B Resume</span>
                <svg className="relative z-10 w-4 h-4 text-zinc-300 group-hover/btn:text-white transition-transform duration-300 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H18m0 0v5.5m0-5.5L11.25 12.75M6 18h12" />
                </svg>
              </a>

              {/* Sub-label for trust and ATS compatibility */}
              <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5 select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                ATS-Optimized • PDF & Live Web Formats
              </span>
            </div>
          </div>

        </section>
      )}

      {/* Section 4: Contact Form / Footer Panel */}
      {!loading && gateUnlocked && (
        <section id="contact" className="relative z-10 w-full max-w-[1440px] rounded-xl sm:rounded-2xl crystal-glass p-8 sm:p-10 lg:p-12 flex flex-col items-center justify-center text-center">
          <div className="w-full max-w-3xl p-8 sm:p-10 lg:p-12 rounded-xl sm:rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-red-500/20 backdrop-blur-xl flex flex-col items-center gap-8 shadow-[0_15px_50px_rgba(0,0,0,0.4)] transition-all duration-500">
            <span className="text-[11px] font-semibold tracking-[0.25em] text-red-400 uppercase">Start a Project</span>
            <h2 className="text-3xl sm:text-5xl font-display font-bold uppercase leading-tight px-2 text-foreground break-words">
              Let&apos;s Build Something Premium Together.
            </h2>
            <p className="text-zinc-400 light:text-zinc-600 font-light text-sm sm:text-base max-w-md leading-relaxed px-4 break-words">
              Reach out for B2B contract engagements, monthly retainer placements, or custom AI product development.
            </p>
            
            <a 
              href="mailto:ghorhh473@gmail.com" 
              className="group mt-4 inline-flex items-center justify-center gap-3.5 px-9 py-4.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] tracking-[0.2em] uppercase transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-[0_10px_25px_rgba(239,68,68,0.3)]"
            >
              <span className="whitespace-nowrap">Send Email</span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="w-4 h-4 text-white transition-transform duration-300 ease-out group-hover:translate-x-1 group-hover:-translate-y-0.5 shrink-0"
              >
                <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
              </svg>
            </a>
          </div>

          <footer className="mt-20 text-zinc-500 text-[10px] tracking-[0.3em] uppercase">
            &copy; {new Date().getFullYear()} VibeCoder. All rights reserved.
          </footer>
        </section>
      )}
    
      {/* Dynamic Project Details Modal Overlay */}
      {activeProjectModal && (() => {
        const projectData: Record<string, {
          category: string;
          title: string;
          tagline: string;
          desc: string;
          tech: string[];
          highlights: string[];
          video?: string;
          github?: string;
          liveUrl?: string;
        }> = {
          promptops: {
            category: "AI SaaS",
            title: "PromptOps Platform",
            tagline: "Enterprise System Prompt Security & Analytics SaaS",
            desc: "A production-grade prompt operations and analysis hub designed to audit, filter, and inspect complex system prompts of commercial AI agents and models.",
            tech: ["React", "TypeScript", "Node.js", "Express", "Tailwind CSS"],
            highlights: [
              "Static analysis scorecard evaluating instructions against 4 safety vectors (Jailbreak, Leakage, Format, Context).",
              "Dynamic Prompt Defense Score calculations (0-100%) and interactive rings.",
              "Auditor Sandbox & Playpen Simulator with simulated adversarial queries (jailbreaks).",
              "Heuristic Auto-Optimizer transforming plain-text instructions into structured role configs."
            ],
            video: "/PromptOps_Demo_Voiced.mp4",
            github: "https://github.com/system-prompts-and-models-of-ai-tools-main/ai-prompt-analyzer"
          },
          qlink: {
            category: "Secure Communication Startup",
            title: "Q-Link Chat",
            tagline: "Zero-Knowledge Encrypted Messaging Platform",
            desc: "A client-side end-to-end encrypted messaging Progressive Web App engineered entirely from scratch for a private startup founder in return for 0.3% founding equity.",
            tech: ["Next.js", "React 19", "Prisma ORM", "Neon Postgres", "Web Crypto API", "Service Workers"],
            highlights: [
              "E2E Cryptography: Zero-knowledge encryption on client-side utilizing Web Crypto API (AES-GCM/Diffie-Hellman).",
              "Serverless Resiliency: Structured background push notifications using Promise.allSettled on Vercel.",
              "Offline Sync: Configured fault-tolerant Service Worker with local cache sync and system App Badging.",
              "Image Compression: Implemented HTML5 Canvas-based client-side compression to satisfy 4.5MB payload limit."
            ],
            liveUrl: "https://q-link-v3-0.vercel.app"
          },
          kora_ide: {
            category: "Developer Tool",
            title: "Kora IDE",
            tagline: "Autonomous Local AI Development Environment",
            desc: "A local, autonomous software development environment running Mistral LLMs locally via Ollama. Features Monaco editor context bindings, code understanding graphs, and Universal compilation diagnostics.",
            tech: ["Next.js", "Monaco Editor", "Python", "Mistral (Ollama)", "Docker"],
            highlights: [
              "Autonomous Agent: local development agent editing directories with mistral instruction prompts.",
              "Monaco Editor Integration: custom suggestions, token parsing and autocomplete suggestions.",
              "Universal Diagnostics: active errors scanning and parsing for local directories.",
              "Secure Sandbox: integrated Docker support isolating executions and dependencies."
            ]
          },
          web_search_agent: {
            category: "Automation System",
            title: "Web Search Agent",
            tagline: "Multi-Agent Autonomous Research & Scraping Pipeline",
            desc: "An autonomous multi-agent research pipeline executing recursive web searches, selector-timeout tolerant content extractions, and post-scrape synthesized data reports.",
            tech: ["Node.js", "Express", "Puppeteer", "Cheerio", "OpenAI API"],
            highlights: [
              "Crawling Pipeline: structured query searchAgent crawling custom regions dynamically.",
              "Failure tolerance: robust retry listeners bypassing page timeouts and selector alterations.",
              "Scraping Fallbacks: search fallbacks dynamically scraping public Forbes/Bloomberg financial indices.",
              "Synthesizer: structured data parser mapping raw strings into type-safe JSON objects."
            ]
          }
        };

        const isOpenSource = activeProjectModal === "open_source" || activeProjectModal === "coolify" || activeProjectModal === "archestra";

        if (isOpenSource) {
          const tabData = {
            coolify: {
              category: "Open Source / Developer Tool",
              title: "Coolify OIDC Integration",
              tagline: "Enterprise SSO & OAuth for Self-Hosted Clouds",
              desc: "Contributed generic OpenID Connect (OIDC) authentication provider support to Coolify. This enables enterprise self-hosters to connect standard single-sign-on systems like Okta, Keycloak, or Auth0 to secure their cloud portals.",
              tech: ["Laravel", "PHP", "Socialite", "Livewire", "Docker"],
              highlights: [
                "Added Generic OIDC provider parameters to the OAuthSettings schema.",
                "Implemented secure callback state verification token logic to meet OIDC specifications.",
                "Designed administrative configuration views in Livewire for automated registration.",
                "Wrote PHPUnit integration suites verifying token signatures against test identity providers."
              ],
              github: "https://github.com/ghorhh473-coder/coolify/tree/feat/oidc"
            },
            archestra: {
              category: "Open Source / Automation",
              title: "Archestra A2A Orchestrator",
              tagline: "Event Streaming & Webhooks for Multi-Agent Loops",
              desc: "Designed and engineered real-time token streaming and webhook execution listeners for Agent-to-Agent (A2A) automation, supporting secure and reactive multi-agent workflows.",
              tech: ["TypeScript", "Node.js", "Express", "Vitest", "EventEmitters"],
              highlights: [
                "Constructed stream executors using Node EventEmitters to sequence agent token updates.",
                "Implemented secure webhook payload dispatches executed immediately upon loop completion.",
                "Developed front-end status feedback indicators showing agent execution flow state.",
                "Built mock execution testing environments with Vitest to ensure sub-second latency handoffs."
              ],
              github: "https://github.com/ghorhh473-coder/archestra/tree/feat/a2a-v2-streaming-support"
            }
          };

          const currentTab = activeOpenSourceTab;
          const project = tabData[currentTab];

          return (
            <div 
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-all duration-300 animate-fadeIn"
              onClick={() => setActiveProjectModal(null)}
            >
              <div 
                className="relative w-full max-w-5xl rounded-2xl bg-zinc-950 border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.85)] flex flex-col lg:flex-row gap-8 animate-scaleUp max-h-[90vh] overflow-y-auto p-6 sm:p-8 pb-10 sm:pb-12"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Absolute Close Button */}
                <button 
                  onClick={() => setActiveProjectModal(null)}
                  className="absolute top-4 right-4 sm:top-6 sm:right-6 text-zinc-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] p-2.5 rounded-full border border-white/10 transition-all duration-300 select-none cursor-pointer z-20"
                  title="Close Modal"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Left Column: Trace Console */}
                <div className="flex-1 flex flex-col justify-center min-h-0 w-full lg:max-w-2xl">
                  <div className="w-full aspect-video rounded-xl border border-white/10 bg-black/60 p-4 sm:p-5 font-mono text-[10.5px] sm:text-[11.5px] leading-relaxed text-emerald-400 overflow-y-auto shadow-inner flex flex-col justify-start select-text backdrop-blur-md relative">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-3 text-zinc-500 font-sans font-bold select-none text-[9.5px] tracking-wider sticky top-0 bg-[#070707]/90 backdrop-blur-md z-10">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                      </div>
                      <span className="flex items-center gap-1.5 font-mono text-[9px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>SHELL_TRACE_SYS</span>
                      </span>
                    </div>

                    {currentTab === "coolify" && (
                      <div className="flex flex-col gap-1">
                        <p className="text-zinc-500">[INFO] Initializing OIDC Provider Registration Flow...</p>
                        <p className="text-emerald-400">&gt; PHP Socialite Generic OIDC Driver Loaded.</p>
                        <p className="text-emerald-400">&gt; Migration applied: Added client_id, client_secret, issuer to oauth_settings table.</p>
                        <p className="text-zinc-500">[AUTH] Calling OAuth callback handleRedirectForProvider()...</p>
                        <p className="text-amber-400">&gt; Redirecting client to issuer URL: https://identity.provider/auth/realms/coolify</p>
                        <p className="text-emerald-400">&gt; Callback received: code=0a8f8d9b1c, state=validated</p>
                        <p className="text-emerald-400">&gt; JWT token signatures validated against JWKS endpoints.</p>
                        <p className="text-green-500">[SUCCESS] Admin user authenticated. Coolify session created.</p>
                      </div>
                    )}

                    {currentTab === "archestra" && (
                      <div className="flex flex-col gap-1">
                        <p className="text-zinc-500">[SYSTEM] Orchestrator loading A2A v2 agentic event loop...</p>
                        <p className="text-emerald-400">&gt; Executing trigger: Agent1 (DataCollector) -&gt; Agent2 (ReportGenerator)</p>
                        <p className="text-emerald-400">&gt; Event Stream opened inside A2AExecutor.ts.</p>
                        <p className="text-zinc-500">[STREAM] Relaying token stream in chunk packets...</p>
                        <p className="text-amber-400">&gt; Chunk 1: "Analyzing customer logs for anomaly vectors..." [OK]</p>
                        <p className="text-amber-400">&gt; Chunk 2: "Anomaly detected in endpoint OAuth token verify." [OK]</p>
                        <p className="text-emerald-400">&gt; Agent2 execution complete. Status: SUCCESS.</p>
                        <p className="text-zinc-500">[WEBHOOK] Triggering webhook callback: https://company.api/webhooks/alerts</p>
                        <p className="text-green-500">[SUCCESS] Callback payload dispatched successfully (200 OK).</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Tabbed Selector & Details */}
                <div className="w-full lg:w-[420px] flex flex-col justify-between gap-6 shrink-0">
                  <div className="flex flex-col gap-6">
                    {/* Tab Navigation */}
                    <div className="flex border-b border-white/5 pb-2 gap-4 select-none">
                      <style dangerouslySetInnerHTML={{__html: `
                        @keyframes redTabPulse {
                          0%, 100% {
                            color: rgb(113, 113, 122);
                            text-shadow: none;
                          }
                          50% {
                            color: rgb(239, 68, 68);
                            text-shadow: 0 0 10px rgba(239, 68, 68, 0.6);
                          }
                        }
                        .animate-red-tab-pulse {
                          animation: redTabPulse 2.5s infinite ease-in-out;
                        }
                      `}} />
                      <button
                        onClick={() => setActiveOpenSourceTab("coolify")}
                        className={`text-xs font-bold tracking-wider uppercase transition-all duration-500 pb-1.5 border-b-2 cursor-pointer ${
                          currentTab === "coolify" ? "text-red-500 border-red-500" : "text-zinc-500 border-transparent hover:text-white animate-red-tab-pulse"
                        }`}
                      >
                        Coolify (Dev Tool)
                      </button>
                      <button
                        onClick={() => setActiveOpenSourceTab("archestra")}
                        className={`text-xs font-bold tracking-wider uppercase transition-all duration-500 pb-1.5 border-b-2 cursor-pointer ${
                          currentTab === "archestra" ? "text-red-500 border-red-500" : "text-zinc-500 border-transparent hover:text-white animate-red-tab-pulse"
                        }`}
                      >
                        Archestra (Automation)
                      </button>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold tracking-widest text-red-500 uppercase">{project.category}</span>
                      <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-white mt-1">{project.title}</h3>
                      <p className="text-red-400/90 text-xs font-semibold tracking-wide mt-2">{project.tagline}</p>
                    </div>

                    <p className="text-zinc-350 text-xs sm:text-sm font-light leading-relaxed">
                      {project.desc}
                    </p>

                    <div>
                      <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Contribution Highlights</span>
                      <ul className="flex flex-col gap-2.5 mt-3">
                        {project.highlights.map((h, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-xs text-zinc-300 font-light leading-relaxed">
                            <svg className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Technologies</span>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {project.tech.map((t, i) => (
                          <span key={i} className="px-3 py-1 text-[10.5px] font-medium tracking-wide rounded-lg bg-white/[0.03] border border-white/[0.06] text-zinc-400 select-none hover:border-red-500/20 hover:text-white hover:bg-white/[0.05] transition-all duration-300">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-4 border-t border-white/5 mt-6 lg:mt-8">
                    <a 
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 group inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs tracking-wider uppercase transition-all duration-300 ease-out hover:shadow-[0_8px_20px_rgba(239,68,68,0.25)] text-center no-underline cursor-pointer"
                    >
                      <span>View Pull Request</span>
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.193 22 16.44 22 12.017 22 6.484 17.522 2 12 2z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        const project = projectData[activeProjectModal];
        if (!project) return null;

        return (
          <>
            {/* Modal Backdrop Overlay */}
            <div
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl animate-fadeIn cursor-pointer"
              onClick={() => setActiveProjectModal(null)}
            />

            {/* Modal Glass Window Wrapper */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 pointer-events-none select-none">
              <div
                className="pointer-events-auto relative w-full max-w-5xl max-h-[88vh] rounded-3xl bg-zinc-950/95 border border-white/10 backdrop-blur-2xl shadow-[0_30px_90px_rgba(239,68,68,0.15)] overflow-y-auto p-6 sm:p-10 md:p-12 pb-12 sm:pb-16 flex flex-col gap-8 sm:gap-10 animate-scaleUp text-white"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Top Close Button */}
                <button
                  onClick={() => setActiveProjectModal(null)}
                  className="absolute top-4 right-4 sm:top-6 sm:right-6 text-zinc-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.1] p-2.5 rounded-full border border-white/10 transition-all duration-300 cursor-pointer z-30 shadow-lg"
                  title="Close Case Study"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {activeProjectModal === "promptops" ? (
                  /* ── PROMPTOPS VIDEO CASE STUDY ── */
                  (() => {
                    const vid = project;
                    const formatTime = (s: number) => {
                      const m = Math.floor(s / 60);
                      const sec = Math.floor(s % 60);
                      return `${m}:${sec.toString().padStart(2, '0')}`;
                    };
                    const handleVideoToggle = () => {
                      const v = videoRef.current;
                      if (!v) return;
                      if (v.paused) { v.play(); setVideoIsPlaying(true); }
                      else { v.pause(); setVideoIsPlaying(false); }
                    };
                    const handleVideoSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
                      const v = videoRef.current;
                      if (!v) return;
                      const t = (parseFloat(e.target.value) / 100) * v.duration;
                      v.currentTime = t;
                      setVideoProgress(parseFloat(e.target.value));
                    };
                    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                      const v = videoRef.current;
                      if (!v) return;
                      const vol = parseFloat(e.target.value);
                      v.volume = vol;
                      setVideoVolume(vol);
                      setVideoMuted(vol === 0);
                      v.muted = vol === 0;
                    };
                    const handleMuteToggle = () => {
                      const v = videoRef.current;
                      if (!v) return;
                      const next = !v.muted;
                      v.muted = next;
                      setVideoMuted(next);
                    };
                    const handleSkip = (seconds: number) => {
                      const v = videoRef.current;
                      if (!v) return;
                      v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + seconds));
                    };
                    const handleFullscreen = () => {
                      const v = videoRef.current;
                      if (!v) return;
                      if (document.fullscreenElement) { document.exitFullscreen(); }
                      else { v.requestFullscreen(); }
                    };
                    const handleMouseMove = () => {
                      setVideoShowControls(true);
                      if (videoControlsTimerRef.current) clearTimeout(videoControlsTimerRef.current);
                      videoControlsTimerRef.current = setTimeout(() => {
                        if (videoIsPlaying) setVideoShowControls(false);
                      }, 2800);
                    };
                    return (
                      <div className="flex flex-col gap-8 w-full pb-8 sm:pb-12">
                        {/* Header */}
                        <div className="flex flex-col gap-3 border-b border-white/[0.08] pb-6">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-[10px] font-bold tracking-widest uppercase">
                              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]" />
                              AI SaaS
                            </span>
                            <span className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-[10px] font-semibold tracking-wider">ENTERPRISE SECURITY</span>
                            <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px] font-semibold tracking-wider">DEMO WITH VOICE</span>
                          </div>
                          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white uppercase pr-10">
                            PromptOps Platform
                          </h2>
                          <p className="text-red-400 text-xs sm:text-sm font-semibold tracking-widest uppercase">Enterprise System Prompt Security &amp; Analytics SaaS</p>
                          <p className="text-zinc-300 text-sm leading-relaxed font-light max-w-3xl">
                            {vid.desc}
                          </p>
                        </div>

                        {/* ── CUSTOM VIDEO PLAYER ── */}
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-zinc-500 uppercase flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                              Live Product Demo — Voiced Walkthrough
                            </span>
                            <span className="text-[10px] font-mono text-zinc-500">
                              {formatTime(videoProgress * videoDuration / 100)} / {formatTime(videoDuration)}
                            </span>
                          </div>

                          {/* Video Container */}
                          <div
                            className="group relative w-full rounded-2xl overflow-hidden border border-white/10 bg-black shadow-[0_20px_60px_rgba(0,0,0,0.8)] cursor-pointer select-none"
                            style={{ aspectRatio: '16/9' }}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={() => { if (videoIsPlaying) setVideoShowControls(false); }}
                            onClick={handleVideoToggle}
                          >
                            <video
                              ref={videoRef}
                              src="/PromptOps_Demo_Voiced.mp4"
                              className="w-full h-full object-cover"
                              preload="metadata"
                              playsInline
                              onTimeUpdate={(e) => {
                                const v = e.currentTarget;
                                if (v.duration) setVideoProgress((v.currentTime / v.duration) * 100);
                              }}
                              onLoadedMetadata={(e) => setVideoDuration(e.currentTarget.duration)}
                              onPlay={() => setVideoIsPlaying(true)}
                              onPause={() => setVideoIsPlaying(false)}
                              onEnded={() => { setVideoIsPlaying(false); setVideoProgress(0); }}
                            />

                            {/* Big Play Overlay (shows when paused) */}
                            {!videoIsPlaying && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all duration-300">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-red-600/90 border-2 border-red-400/40 flex items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.5)] hover:scale-110 transition-transform duration-200">
                                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                  </svg>
                                </div>
                              </div>
                            )}

                            {/* Controls Bar */}
                            <div
                              className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent px-4 pb-4 pt-10 transition-all duration-300 ${videoShowControls || !videoIsPlaying ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {/* Progress Bar */}
                              <div className="relative w-full h-1.5 group/progress mb-4 cursor-pointer">
                                <div className="absolute inset-y-0 left-0 right-0 bg-white/20 rounded-full" />
                                <div
                                  className="absolute inset-y-0 left-0 bg-red-500 rounded-full transition-all duration-100"
                                  style={{ width: `${videoProgress}%` }}
                                />
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  step="0.1"
                                  value={videoProgress}
                                  onChange={handleVideoSeek}
                                  className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
                                  aria-label="Video progress"
                                />
                                {/* Thumb indicator */}
                                <div
                                  className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-white shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity duration-200 pointer-events-none"
                                  style={{ left: `calc(${videoProgress}% - 7px)` }}
                                />
                              </div>

                              {/* Controls Row */}
                              <div className="flex items-center justify-between gap-3">
                                {/* Left: Play/Pause + Skip + Time */}
                                <div className="flex items-center gap-3">
                                  {/* Skip back 10s */}
                                  <button
                                    onClick={() => handleSkip(-10)}
                                    className="text-white/70 hover:text-white transition-colors duration-150 cursor-pointer flex items-center"
                                    title="Skip back 10s"
                                    aria-label="Skip back 10 seconds"
                                  >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
                                      <text x="8.5" y="15" fontSize="5" fontWeight="bold" fill="white" textAnchor="middle">10</text>
                                    </svg>
                                  </button>

                                  {/* Play/Pause */}
                                  <button
                                    onClick={handleVideoToggle}
                                    className="w-9 h-9 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:shadow-[0_0_20px_rgba(239,68,68,0.6)] transition-all duration-200 cursor-pointer shrink-0"
                                    title={videoIsPlaying ? 'Pause' : 'Play'}
                                    aria-label={videoIsPlaying ? 'Pause video' : 'Play video'}
                                  >
                                    {videoIsPlaying ? (
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                                      </svg>
                                    ) : (
                                      <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z"/>
                                      </svg>
                                    )}
                                  </button>

                                  {/* Skip forward 10s */}
                                  <button
                                    onClick={() => handleSkip(10)}
                                    className="text-white/70 hover:text-white transition-colors duration-150 cursor-pointer flex items-center"
                                    title="Skip forward 10s"
                                    aria-label="Skip forward 10 seconds"
                                  >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"/>
                                      <text x="15.5" y="15" fontSize="5" fontWeight="bold" fill="white" textAnchor="middle">10</text>
                                    </svg>
                                  </button>

                                  {/* Timestamp */}
                                  <span className="text-white/60 font-mono text-[11px] hidden sm:block select-none">
                                    {formatTime(videoProgress * videoDuration / 100)} / {formatTime(videoDuration)}
                                  </span>
                                </div>

                                {/* Right: Volume + Fullscreen */}
                                <div className="flex items-center gap-3">
                                  {/* Mute Toggle */}
                                  <button
                                    onClick={handleMuteToggle}
                                    className="text-white/70 hover:text-white transition-colors duration-150 cursor-pointer"
                                    title={videoMuted ? 'Unmute' : 'Mute'}
                                    aria-label={videoMuted ? 'Unmute video' : 'Mute video'}
                                  >
                                    {videoMuted || videoVolume === 0 ? (
                                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                                      </svg>
                                    ) : videoVolume < 0.5 ? (
                                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
                                      </svg>
                                    ) : (
                                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                                      </svg>
                                    )}
                                  </button>

                                  {/* Volume Slider */}
                                  <div className="hidden sm:flex items-center w-20 relative group/vol">
                                    <div className="absolute inset-y-0 left-0 right-0 flex items-center">
                                      <div className="w-full h-1 bg-white/20 rounded-full" />
                                      <div
                                        className="absolute h-1 bg-red-500 rounded-full pointer-events-none"
                                        style={{ width: `${videoMuted ? 0 : videoVolume * 100}%` }}
                                      />
                                    </div>
                                    <input
                                      type="range"
                                      min="0"
                                      max="1"
                                      step="0.02"
                                      value={videoMuted ? 0 : videoVolume}
                                      onChange={handleVolumeChange}
                                      className="w-full opacity-0 h-4 cursor-pointer relative z-10"
                                      aria-label="Volume"
                                    />
                                  </div>

                                  {/* Fullscreen */}
                                  <button
                                    onClick={handleFullscreen}
                                    className="text-white/70 hover:text-white transition-colors duration-150 cursor-pointer"
                                    title="Toggle Fullscreen"
                                    aria-label="Toggle fullscreen"
                                  >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Key Features */}
                        <div>
                          <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 uppercase">Key Features</span>
                          <ul className="flex flex-col gap-3 mt-3">
                            {vid.highlights.map((h, i) => (
                              <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-zinc-300 font-light leading-relaxed">
                                <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                                <span className="flex-1 min-w-0">{h}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Tech Badges */}
                        <div className="pb-2">
                          <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 uppercase">Technologies</span>
                          <div className="flex flex-wrap gap-2.5 mt-3 pl-1">
                            {vid.tech.map((t, i) => (
                              <span key={i} className="px-3.5 py-1.5 text-xs font-mono font-medium tracking-wide rounded-xl bg-white/[0.03] border border-white/[0.08] text-zinc-300 select-none hover:border-red-500/30 hover:text-white transition-all duration-300 whitespace-nowrap shrink-0">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Source Code CTA */}
                        {vid.github && (
                          <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                            <a
                              href={vid.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white font-bold text-xs tracking-wider uppercase transition-all duration-300"
                            >
                              <span>View Source Code</span>
                            </a>
                          </div>
                        )}

                        <div className="h-6 sm:h-10 w-full shrink-0" aria-hidden="true" />
                      </div>
                    );
                  })()
                ) : activeProjectModal === "qlink" ? (
                  /* ── Q-LINK ULTRA-PREMIUM GLASS CASE STUDY ── */
                  <div className="flex flex-col gap-8 sm:gap-10 w-full">
                    
                    {/* 1. HERO HEADER BLOCK */}
                    <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-6 sm:pb-8">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-[10px] sm:text-[11px] font-bold tracking-widest uppercase">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]" />
                          Secure Communication Startup
                        </span>
                        <span className="px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-400 font-mono text-[10px] font-semibold tracking-wider">
                          0.3% FOUNDING EQUITY
                        </span>
                        <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-semibold tracking-wider">
                          PRODUCTION READY PWA
                        </span>
                      </div>

                      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mt-1">
                        <div>
                          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white uppercase">
                            Q-Link Chat
                          </h2>
                          <p className="text-red-400 text-xs sm:text-sm font-semibold tracking-widest uppercase mt-2">
                            Zero-Knowledge Encrypted Messaging Platform
                          </p>
                          <p className="text-zinc-300 text-sm sm:text-base leading-relaxed font-light mt-4 max-w-3xl">
                            A client-side end-to-end encrypted messaging Progressive Web App engineered entirely from scratch for a private startup founder in return for 0.3% founding equity.
                          </p>
                        </div>

                        {/* Top CTA Link */}
                        <a
                          href="https://q-link-v3-0.vercel.app"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group shrink-0 inline-flex items-center justify-center gap-3 px-7 py-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs tracking-widest uppercase transition-all duration-300 shadow-[0_10px_30px_rgba(239,68,68,0.3)] hover:shadow-[0_15px_40px_rgba(239,68,68,0.5)] no-underline cursor-pointer"
                        >
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_8px_#34d399]" />
                          <span>Launch Live App</span>
                          <svg className="w-4 h-4 text-white shrink-0 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H18m0 0v5.5m0-5.5L11.25 12.75M6 18h12" />
                          </svg>
                        </a>
                      </div>
                    </div>

                    {/* 2. 6-IMAGE GALLERY GRID (Responsive across ALL screens) */}
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-zinc-500 uppercase">
                            Application Interface &amp; UI Screens
                          </span>
                          <p className="text-zinc-400 text-xs mt-1 font-light">
                            Click any screenshot to inspect in full-screen high-resolution lightbox
                          </p>
                        </div>
                        <span className="text-xs font-mono text-zinc-500">6 Screens</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-2">
                        {[1, 2, 3, 4, 5, 6].map((idx) => (
                          <div
                            key={idx}
                            onClick={() => setLightboxImageIndex(idx - 1)}
                            className="group relative rounded-2xl overflow-hidden border border-white/10 bg-white/[0.02] hover:border-red-500/40 transition-all duration-300 cursor-pointer aspect-video shadow-xl"
                          >
                            <img
                              src={`/qlink/img${idx}.png`}
                              alt={`Q-Link App Screen ${idx}`}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            
                            {/* Dark gradient overlay on hover */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
                              <div className="self-end px-2.5 py-1 rounded-full bg-black/60 border border-white/20 backdrop-blur-md text-[10px] font-mono text-white flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                                </svg>
                                <span>EXPAND</span>
                              </div>
                              <span className="text-xs font-mono text-white font-medium tracking-wider">
                                Screen 0{idx} &mdash; Click to Enlarge
                              </span>
                            </div>

                            {/* Corner Badge */}
                            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/70 border border-white/10 text-[9.5px] font-mono text-zinc-300 backdrop-blur-md">
                              0{idx}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 3. KEY ENGINEERING HIGHLIGHTS (Glass Cards) */}
                    <div className="flex flex-col gap-4 mt-2">
                      <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-zinc-500 uppercase">
                        Technical Architecture &amp; Engineering Vectors
                      </span>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-1">
                        {[
                          {
                            title: "E2E Cryptography",
                            desc: "Zero-knowledge encryption strictly executed on client-side utilizing browser Web Crypto API (AES-GCM / Diffie-Hellman ECDH key exchange).",
                            badge: "Web Crypto API"
                          },
                          {
                            title: "Serverless Resiliency",
                            desc: "Structured background push notification dispatcher utilizing Promise.allSettled edge functions on Vercel infrastructure.",
                            badge: "Promise.allSettled"
                          },
                          {
                            title: "Offline Sync Engine",
                            desc: "Configured fault-tolerant Service Worker with local cache sync and system-level App Badging API bindings.",
                            badge: "PWA Service Worker"
                          },
                          {
                            title: "Client-Side Compression",
                            desc: "HTML5 Canvas-based dynamic client-side image payload compressor enforcing strict 4.5MB network limits.",
                            badge: "HTML5 Canvas"
                          }
                        ].map((item, i) => (
                          <div
                            key={i}
                            className="p-7 sm:p-9 rounded-[4px] bg-white/[0.02] border border-white/[0.08] hover:border-red-500/30 transition-all duration-300 flex flex-col justify-between gap-4 backdrop-blur-md"
                          >
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center justify-between gap-3">
                                <h3 className="text-base sm:text-lg font-bold text-white tracking-wide min-w-0 flex-1">
                                  {item.title}
                                </h3>
                                <span className="px-3.5 py-1 rounded-[3px] bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-[10px] whitespace-nowrap shrink-0">
                                  {item.badge}
                                </span>
                              </div>
                              <p className="text-zinc-300 text-xs sm:text-sm font-light leading-relaxed text-left">
                                {item.desc}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 4. TECHNOLOGIES STACK BADGES */}
                    <div className="flex flex-col gap-3">
                      <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-zinc-500 uppercase">
                        Technology Stack
                      </span>
                      <div className="flex flex-wrap gap-2.5">
                        {["Next.js", "React 19", "Prisma ORM", "Neon Postgres", "Web Crypto API", "Service Workers"].map((tech, i) => (
                          <span
                            key={i}
                            className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-red-500/30 text-zinc-300 text-xs font-mono font-medium transition-all duration-300 hover:text-white hover:bg-white/[0.06] whitespace-nowrap shrink-0"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* 5. LIVE TERMINAL CRYPTOGRAPHIC TRACE */}
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-zinc-500 uppercase">
                          Cryptographic Handshake Trace
                        </span>
                        <span className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-400">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>ECDH 256-BIT DISPATCH</span>
                        </span>
                      </div>

                      <div className="w-full rounded-2xl border border-white/10 bg-black/80 p-5 font-mono text-xs leading-relaxed text-emerald-400 shadow-inner overflow-x-auto relative">
                        <div className="flex items-center gap-2 pb-3 mb-3 border-b border-white/10 text-zinc-500 select-none">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                          <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                          <span className="ml-2 text-[10px] text-zinc-400 font-semibold">SHELL_TRACE_SYS</span>
                        </div>
                        <div className="flex flex-col gap-1 text-[11px] sm:text-xs">
                          <p className="text-zinc-500">[SECURE] Launching zero-knowledge client cryptographic handshake...</p>
                          <p className="text-emerald-400">&gt; Generating ECDH keypair utilizing browser Web Crypto API...</p>
                          <p className="text-emerald-400">&gt; Public key exported: 04a8b8c8d... [256-bit]</p>
                          <p className="text-zinc-500">[KEY_EXCHANGE] Deriving shared secret key via ECDH scheme...</p>
                          <p className="text-amber-400">&gt; Shared AES-GCM key derived on client-side.</p>
                          <p className="text-emerald-400">&gt; Encrypting message: "Zero-Knowledge message verification payload"</p>
                          <p className="text-emerald-400">&gt; Ciphertext generated: c3ff88b901a8ef8e18... IV=9a8d9b1c</p>
                          <p className="text-green-400 font-bold">&gt; [SUCCESS] Encrypted package dispatched to socket. Remote peers notified.</p>
                        </div>
                      </div>
                    </div>

                    {/* 6. CASE STUDY FOOTER & LIVE CTA */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-white/[0.08] mt-2">
                      <div className="flex flex-col gap-1 text-center sm:text-left">
                        <span className="text-white text-sm font-bold tracking-wide">Ready to test Q-Link Chat?</span>
                        <span className="text-zinc-400 text-xs font-light">Experience end-to-end zero-knowledge security live in browser.</span>
                      </div>

                      <a
                        href="https://q-link-v3-0.vercel.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs tracking-widest uppercase transition-all duration-300 shadow-[0_10px_30px_rgba(239,68,68,0.3)] hover:shadow-[0_15px_40px_rgba(239,68,68,0.5)] no-underline cursor-pointer w-full sm:w-auto shrink-0 flex-nowrap"
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_8px_#34d399]" />
                        <span>Launch Live App</span>
                        <svg className="w-4 h-4 text-white shrink-0 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H18m0 0v5.5m0-5.5L11.25 12.75M6 18h12" />
                        </svg>
                      </a>
                    </div>
                    {/* Bottom Safe Area Spacer */}
                    <div className="h-6 sm:h-10 w-full shrink-0" aria-hidden="true" />
                  </div>
                ) : (
                  /* ── OTHER PROJECTS MODAL ── */
                  <div className="flex flex-col gap-8 w-full pb-8 sm:pb-12">
                    <div>
                      <span className="text-[10px] font-mono font-bold tracking-widest text-red-500 uppercase">{project.category}</span>
                      <h3 className="text-2xl sm:text-3xl font-bold uppercase tracking-wider text-white mt-1 pr-10">{project.title}</h3>
                      <p className="text-red-400 text-xs sm:text-sm font-semibold tracking-wide mt-2">{project.tagline}</p>
                    </div>

                    <p className="text-zinc-300 text-sm font-light leading-relaxed">
                      {project.desc}
                    </p>

                    <div>
                      <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 uppercase">Key Features</span>
                      <ul className="flex flex-col gap-3 mt-3">
                        {project.highlights.map((h, i) => (
                          <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-zinc-300 font-light leading-relaxed">
                            <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                            <span className="flex-1 min-w-0">{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pb-2">
                      <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 uppercase">Technologies</span>
                      <div className="flex flex-wrap gap-2.5 mt-3 pl-1">
                        {project.tech.map((t, i) => (
                          <span key={i} className="px-3.5 py-1.5 text-xs font-mono font-medium tracking-wide rounded-xl bg-white/[0.03] border border-white/[0.08] text-zinc-300 select-none hover:border-red-500/30 hover:text-white transition-all duration-300 whitespace-nowrap shrink-0">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {(project.liveUrl || project.github) && (
                      <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-white/10 mt-4">
                        {project.liveUrl && (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs tracking-wider uppercase transition-all duration-300 w-full sm:w-auto text-center"
                          >
                            <span>Launch Live App</span>
                            <svg className="w-4 h-4 text-white shrink-0 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H18m0 0v5.5m0-5.5L11.25 12.75M6 18h12" />
                            </svg>
                          </a>
                        )}
                        {project.github && (
                          <a
                            href={project.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white font-bold text-xs tracking-wider uppercase transition-all duration-300 w-full sm:w-auto text-center"
                          >
                            <span>View Source Code</span>
                          </a>
                        )}
                      </div>
                    )}
                    {/* Dedicated bottom safe area spacer to guarantee zero clipping from rounded corners */}
                    <div className="h-6 sm:h-10 w-full shrink-0" aria-hidden="true" />
                  </div>
                )}
              </div>
            </div>

            {/* ── FULL-SCREEN LIGHTBOX OVERLAY (Opens high-res view of any selected screenshot) ── */}
            {lightboxImageIndex !== null && (
              <div
                className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 select-none animate-fadeIn"
                onClick={() => setLightboxImageIndex(null)}
              >
                {/* Close Button */}
                <button
                  onClick={() => setLightboxImageIndex(null)}
                  className="absolute top-6 right-6 text-zinc-400 hover:text-white bg-white/[0.1] hover:bg-white/[0.2] p-3 rounded-full border border-white/20 transition-all duration-300 cursor-pointer z-20 shadow-2xl"
                  title="Close Lightbox (Esc)"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Left Nav Arrow */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxImageIndex((prev) => (prev !== null ? (prev === 0 ? 5 : prev - 1) : null));
                  }}
                  className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/70 border border-white/20 text-white flex items-center justify-center hover:bg-red-600 hover:border-red-500 transition-all duration-300 z-20 cursor-pointer shadow-2xl"
                  title="Previous Screen (Left Arrow)"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>

                {/* Main High-Res Image Container */}
                <div
                  className="relative max-w-[90vw] max-h-[85vh] flex items-center justify-center animate-scaleUp"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img
                    src={`/qlink/img${lightboxImageIndex + 1}.png`}
                    alt={`Q-Link High-Res Screen ${lightboxImageIndex + 1}`}
                    className="max-w-full max-h-[85vh] object-contain rounded-2xl border border-white/20 shadow-[0_25px_80px_rgba(0,0,0,0.9)]"
                  />
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/80 border border-white/10 backdrop-blur-md text-white font-mono text-xs tracking-widest">
                    SCREEN 0{lightboxImageIndex + 1} OF 06
                  </div>
                </div>

                {/* Right Nav Arrow */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxImageIndex((prev) => (prev !== null ? (prev === 5 ? 0 : prev + 1) : null));
                  }}
                  className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/70 border border-white/20 text-white flex items-center justify-center hover:bg-red-600 hover:border-red-500 transition-all duration-300 z-20 cursor-pointer shadow-2xl"
                  title="Next Screen (Right Arrow)"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
            )}
          </>
        );
      })()}
      {!loading && !gateUnlocked && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#030303] select-none">
          {/* Ambient decorative grid behind modal */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none opacity-40 animate-fadeIn" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-red-600/10 blur-[100px] pointer-events-none animate-fadeIn" />

          {/* Centering wrapper — min-h-full keeps card centered when short, scroll works when tall */}
          <div className="relative flex min-h-full items-center justify-center p-4 py-8">
          {/* Gating crystal glass container */}
          <div className="relative w-full max-w-3xl p-8 sm:p-12 md:p-14 rounded-2xl bg-zinc-950/80 border border-white/10 backdrop-blur-2xl shadow-2xl animate-scaleUp">
            {/* Close / Dismiss Vetting Gate Button */}
            <button
              onClick={unlockGate}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full text-zinc-400 hover:text-white bg-white/[0.05] hover:bg-white/10 border border-white/10 transition-colors duration-200 cursor-pointer z-20"
              title="Close and explore portfolio directly"
              aria-label="Close Vetting Gate"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {/* Step 0: Gateway Intro */}
            {gateStep === 0 && (
              <div className="flex flex-col gap-8">

                {/* ── Header ── */}
                <div className="flex items-center justify-between pb-4 border-b border-white/[0.07]">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse shrink-0" />
                    <span className="text-[13px] font-mono font-semibold tracking-[0.18em] text-zinc-300 uppercase">
                      Intake System
                    </span>
                  </div>
                  <span className="text-[12px] font-mono font-bold tracking-[0.15em] text-zinc-400 uppercase bg-white/[0.04] border border-white/10 px-3 py-1 rounded-full">
                    ~2 min
                  </span>
                </div>

                {/* ── Title block ── */}
                <div className="flex flex-col gap-3">
                  <span className="text-[11px] font-bold text-red-500 uppercase tracking-[0.25em]">
                    Alignment Protocol
                  </span>
                  <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight leading-tight">
                    Cognitive Vetting<br />
                    <span className="text-zinc-400 font-semibold">Gateway</span>
                  </h1>
                  <p className="text-zinc-400 text-[13px] font-mono tracking-wider italic">
                    &ldquo;Engineering connections with intention.&rdquo;
                  </p>
                </div>

                {/* ── Description card ── */}
                <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/[0.09] flex flex-col gap-4">
                  <p className="text-zinc-200 text-sm sm:text-[15px] leading-relaxed font-light">
                    Before exploring my work and resume, you&apos;ll go through a quick{' '}
                    <strong className="text-white font-semibold">Alignment Questionnaire</strong> — a
                    structured intake that maps your team&apos;s stack, operational model, and priorities
                    against my capabilities.
                  </p>
                  <p className="text-zinc-500 text-[13px] leading-relaxed">
                    A <strong className="text-zinc-300">Mutual Fit Analytics Report</strong> with a
                    compatibility score is generated instantly upon completion.
                  </p>
                </div>

                {/* ── Process strip ── */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: '4 Questions', sub: 'Stack · Role · Culture · Budget' },
                    { label: '~2 Minutes', sub: 'Quick structured intake' },
                    { label: 'Instant Report', sub: 'Alignment score + analysis' },
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col gap-1 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
                      <span className="text-white text-[13px] font-bold">{item.label}</span>
                      <span className="text-zinc-500 text-[10px] leading-snug">{item.sub}</span>
                    </div>
                  ))}
                </div>

                {/* ── CTA ── */}
                <div className="pt-2 border-t border-white/[0.07]">
                  <button
                    onClick={() => setGateStep(1)}
                    className="group w-full text-white font-bold text-[11px] tracking-[0.18em] uppercase transition-all duration-300 ease-out hover:scale-[1.01] cursor-pointer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                      padding: '15px 28px', minHeight: '52px', borderRadius: '12px', lineHeight: '1.2',
                      background: 'linear-gradient(135deg, #dc2626 0%, #9f1239 100%)',
                      boxShadow: '0 4px 24px rgba(220,38,38,0.25)',
                    }}
                  >
                    <span>Begin Alignment Check</span>
                    <svg className="w-4 h-4 text-white transition-transform duration-300 group-hover:translate-x-1 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Steps 1–4: Questions */}
            {gateStep >= 1 && gateStep <= 4 && (() => {
              const currentQ = questions[gateStep - 1];
              const selectedAnswer = getSelectedAnswer();
              return (
                <div className="flex flex-col gap-7 text-left">

                  {/* ── Header ── */}
                  <div className="flex items-center justify-between pb-4 border-b border-white/[0.07]">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse shrink-0" />
                      <span className="text-[13px] font-mono font-semibold tracking-[0.18em] text-zinc-300 uppercase">
                        Alignment Assessor
                      </span>
                    </div>
                    <span className="text-[12px] font-mono font-bold tracking-[0.15em] text-zinc-400 uppercase bg-white/[0.04] border border-white/10 px-3 py-1 rounded-full">
                      Step {gateStep} / 5
                    </span>
                  </div>

                  {/* ── Progress bar ── */}
                  <div className="w-full h-[3px] bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-600 to-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)] transition-all duration-500 ease-out"
                      style={{ width: `${(gateStep / 5) * 100}%` }}
                    />
                  </div>

                  {/* ── Question title ── */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[11px] font-bold text-red-500 uppercase tracking-[0.25em]">
                      Question {gateStep} of 4
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight leading-snug">
                      {currentQ.q}
                    </h3>
                  </div>

                  {/* ── Option buttons ── */}
                  <div className="flex flex-col gap-3">
                    {currentQ.opts.map((opt, optIndex) => {
                      const isSelected = selectedAnswer === opt;
                      return (
                        <button
                          key={optIndex}
                          onClick={() => handleSelectOption(opt)}
                          className={`w-full px-5 py-4 rounded-2xl border text-left transition-all duration-300 flex items-center justify-between gap-4 cursor-pointer select-none ${
                            isSelected
                              ? 'border-red-500/60 bg-red-500/[0.07] shadow-[inset_0_0_0_1px_rgba(239,68,68,0.2)]'
                              : 'border-white/[0.07] bg-white/[0.02] hover:border-white/[0.15] hover:bg-white/[0.04]'
                          }`}
                        >
                          <span className={`text-[14px] font-semibold leading-snug ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                            {opt}
                          </span>
                          <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${
                            isSelected ? 'border-red-500 bg-red-500' : 'border-white/20 bg-transparent'
                          }`}>
                            {isSelected && (
                              <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* ── Navigation ── */}
                  <div className="flex items-center gap-4 pt-4 border-t border-white/[0.07]">
                    <button
                      onClick={handlePrevStep}
                      className="border border-white/10 text-zinc-400 hover:text-white hover:bg-white/[0.05] font-semibold text-[11px] tracking-[0.15em] uppercase transition-all duration-300 cursor-pointer"
                      style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', padding:'13px 24px', minHeight:'48px', borderRadius:'10px', lineHeight:'1.2' }}
                    >
                      ← Back
                    </button>
                    <button
                      disabled={!isOptionSelected()}
                      onClick={handleNextStep}
                      className={`flex-1 font-bold text-[11px] tracking-[0.15em] uppercase transition-all duration-300 ${
                        isOptionSelected()
                          ? 'text-white cursor-pointer'
                          : 'text-zinc-600 cursor-not-allowed'
                      }`}
                      style={{
                        display:'inline-flex', alignItems:'center', justifyContent:'center', gap:'10px',
                        padding:'13px 24px', minHeight:'48px', borderRadius:'10px', lineHeight:'1.2',
                        background: isOptionSelected()
                          ? 'linear-gradient(135deg, #dc2626 0%, #9f1239 100%)'
                          : 'rgba(255,255,255,0.03)',
                        border: isOptionSelected() ? 'none' : '1px solid rgba(255,255,255,0.07)',
                        boxShadow: isOptionSelected() ? '0 4px 20px rgba(220,38,38,0.2)' : 'none',
                      }}
                    >
                      <span>{gateStep === 4 ? 'Final Step →' : 'Next Question'}</span>
                      {isOptionSelected() && (
                        <svg className="w-4 h-4 text-white shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Step 5: Work Structure Transparency */}
            {gateStep === 5 && (
              <div className="flex flex-col gap-7 text-left">

                {/* ── Header ── */}
                <div className="flex items-center justify-between pb-4 border-b border-white/[0.07]">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)] animate-pulse shrink-0" />
                    <span className="text-[13px] font-mono font-semibold tracking-[0.18em] text-zinc-300 uppercase">
                      Work Structure Overview
                    </span>
                  </div>
                  <span className="text-[12px] font-mono font-bold tracking-[0.15em] text-zinc-400 uppercase bg-white/[0.04] border border-white/10 px-3 py-1 rounded-full">
                    Step 5 / 5
                  </span>
                </div>

                {/* ── Full-width progress bar ── */}
                <div className="w-full h-[3px] bg-white/[0.06] rounded-full overflow-hidden">
                  <div className="h-full w-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.4)]" />
                </div>

                {/* ── Section title block ── */}
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-bold text-amber-400/80 uppercase tracking-[0.25em]">
                    Full Transparency
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight leading-snug">
                    Clean Contractor Model.<br className="hidden sm:block" />
                    <span className="text-zinc-400 font-semibold">Zero Overhead for You.</span>
                  </h3>
                </div>

                {/* ── Insight card (neutral/positive framing) ── */}
                <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/[0.09] flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="text-zinc-200 text-sm sm:text-[15px] leading-relaxed font-light">
                      I&apos;m 17 — and I believe in being upfront about it. I work as a{' '}
                      <strong className="text-white font-semibold">fully accountable Independent Contractor</strong>,
                      with agreements co-signed by my parent. For you, this means:
                    </p>
                    <ul className="flex flex-col gap-1.5 mt-1">
                      {[
                        'No full-time hiring overhead or equity dilution',
                        'Clean, simple contract terms — project or retainer',
                        'Full delivery accountability backed by legal standing',
                      ].map((benefit, i) => (
                        <li key={i} className="flex items-center gap-2.5 text-[13px] text-zinc-300 font-light">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* ── Social proof nudge ── */}
                <p className="text-zinc-500 text-[13px] leading-relaxed italic border-l-2 border-white/10 pl-4">
                  &ldquo;Many early-stage founders and CTOs actually prefer this model — faster to onboard, simpler to exit, and no long-term commitment overhead.&rdquo;
                </p>

                {/* ── CTA question ── */}
                <p className="text-zinc-300 text-sm sm:text-[15px] leading-relaxed font-medium">
                  Does this work structure align with your team&apos;s way of working?
                </p>

                {/* ── Navigation & action buttons ── */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4 border-t border-white/[0.07]">
                  <button
                    onClick={handlePrevStep}
                    className="border border-white/10 text-zinc-400 hover:text-white hover:bg-white/[0.05] font-semibold text-[11px] tracking-[0.15em] uppercase transition-all duration-300 cursor-pointer"
                    style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', padding:'13px 24px', minHeight:'48px', borderRadius:'10px', lineHeight:'1.2' }}
                  >
                    ← Back
                  </button>

                  <button
                    onClick={() => setGateStep(8)}
                    className="border border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.05] text-zinc-500 hover:text-zinc-300 font-semibold text-[11px] tracking-[0.15em] uppercase transition-all duration-300 cursor-pointer overflow-hidden relative"
                    style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', padding:'13px 24px', minHeight:'48px', borderRadius:'10px', lineHeight:'1.2' }}
                  >
                    <span className="relative inline-block transition-all duration-500 ease-in-out"
                      style={{ transform: rejectButtonPhase === 'transition' ? 'translateY(-15px)' : 'translateY(0)', opacity: rejectButtonPhase === 'transition' ? '0' : '1' }}>
                      Doesn&apos;t Fit
                    </span>
                    <span className="absolute inset-0 flex items-center justify-center transition-all duration-500 ease-in-out"
                      style={{ transform: rejectButtonPhase === 'transition' ? 'translateY(0)' : 'translateY(15px)', opacity: rejectButtonPhase === 'transition' ? '1' : '0' }}>
                      Skip for Now
                    </span>
                  </button>

                  <button
                    onClick={() => setGateStep(6)}
                    className="flex-1 text-white font-bold text-[11px] tracking-[0.15em] uppercase transition-all duration-300 cursor-pointer overflow-hidden relative"
                    style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', padding:'13px 24px', minHeight:'48px', borderRadius:'10px', lineHeight:'1.2', background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)', boxShadow: '0 4px 20px rgba(124,58,237,0.25)' }}
                  >
                    <span className="relative inline-block transition-all duration-500 ease-in-out"
                      style={{ transform: supportButtonPhase === 'transition' ? 'translateY(-15px)' : 'translateY(0)', opacity: supportButtonPhase === 'transition' ? '0' : '1' }}>
                      Works for Us →
                    </span>
                    <span className="absolute inset-0 flex items-center justify-center transition-all duration-500 ease-in-out"
                      style={{ transform: supportButtonPhase === 'transition' ? 'translateY(0)' : 'translateY(15px)', opacity: supportButtonPhase === 'transition' ? '1' : '0' }}>
                      Show Me the Work ✦
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 6: Loading / Analyzing */}
            {gateStep === 6 && (
              <div className="flex flex-col items-center justify-center py-10 gap-6">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                  <span className="absolute inset-0 rounded-full border-t border-t-red-500 border-r border-r-red-500/30 animate-spin" />
                  <span className="font-mono text-xs text-red-500 animate-pulse">99%</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest animate-pulse">Running Alignment Analytics</span>
                  <div className="w-[180px] h-1 bg-white/[0.03] rounded-full overflow-hidden border border-white/[0.04]">
                    <div className="h-full bg-red-600 animate-progressBar" />
                  </div>
                </div>
                <div className="w-full p-4 rounded-xl bg-black/40 border border-white/5 font-mono text-[9px] sm:text-[10px] text-zinc-500 flex flex-col gap-1 text-left max-h-[120px] overflow-hidden select-none">
                  <p>&gt; Booting alignment analyzer...</p>
                  <p className="text-emerald-400">&gt; Matching stack priorities against developer profile...</p>
                  <p className="text-amber-400">&gt; Computing async remote compatibility vectors...</p>
                  <p className="text-emerald-400">&gt; Validating parental compliance co-signing parameters...</p>
                </div>
              </div>
            )}

            {/* Step 7: Report and Reveal */}
            {gateStep === 7 && (() => {
              const score = calculateVibeScore();
              return (
                <div className="flex flex-col gap-6 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
                    <span className="text-[10px] font-bold tracking-[0.3em] text-green-500 uppercase">Analysis Complete</span>
                    <h2 className="text-3xl font-display font-bold text-white uppercase tracking-wider mt-2">Mutual Fit Report</h2>
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-2" />

                  {/* Vibe Score Radial Indicator */}
                  <div className="flex flex-col items-center gap-4 my-2">
                    <div className="relative w-32 h-32 flex items-center justify-center rounded-full bg-white/[0.02] border-2 border-white/5 shadow-inner">
                      <svg className="absolute w-28 h-28 transform -rotate-90">
                        <circle
                          cx="56"
                          cy="56"
                          r="50"
                          stroke="rgba(255,255,255,0.03)"
                          strokeWidth="6"
                          fill="transparent"
                        />
                        <circle
                          cx="56"
                          cy="56"
                          r="50"
                          stroke="#ef4444"
                          strokeWidth="6"
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 50}
                          strokeDashoffset={2 * Math.PI * 50 * (1 - score / 100)}
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <span className="text-3xl font-display font-extrabold text-white">{score}%</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Alignment Score</span>
                  </div>

                  {/* Report summary card */}
                  <div className="p-4 sm:p-5 rounded-xl bg-white/[0.02] border border-white/5 text-left flex flex-col gap-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Evaluation</span>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-light">
                      {score >= 90 
                        ? "EXCELLENT SYNERGY. Your requirements indicate an ideal remote operational fit, aligning perfectly with my stack expertise in Next.js + Python and prioritization of fast high-fidelity product deliveries under our parental contractor setup."
                        : score >= 80
                        ? "STRONG FIT. Great alignment in product philosophies and technical priorities. Valid remote workflows, parental co-signature readiness, and shared product velocity make this a highly viable connection."
                        : "COMPATIBLE MATCH. Your stack and business requirements intersect key areas of my capability guidelines. Vibe details and contractor parameters can be calibrated directly."
                      }
                    </p>
                  </div>

                  <div className="mt-6 flex flex-col items-center">
                    <button
                      onClick={unlockGate}
                      className="group bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] sm:text-[11px] tracking-[0.2em] uppercase transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-[0_10px_25px_rgba(239,68,68,0.3)] cursor-pointer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        padding: '14px 28px',
                        minHeight: '48px',
                        height: 'auto',
                        borderRadius: '12px',
                        lineHeight: '1.2'
                      }}
                    >
                      <span>Reveal Portfolio & Resume</span>
                      <svg className="w-4 h-4 text-white shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Step 8: Vibe Check Terminated / Fail Screen */}
            {gateStep === 8 && (
              <div className="flex flex-col gap-6 text-center animate-fadeIn">
                <div className="flex flex-col items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse" />
                  <span className="text-[10px] font-bold tracking-[0.3em] text-red-500 uppercase">Alignment Terminated</span>
                  <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white mt-2 uppercase tracking-wide">
                    Synergy Mismatch
                  </h2>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-2" />

                <p className="text-zinc-300 font-light text-sm sm:text-base leading-relaxed px-2">
                  Thank you for your interest. However, due to compliance, I operate exclusively under an Independent Contractor framework co-signed by my parents. 
                </p>
                
                <p className="text-zinc-500 font-light text-xs sm:text-sm leading-relaxed px-2">
                  If this was a selection error or your company parameters permit reconsideration, you can return to try the vetting system again.
                </p>

                <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4">
                  <button
                    onClick={unlockGate}
                    className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-[10px] sm:text-xs tracking-wider uppercase transition-all duration-300 cursor-pointer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '12px 24px',
                      minHeight: '44px',
                      height: 'auto',
                      borderRadius: '12px',
                      lineHeight: '1.2'
                    }}
                  >
                    Explore Portfolio Directly
                  </button>
                  <button
                    onClick={() => setGateStep(0)}
                    className="border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 font-semibold text-[10px] sm:text-xs tracking-wider uppercase transition-all duration-300 cursor-pointer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '12px 24px',
                      minHeight: '44px',
                      height: 'auto',
                      borderRadius: '12px',
                      lineHeight: '1.2'
                    }}
                  >
                    Restart Gate
                  </button>
                  <button
                    onClick={() => setGateStep(5)}
                    className="bg-red-950/20 border border-red-900/30 hover:border-red-500/50 text-red-400 hover:text-red-300 font-semibold text-[10px] sm:text-xs tracking-wider uppercase transition-all duration-300 cursor-pointer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '12px 24px',
                      minHeight: '44px',
                      height: 'auto',
                      borderRadius: '12px',
                      lineHeight: '1.2'
                    }}
                  >
                    Back to Legal Check
                  </button>
                </div>
              </div>
            )}
          </div>
          </div>
        </div>
      )}
    </main>
  );
}
 



 


