import React, { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { useApp } from "../context/AppContext";
import { motion, AnimatePresence } from "motion/react";
import { Speaker, Lightbulb, Calendar, Video, Instagram, Youtube, Mail, Phone, MapPin, ChevronRight, Menu, X, Volume2, VolumeX } from "lucide-react";
import { cn } from "../lib/utils";
import { PortfolioItem } from "../types";

const LandingPage = () => {
  const { state } = useApp();
  const Player = ReactPlayer as any;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicUrl, setMusicUrl] = useState("");
  const [isAgreed, setIsAgreed] = useState(false);
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [isAllPortfolioOpen, setIsAllPortfolioOpen] = useState(false);
  const [portfolioPage, setPortfolioPage] = useState(1);
  const [detailPage, setDetailPage] = useState(1);
  const [selectedDetailId, setSelectedDetailId] = useState<string | null>(null);
  const [captcha, setCaptcha] = useState({ question: "", answer: 0 });
  const [userCaptcha, setUserCaptcha] = useState("");
  const [captchaError, setCaptchaError] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const playerRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    document.body.style.backgroundColor = state.theme.backgroundColor;
    document.body.style.fontFamily = state.theme.fontFamily;
  }, [state.theme]);

  useEffect(() => {
    const rawUrl = state.content.backgroundMusicUrl;
    if (!rawUrl) {
      setMusicUrl("");
      return;
    }

    // If it's a base64 string (uploaded file), convert to Blob URL for better playback
    if (rawUrl.startsWith("data:")) {
      try {
        const parts = rawUrl.split(",");
        const byteString = atob(parts[1]);
        const mimeString = parts[0].split(":")[1].split(";")[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });
        const blobUrl = URL.createObjectURL(blob);
        setMusicUrl(blobUrl);
        
        return () => URL.revokeObjectURL(blobUrl);
      } catch (e) {
        console.error("Failed to create blob URL", e);
        setMusicUrl(rawUrl);
      }
    } else {
      setMusicUrl(normalizeUrl(rawUrl));
    }
  }, [state.content.backgroundMusicUrl]);

  const toggleMusic = () => {
    setIsMusicPlaying(!isMusicPlaying);
    if (audioRef.current) {
      if (!isMusicPlaying) {
        audioRef.current.play().catch(e => console.error("Audio play failed", e));
      } else {
        audioRef.current.pause();
      }
    }
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setCaptcha({
      question: `${num1} + ${num2} = ?`,
      answer: num1 + num2
    });
    setUserCaptcha("");
    setCaptchaError(false);
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (parseInt(userCaptcha) !== captcha.answer) {
      setCaptchaError(true);
      return;
    }

    setFormStatus("submitting");
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    try {
      const response = await fetch("https://formspree.io/f/mzdypgdj", {
        method: "POST",
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        setFormStatus("success");
        setIsAgreed(false);
        generateCaptcha();
        form.reset();
      } else {
        setFormStatus("error");
      }
    } catch (error) {
      setFormStatus("error");
    }
  };

  const iconMap: Record<string, any> = {
    Speaker,
    Lightbulb,
    Calendar,
    Video,
  };

  const normalizeUrl = (url: string) => {
    if (!url) return "";
    let cleanUrl = url.trim();
    
    // Handle YouTube Shorts
    if (cleanUrl.includes("youtube.com/shorts/")) {
      cleanUrl = cleanUrl.replace("youtube.com/shorts/", "youtube.com/watch?v=");
    }
    
    // Handle youtu.be
    if (cleanUrl.includes("youtu.be/")) {
      const id = cleanUrl.split("youtu.be/")[1]?.split("?")[0];
      if (id) cleanUrl = `https://www.youtube.com/watch?v=${id}`;
    }

    return cleanUrl;
  };

  const isYoutube = musicUrl.includes("youtube.com") || musicUrl.includes("youtu.be");

  return (
    <div className="min-h-screen text-[#1a1a1a] overflow-x-hidden luxury-bg scroll-smooth">
      {/* Spotlight Effect */}
      <motion.div 
        className="fixed inset-0 z-[1] pointer-events-none"
        animate={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.4), transparent 80%)`
        }}
        transition={{ type: "spring", damping: 20, stiffness: 100, mass: 0.5 }}
      />

      {/* Background Grid */}
      <div className="fixed inset-0 editorial-grid pointer-events-none opacity-40" />

      {/* Background Music (YouTube & File Support) */}
      <div 
        className={cn(
          "fixed pointer-events-none opacity-0",
          isYoutube ? "-top-[1000px] -left-[1000px]" : "inset-0"
        )}
      >
        {isYoutube ? (
          <Player
            key={musicUrl}
            ref={playerRef}
            url={musicUrl}
            playing={isMusicPlaying}
            loop
            volume={0.5}
            width="64px"
            height="64px"
            playsinline
            config={{
              youtube: {
                playerVars: { 
                  autoplay: 0,
                  controls: 0,
                  showinfo: 0,
                  rel: 0,
                  modestbranding: 1
                }
              }
            }}
            onReady={() => console.log("YouTube Player Ready")}
            onError={(e: any) => console.error("YouTube Player Error:", e)}
          />
        ) : (
          <audio
            ref={audioRef}
            key={musicUrl}
            src={musicUrl || undefined}
            loop
            preload="auto"
            onPlay={() => setIsMusicPlaying(true)}
            onPause={() => setIsMusicPlaying(false)}
          />
        )}
      </div>
      
      <button
        onClick={toggleMusic}
        className="fixed bottom-8 left-8 z-50 w-12 h-12 rounded-full bg-white/80 backdrop-blur-xl border border-[#1a1a1a]/10 flex items-center justify-center text-[#1a1a1a] hover:bg-white transition-all group shadow-lg"
        title={isMusicPlaying ? "음악 끄기" : "음악 켜기"}
      >
        <div className="absolute -top-12 left-0 bg-[#1a1a1a] text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          {isMusicPlaying ? "배경음악 중지" : "배경음악 재생"}
        </div>
        {isMusicPlaying ? (
          <div className="relative">
            <Volume2 size={20} />
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-[#1a1a1a]/10 rounded-full -z-10"
            />
          </div>
        ) : (
          <VolumeX size={20} />
        )}
      </button>
      <div className="fixed inset-0 pointer-events-none">
        {/* Editorial Background Elements */}
        <div className="absolute inset-0 editorial-grid opacity-20" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-[#1a1a1a]/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center cursor-pointer gap-2 md:gap-3" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            {state.content.logoUrl ? (
              <img 
                src={state.content.logoUrl} 
                alt="Logo" 
                className="w-6 h-6 md:w-8 md:h-8 object-contain"
                referrerPolicy="no-referrer"
              />
            ) : null}
            <div className="text-xl md:text-2xl font-black tracking-tighter text-[#1a1a1a]">
              BIG SOUND
            </div>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { id: "about", label: "소개" },
              { id: "services", label: "서비스" },
              { id: "portfolio", label: "포트폴리오" },
              { id: "contact", label: "문의" }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  const el = document.getElementById(item.id);
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-sm font-medium text-[#1a1a1a]/60 hover:text-[#1a1a1a] transition-colors"
              >
                {item.label}
              </button>
            ))}
            <a
              href="/admin"
              className="px-4 py-2 rounded-full text-sm font-semibold border border-[#1a1a1a]/10 hover:bg-[#1a1a1a]/5 transition-all text-[#1a1a1a]"
            >
              관리자
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-[#1a1a1a]" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-[#1a1a1a]/10 p-6 flex flex-col gap-4 shadow-xl"
          >
            {[
              { id: "about", label: "소개" },
              { id: "services", label: "서비스" },
              { id: "portfolio", label: "포트폴리오" },
              { id: "contact", label: "문의" }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  const el = document.getElementById(item.id);
                  el?.scrollIntoView({ behavior: 'smooth' });
                  setIsMenuOpen(false);
                }}
                className="text-left text-lg font-medium text-[#1a1a1a] hover:text-[#1a1a1a]/60 transition-colors"
              >
                {item.label}
              </button>
            ))}
            <a href="/admin" className="text-lg font-medium text-[#1a1a1a]/60">관리자</a>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center px-6 pt-20 overflow-hidden">
        {/* Background Glow */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] opacity-10 pointer-events-none"
          style={{ backgroundColor: state.theme.primaryColor }}
        />
        
        <div className="relative z-10 text-center max-w-5xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-display font-black tracking-tighter leading-[1.1] md:leading-[0.85] mb-8 text-[#1a1a1a] uppercase break-keep">
              {state.content.heroTitle.split(' ')[0]}
              <br />
              <span className="text-transparent" style={{ WebkitTextStroke: "1px #1a1a1a" }}>
                {state.content.heroTitle.split(' ').slice(1).join(' ')}
              </span>
            </h1>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base sm:text-lg md:text-2xl text-[#1a1a1a]/60 mb-12 font-light max-w-2xl mx-auto leading-relaxed px-4 break-keep text-center"
          >
            {state.content.heroSubtitle.includes("최고의 퀄리티는 작은 차이에서 시작한다.") ? (
              <>
                최고의 퀄리티는 작은 차이에서 시작한다.
                <br className="block md:hidden" />
                {" "}음향 전문 빅사운드
              </>
            ) : (
              state.content.heroSubtitle
            )}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <button 
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-10 py-5 rounded-full text-lg font-bold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-[#1a1a1a]/10 text-white"
              style={{ backgroundColor: state.theme.primaryColor }}
            >
              상담 문의하기
            </button>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 md:py-32 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-center md:text-left"
          >
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-serif italic font-medium mb-8 tracking-tight text-[#1a1a1a] break-keep">
              전문성과 감각의<br />완벽한 조화
            </h2>
            <p className="text-sm sm:text-base md:text-xl text-[#1a1a1a]/60 leading-relaxed font-light whitespace-pre-line break-keep">
              {state.content.aboutText}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative aspect-[4/3] md:aspect-video rounded-3xl overflow-hidden border border-[#1a1a1a]/5 shadow-2xl"
          >
            {state.content.aboutImageUrl && state.content.aboutImageUrl !== "" ? (
              <img 
                src={state.content.aboutImageUrl} 
                alt="Professional Stage Event" 
                className="object-cover w-full h-full"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-[#1a1a1a]/5 flex items-center justify-center text-[#1a1a1a]/20">
                이미지가 없습니다
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 md:py-32 px-6 bg-[#1a1a1a]/[0.02]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 md:mb-20 text-center md:text-left">
            <h2 className="text-3xl md:text-6xl font-serif italic mb-4 tracking-tight text-[#1a1a1a]">서비스 안내</h2>
            <div className="w-20 h-1 mx-auto md:mx-0" style={{ backgroundColor: state.theme.primaryColor }} />
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {state.content.services?.map((service, idx) => {
              const Icon = iconMap[service.icon] || Speaker;
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="p-8 rounded-3xl bg-white border border-[#1a1a1a]/5 shadow-sm hover:shadow-xl transition-all group"
                >
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: `${state.theme.primaryColor}10`, color: state.theme.primaryColor }}
                  >
                    <Icon size={28} />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold mb-4 text-[#1a1a1a] break-keep">{service.title}</h3>
                  <p className="text-sm md:text-base text-[#1a1a1a]/50 font-light leading-relaxed break-keep">
                    {service.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="portfolio" className="py-20 md:py-32 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-20 gap-8 text-center md:text-left">
          <div className="break-keep">
            <h2 className="text-2xl sm:text-3xl md:text-6xl font-serif italic mb-4 tracking-tight text-[#1a1a1a]">포트폴리오</h2>
            <p className="text-base sm:text-lg md:text-xl text-[#1a1a1a]/50 font-light italic">빅사운드가 만들어낸 최고의 순간들</p>
          </div>
          <button 
            onClick={() => {
              setIsAllPortfolioOpen(true);
              setPortfolioPage(1);
            }}
            className="flex items-center justify-center md:justify-start gap-2 text-sm font-bold group text-[#1a1a1a]"
          >
            전체 보기 <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {state.content.portfolio?.slice(0, 6).map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              onClick={() => setSelectedItem(item)}
              className="relative aspect-[4/3] rounded-[40px] overflow-hidden group cursor-pointer shadow-lg"
            >
              {item.imageUrl ? (
                <img 
                  src={item.imageUrl} 
                  alt={item.title} 
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full bg-[#1a1a1a]/5 flex items-center justify-center text-[#1a1a1a]/20">
                  이미지가 없습니다
                </div>
              )}
              <div className="absolute inset-0 bg-white/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-center items-center p-10 text-center">
                <span className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: state.theme.primaryColor }}>
                  {item.category}
                </span>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-serif italic font-medium text-[#1a1a1a] truncate w-full px-6 whitespace-nowrap">
                  {item.title}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 md:py-32 px-6 bg-[#1a1a1a]/[0.02]">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 md:gap-20">
          <div className="text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl md:text-6xl font-serif italic mb-8 md:mb-12 tracking-tight text-[#1a1a1a] break-keep">문의하기</h2>
            <div className="space-y-6 md:space-y-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6">
                <div className="w-12 h-12 rounded-xl bg-[#1a1a1a]/5 flex items-center justify-center shrink-0">
                  <Mail size={20} className="text-[#1a1a1a]" />
                </div>
                <div className="break-keep">
                  <p className="text-xs md:text-sm text-[#1a1a1a]/40 mb-1 font-medium">이메일</p>
                  <p className="text-sm md:text-lg font-medium text-[#1a1a1a]">{state.content.contact.email}</p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6">
                <div className="w-12 h-12 rounded-xl bg-[#1a1a1a]/5 flex items-center justify-center shrink-0">
                  <Phone size={20} className="text-[#1a1a1a]" />
                </div>
                <div className="break-keep">
                  <p className="text-xs md:text-sm text-[#1a1a1a]/40 mb-1 font-medium">전화번호</p>
                  <p className="text-sm md:text-lg font-medium text-[#1a1a1a]">{state.content.contact.phone}</p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6">
                <div className="w-12 h-12 rounded-xl bg-[#1a1a1a]/5 flex items-center justify-center shrink-0">
                  <MapPin size={20} className="text-[#1a1a1a]" />
                </div>
                <div className="break-keep">
                  <p className="text-xs md:text-sm text-[#1a1a1a]/40 mb-1 font-medium">주소</p>
                  <p className="text-sm md:text-lg font-medium text-[#1a1a1a]">{state.content.contact.address}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-center md:justify-start gap-4 mt-12 md:mt-16">
              {[
                { icon: Instagram, link: state.content.contact.instagram },
                { icon: Youtube, link: state.content.contact.youtube },
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.link}
                  className="w-12 h-12 rounded-full border border-[#1a1a1a]/10 flex items-center justify-center hover:bg-[#1a1a1a]/5 transition-colors text-[#1a1a1a]"
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 md:p-10 rounded-[32px] md:rounded-[40px] shadow-2xl border border-[#1a1a1a]/5">
            {formStatus === "success" ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12"
              >
                <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-[#1a1a1a]">문의가 성공적으로 전송되었습니다!</h3>
                <p className="text-[#1a1a1a]/60">확인 후 빠른 시일 내에 연락드리겠습니다.</p>
                <button 
                  onClick={() => {
                    setFormStatus("idle");
                    setIsAgreed(false);
                  }}
                  className="mt-6 text-sm font-medium text-[#1a1a1a] hover:underline"
                >
                  새로운 문의 보내기
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#1a1a1a]/60 uppercase tracking-widest">성함</label>
                    <input 
                      required
                      name="name"
                      type="text" 
                      className="w-full bg-[#1a1a1a]/[0.02] border border-[#1a1a1a]/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a1a1a] transition-colors text-[#1a1a1a]" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#1a1a1a]/60 uppercase tracking-widest">연락처</label>
                    <input 
                      required
                      name="phone"
                      type="text" 
                      className="w-full bg-[#1a1a1a]/[0.02] border border-[#1a1a1a]/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a1a1a] transition-colors text-[#1a1a1a]" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#1a1a1a]/60 uppercase tracking-widest">이메일</label>
                  <input 
                    required
                    name="email"
                    type="email" 
                    className="w-full bg-[#1a1a1a]/[0.02] border border-[#1a1a1a]/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a1a1a] transition-colors text-[#1a1a1a]" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#1a1a1a]/60 uppercase tracking-widest">문의 내용</label>
                  <textarea 
                    required
                    name="message"
                    rows={4} 
                    className="w-full bg-[#1a1a1a]/[0.02] border border-[#1a1a1a]/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a1a1a] transition-colors resize-none text-[#1a1a1a]" 
                  />
                </div>
                {formStatus === "error" && (
                  <p className="text-red-500 text-sm font-medium">전송 중 오류가 발생했습니다. 다시 시도해 주세요.</p>
                )}
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      id="privacy-agree"
                      checked={isAgreed}
                      onChange={(e) => setIsAgreed(e.target.checked)}
                      className="w-5 h-5 rounded border-[#1a1a1a]/10 bg-[#1a1a1a]/[0.02] text-[#1a1a1a] focus:ring-[#1a1a1a] focus:ring-offset-0"
                    />
                    <label htmlFor="privacy-agree" className="text-sm text-[#1a1a1a]/60 cursor-pointer select-none font-medium">
                      개인정보 수집 및 이용에 동의합니다.
                    </label>
                  </div>
                  
                  <div className="bg-[#1a1a1a]/[0.02] border border-[#1a1a1a]/10 rounded-xl p-4 h-32 overflow-y-auto text-[11px] text-[#1a1a1a]/40 leading-relaxed scrollbar-thin scrollbar-thumb-[#1a1a1a]/10">
                    <p className="font-bold mb-2 text-[#1a1a1a]/60">[개인정보 수집 및 이용 동의]</p>
                    <p className="mb-2">1. 수집 및 이용 목적<br />고객 문의 접수, 문의 내용 확인, 답변 처리 및 결과 안내, 원활한 의사소통 경로 확보</p>
                    <p className="mb-2">2. 수집하는 개인정보 항목<br />필수항목: 성명, 연락처, 이메일, 문의내용</p>
                    <p className="mb-2">3. 개인정보의 보유 및 이용 기간<br />원칙적으로 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다.<br />보존 사유: 소비자 불만 또는 분쟁 처리에 관한 기록<br />보존 기간: 문의 처리 완료 후 1년</p>
                    <p>4. 동의를 거부할 권리 및 불이익 안내<br />귀하는 위 개인정보 수집 및 이용에 대한 동의를 거부할 권리가 있습니다. 단, 필수항목에 대한 동의 거부 시 원활한 문의 접수 및 답변 안내가 제한될 수 있습니다.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#1a1a1a]/60 uppercase tracking-widest flex flex-col sm:flex-row sm:justify-between gap-1">
                    자동등록방지
                    <span className="text-[10px] sm:text-xs font-normal normal-case italic text-[#1a1a1a]/40">스팸 방지를 위해 아래 계산을 완료해주세요.</span>
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
                    <div className="bg-[#1a1a1a]/5 px-4 py-3 rounded-xl font-bold text-lg sm:min-w-[100px] text-center border border-[#1a1a1a]/10">
                      {captcha.question}
                    </div>
                    <input 
                      required
                      type="number"
                      value={userCaptcha}
                      onChange={(e) => setUserCaptcha(e.target.value)}
                      placeholder="정답 입력"
                      className={cn(
                        "flex-1 bg-[#1a1a1a]/[0.02] border rounded-xl px-4 py-3 focus:outline-none transition-colors text-[#1a1a1a]",
                        captchaError ? "border-red-500" : "border-[#1a1a1a]/10 focus:border-[#1a1a1a]"
                      )}
                    />
                  </div>
                  {captchaError && (
                    <p className="text-red-500 text-xs font-medium">정답이 올바르지 않습니다. 다시 확인해주세요.</p>
                  )}
                </div>

                <button 
                  disabled={formStatus === "submitting" || !isAgreed}
                  className="w-full py-4 rounded-xl font-bold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-xl shadow-[#1a1a1a]/10"
                  style={{ backgroundColor: state.theme.primaryColor }}
                >
                  {formStatus === "submitting" ? "전송 중..." : "문의 보내기"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[#1a1a1a]/5 text-center text-[#1a1a1a]/30 text-sm">
        <p>&copy; 2024 BIG SOUND. All rights reserved. (모든 권리 보유)</p>
      </footer>

      {/* All Portfolio Modal */}
      <AnimatePresence>
        {isAllPortfolioOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8 md:px-6 md:py-12 bg-white/90 backdrop-blur-xl"
            onClick={() => setIsAllPortfolioOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#f5f2ed] w-full max-w-4xl max-h-full rounded-[32px] md:rounded-[48px] overflow-hidden border border-[#1a1a1a]/5 flex flex-col relative shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setIsAllPortfolioOpen(false)}
                className="absolute top-6 right-6 md:top-10 md:right-10 z-10 w-10 h-10 md:w-14 md:h-14 rounded-full bg-[#1a1a1a]/5 border border-[#1a1a1a]/10 flex items-center justify-center hover:bg-[#1a1a1a]/10 transition-colors text-[#1a1a1a]"
              >
                <X size={24} />
              </button>

              <div className="overflow-y-auto custom-scrollbar p-6 md:p-20">
                <div className="mb-12">
                  <h2 className="text-2xl sm:text-3xl md:text-6xl font-serif italic mb-4 tracking-tight text-[#1a1a1a] break-keep">전체 포트폴리오</h2>
                  <div className="w-20 h-1" style={{ backgroundColor: state.theme.primaryColor }} />
                </div>

                <div className="space-y-3 md:space-y-4">
                  {state.content.portfolio?.slice((portfolioPage - 1) * 10, portfolioPage * 10).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedItem(item);
                        setDetailPage(1);
                        setIsAllPortfolioOpen(false);
                      }}
                      className="w-full text-left p-4 md:p-6 rounded-2xl border border-[#1a1a1a]/5 hover:bg-[#1a1a1a]/5 transition-all flex items-center justify-between group"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1 block" style={{ color: state.theme.primaryColor }}>
                          {item.category}
                        </span>
                        <h3 className="text-sm sm:text-lg md:text-2xl font-serif italic font-medium text-[#1a1a1a] truncate whitespace-nowrap">{item.title}</h3>
                      </div>
                      <ChevronRight size={18} className="text-[#1a1a1a]/20 group-hover:translate-x-1 group-hover:text-[#1a1a1a] transition-all shrink-0 ml-4" />
                    </button>
                  ))}
                </div>

                {/* Pagination */}
                {state.content.portfolio && state.content.portfolio.length > 10 && (
                  <div className="mt-12 flex justify-center gap-2">
                    {Array.from({ length: Math.ceil(state.content.portfolio.length / 10) }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPortfolioPage(i + 1)}
                        className={cn(
                          "w-10 h-10 rounded-full font-bold transition-all",
                          portfolioPage === i + 1 
                            ? "text-white" 
                            : "bg-[#1a1a1a]/5 text-[#1a1a1a] hover:bg-[#1a1a1a]/10"
                        )}
                        style={portfolioPage === i + 1 ? { backgroundColor: state.theme.primaryColor } : {}}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Portfolio Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8 md:px-6 md:py-12 bg-white/90 backdrop-blur-xl"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#f5f2ed] w-full max-w-6xl max-h-full rounded-[32px] md:rounded-[48px] overflow-hidden border border-[#1a1a1a]/5 flex flex-col relative shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-6 right-6 md:top-10 md:right-10 z-10 w-10 h-10 md:w-14 md:h-14 rounded-full bg-[#1a1a1a]/5 border border-[#1a1a1a]/10 flex items-center justify-center hover:bg-[#1a1a1a]/10 transition-colors text-[#1a1a1a]"
              >
                <X size={24} />
              </button>

              <div className="overflow-y-auto custom-scrollbar p-6 md:p-20">
                <div className="mb-10 md:mb-16">
                  <span className="text-[10px] md:text-sm font-bold uppercase tracking-[0.2em] mb-3 md:mb-6 block" style={{ color: state.theme.primaryColor }}>
                    {selectedItem.category}
                  </span>
                  <h2 className="text-2xl sm:text-3xl md:text-7xl font-serif italic font-medium tracking-tight mb-6 md:mb-10 leading-[1.1] text-[#1a1a1a] break-keep">
                    {selectedItem.title}
                  </h2>
                  <div className="w-16 md:w-20 h-1 mb-6 md:mb-10" style={{ backgroundColor: state.theme.primaryColor }} />
                  <p className="text-sm sm:text-base md:text-2xl text-[#1a1a1a]/60 font-light leading-relaxed max-w-4xl whitespace-pre-line break-keep">
                    {selectedItem.description}
                  </p>
                </div>

                {/* Detail Titles List */}
                <div className="space-y-3 md:space-y-4 mb-12">
                  <h3 className="text-lg md:text-xl font-bold text-[#1a1a1a]/40 uppercase tracking-widest mb-4 md:mb-6">상세 목록</h3>
                  {selectedItem.details?.slice((detailPage - 1) * 10, detailPage * 10).map((detail) => (
                    <div key={detail.id} className="space-y-3 md:space-y-4">
                      <button
                        onClick={() => setSelectedDetailId(selectedDetailId === detail.id ? null : detail.id)}
                        className={cn(
                          "w-full text-left p-4 md:p-6 rounded-2xl border transition-all flex items-center justify-between group",
                          selectedDetailId === detail.id 
                            ? "bg-[#1a1a1a] text-white border-[#1a1a1a]" 
                            : "bg-white border-[#1a1a1a]/5 hover:bg-[#1a1a1a]/5 text-[#1a1a1a]"
                        )}
                      >
                        <span className="text-sm sm:text-lg md:text-2xl font-serif italic font-medium truncate whitespace-nowrap flex-1">{detail.title}</span>
                        <ChevronRight 
                          size={18} 
                          className={cn(
                            "transition-all shrink-0 ml-4",
                            selectedDetailId === detail.id ? "rotate-90 text-white" : "text-[#1a1a1a]/20 group-hover:text-[#1a1a1a]"
                          )} 
                        />
                      </button>

                      {/* Expanded Content */}
                      <AnimatePresence>
                        {selectedDetailId === detail.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-5 md:p-8 bg-white rounded-2xl md:rounded-3xl border border-[#1a1a1a]/5 space-y-6 md:space-y-8">
                              <p className="text-base md:text-lg text-[#1a1a1a]/60 font-light leading-relaxed whitespace-pre-line">
                                {detail.description}
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                {detail.imageUrls?.map((url, uIdx) => (
                                  <div key={uIdx} className="aspect-video rounded-xl md:rounded-[24px] overflow-hidden border border-[#1a1a1a]/5 shadow-md">
                                    {url ? (
                                      <img 
                                        src={url} 
                                        alt={`${detail.title} - ${uIdx + 1}`} 
                                        className="w-full h-full object-cover"
                                        referrerPolicy="no-referrer"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-[#1a1a1a]/5 flex items-center justify-center text-[#1a1a1a]/20">
                                        이미지 없음
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>

                {/* Pagination for Details */}
                {selectedItem.details && selectedItem.details.length > 10 && (
                  <div className="mt-12 flex justify-center gap-2">
                    {Array.from({ length: Math.ceil(selectedItem.details.length / 10) }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setDetailPage(i + 1);
                          setSelectedDetailId(null);
                        }}
                        className={cn(
                          "w-10 h-10 rounded-full font-bold transition-all",
                          detailPage === i + 1 
                            ? "text-white" 
                            : "bg-[#1a1a1a]/5 text-[#1a1a1a] hover:bg-[#1a1a1a]/10"
                        )}
                        style={detailPage === i + 1 ? { backgroundColor: state.theme.primaryColor } : {}}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}

                {(!selectedItem.details || selectedItem.details.length === 0) && (
                  <div className="py-20 text-center text-[#1a1a1a]/20">
                    <p>상세 정보가 준비 중입니다.</p>
                  </div>
                )}
                
                <div className="mt-32 pt-12 border-t border-[#1a1a1a]/5 flex justify-center">
                  <button 
                    onClick={() => setSelectedItem(null)}
                    className="px-10 py-4 rounded-full border border-[#1a1a1a]/10 text-sm font-bold hover:bg-[#1a1a1a]/5 transition-colors text-[#1a1a1a]"
                  >
                    닫기
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;
