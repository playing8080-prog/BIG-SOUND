import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { motion } from "motion/react";
import { Settings, Layout, Image as ImageIcon, MessageSquare, Plus, Trash2, Save, ArrowLeft, Palette, Type, X, Upload, Music } from "lucide-react";
import { cn } from "../lib/utils";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

const AdminDashboard = () => {
  const { 
    state, 
    updateTheme, 
    updateContent, 
    addService, 
    updateService,
    removeService, 
    addPortfolioItem, 
    updatePortfolioItem,
    removePortfolioItem, 
    addPost, 
    updatePost,
    removePost 
  } = useApp();
  const [activeTab, setActiveTab] = useState<"theme" | "content" | "services" | "portfolio" | "posts">("theme");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, portfolioId: string, detailIdx: number) => {
    const files = e.target.files;
    if (!files) return;

    setUploadError(null);
    setIsUploading(true);

    const fileArray = Array.from(files);
    const oversizedFiles = fileArray.filter(f => f.size > MAX_FILE_SIZE);
    
    if (oversizedFiles.length > 0) {
      setUploadError(`일부 파일이 너무 큽니다. (최대 100MB)`);
      setIsUploading(false);
      return;
    }

    let processedCount = 0;
    fileArray.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const portfolio = state.content.portfolio.find(p => p.id === portfolioId);
        if (portfolio && portfolio.details) {
          const newDetails = [...portfolio.details];
          const currentUrls = newDetails[detailIdx].imageUrls || [];
          newDetails[detailIdx] = { 
            ...newDetails[detailIdx], 
            imageUrls: [...currentUrls, base64String] 
          };
          updatePortfolioItem(portfolioId, { details: newDetails });
        }
        processedCount++;
        if (processedCount === fileArray.length) {
          setIsUploading(false);
        }
      };
      reader.onerror = () => {
        setUploadError("파일을 읽는 중 오류가 발생했습니다.");
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSingleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, onUpload: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setUploadError(`파일이 너무 큽니다. (최대 100MB)`);
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      onUpload(reader.result as string);
      setIsUploading(false);
    };
    reader.onerror = () => {
      setUploadError("파일을 읽는 중 오류가 발생했습니다.");
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleThemeChange = (key: string, value: string) => {
    updateTheme({ [key]: value });
  };

  const handleContentChange = (key: string, value: string) => {
    updateContent({ [key]: value });
  };

  const handleContactChange = (key: string, value: string) => {
    updateContent({ contact: { ...state.content.contact, [key]: value } });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 p-6 flex flex-col gap-8 shrink-0">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
            <Settings size={18} />
          </div>
          <span className="font-bold text-lg tracking-tight">관리자 패널</span>
        </div>

        <nav className="space-y-1">
          {[
            { id: "theme", label: "테마 설정", icon: Palette },
            { id: "content", label: "기본 콘텐츠", icon: Layout },
            { id: "services", label: "서비스 관리", icon: Settings },
            { id: "portfolio", label: "포트폴리오", icon: ImageIcon },
            { id: "posts", label: "게시글 관리", icon: MessageSquare },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as any);
                setEditingId(null);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                activeTab === item.id ? "bg-purple-600 text-white" : "text-white/50 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto">
          <a
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/50 hover:bg-white/5 hover:text-white transition-all"
          >
            <ArrowLeft size={18} />
            사이트로 돌아가기
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 overflow-y-auto max-w-5xl mx-auto">
        <header className="mb-12 relative">
          <h1 className="text-3xl font-bold mb-2">
            {activeTab === "theme" && "테마 설정"}
            {activeTab === "content" && "기본 콘텐츠 관리"}
            {activeTab === "services" && "서비스 카테고리 관리"}
            {activeTab === "portfolio" && "포트폴리오 갤러리 관리"}
            {activeTab === "posts" && "게시글 및 공지사항 관리"}
          </h1>
          <p className="text-white/40">웹사이트의 디자인과 내용을 실시간으로 변경할 수 있습니다.</p>

          {/* Upload Status Overlay */}
          {(isUploading || uploadError) && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "absolute top-0 right-0 px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-3 z-50",
                uploadError ? "bg-red-500/20 text-red-500 border border-red-500/30" : "bg-purple-600/20 text-purple-500 border border-purple-500/30"
              )}
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  파일 업로드 중... (대용량 파일은 시간이 걸릴 수 있습니다)
                </>
              ) : (
                <>
                  <X size={16} className="cursor-pointer" onClick={() => setUploadError(null)} />
                  {uploadError}
                </>
              )}
            </motion.div>
          )}
        </header>

        {/* Theme Tab */}
        {activeTab === "theme" && (
          <div className="space-y-8">
            <div className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Palette size={20} className="text-purple-500" /> 브랜드 컬러
              </h2>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-white/60">포인트 컬러 (Primary)</label>
                  <div className="flex gap-4">
                    <input
                      type="color"
                      value={state.theme.primaryColor}
                      onChange={(e) => handleThemeChange("primaryColor", e.target.value)}
                      className="w-12 h-12 rounded-lg bg-transparent border-none cursor-pointer"
                    />
                    <input
                      type="text"
                      value={state.theme.primaryColor}
                      onChange={(e) => handleThemeChange("primaryColor", e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-white/60">배경색 (Background)</label>
                  <div className="flex gap-4">
                    <input
                      type="color"
                      value={state.theme.backgroundColor}
                      onChange={(e) => handleThemeChange("backgroundColor", e.target.value)}
                      className="w-12 h-12 rounded-lg bg-transparent border-none cursor-pointer"
                    />
                    <input
                      type="text"
                      value={state.theme.backgroundColor}
                      onChange={(e) => handleThemeChange("backgroundColor", e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Type size={20} className="text-purple-500" /> 타이포그래피
              </h2>
              <div className="space-y-3">
                <label className="text-sm font-medium text-white/60">기본 폰트 패밀리</label>
                <select
                  value={state.theme.fontFamily}
                  onChange={(e) => handleThemeChange("fontFamily", e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 appearance-none"
                >
                  <option value="Pretendard, sans-serif">Pretendard (권장)</option>
                  <option value="'Noto Sans KR', sans-serif">Noto Sans KR</option>
                  <option value="'Inter', sans-serif">Inter</option>
                  <option value="serif">Serif (고전적)</option>
                  <option value="monospace">Monospace (기계적)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Content Tab */}
        {activeTab === "content" && (
          <div className="space-y-8">
            <div className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-6">
              <h2 className="text-xl font-bold">메인 히어로 섹션</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/60">메인 타이틀</label>
                  <input
                    type="text"
                    value={state.content.heroTitle}
                    onChange={(e) => handleContentChange("heroTitle", e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/60">로고 이미지</label>
                  <div className="flex items-center gap-4">
                    {state.content.logoUrl && state.content.logoUrl !== "" && (
                      <img src={state.content.logoUrl} alt="Logo Preview" className="w-12 h-12 rounded-lg object-cover border border-white/10" referrerPolicy="no-referrer" />
                    )}
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 border-dashed rounded-xl hover:border-purple-500 hover:text-purple-500 cursor-pointer transition-all">
                      <Upload size={18} />
                      <span className="text-sm">로고 파일 업로드</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleSingleFileUpload(e, (base64) => handleContentChange("logoUrl", base64))}
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={state.content.logoUrl}
                    onChange={(e) => handleContentChange("logoUrl", e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-purple-500"
                    placeholder="또는 이미지 URL 입력"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/60">서브 타이틀</label>
                  <textarea
                    rows={3}
                    value={state.content.heroSubtitle}
                    onChange={(e) => handleContentChange("heroSubtitle", e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-6">
              <h2 className="text-xl font-bold">회사 소개 (About)</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/60">소개 텍스트</label>
                  <textarea
                    rows={5}
                    value={state.content.aboutText}
                    onChange={(e) => handleContentChange("aboutText", e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/60">소개 이미지</label>
                  <div className="flex items-center gap-4">
                    {state.content.aboutImageUrl && state.content.aboutImageUrl !== "" && (
                      <img src={state.content.aboutImageUrl} alt="About Preview" className="w-20 h-12 rounded-lg object-cover border border-white/10" referrerPolicy="no-referrer" />
                    )}
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 border-dashed rounded-xl hover:border-purple-500 hover:text-purple-500 cursor-pointer transition-all">
                      <Upload size={18} />
                      <span className="text-sm">소개 이미지 파일 업로드</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleSingleFileUpload(e, (base64) => handleContentChange("aboutImageUrl", base64))}
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={state.content.aboutImageUrl}
                    onChange={(e) => handleContentChange("aboutImageUrl", e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-purple-500"
                    placeholder="또는 이미지 URL 입력"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-6">
              <h2 className="text-xl font-bold">배경 음악 설정</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/60">배경 음악 파일 업로드</label>
                  <div className="flex items-center gap-4">
                    {state.content.backgroundMusicUrl && (
                      <div className="w-12 h-12 rounded-lg bg-purple-600/20 flex items-center justify-center border border-purple-500/30">
                        <Music size={20} className="text-purple-500" />
                      </div>
                    )}
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 border-dashed rounded-xl hover:border-purple-500 hover:text-purple-500 cursor-pointer transition-all">
                      <Upload size={18} />
                      <span className="text-sm">음악 파일 선택 (MP3)</span>
                      <input 
                        type="file" 
                        accept="audio/mpeg,audio/mp3" 
                        className="hidden" 
                        onChange={(e) => handleSingleFileUpload(e, (base64) => handleContentChange("backgroundMusicUrl", base64))}
                      />
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/60">또는 배경 음악 URL 입력</label>
                  <input
                    type="text"
                    value={state.content.backgroundMusicUrl}
                    onChange={(e) => handleContentChange("backgroundMusicUrl", e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500"
                    placeholder="https://example.com/music.mp3"
                  />
                  <p className="text-xs text-white/30">감미로운 클래식 음악 파일을 업로드하거나 URL을 입력하세요.</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-6">
              <h2 className="text-xl font-bold">연락처 및 소셜 미디어</h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/60">이메일</label>
                  <input
                    type="text"
                    value={state.content.contact.email}
                    onChange={(e) => handleContactChange("email", e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/60">전화번호</label>
                  <input
                    type="text"
                    value={state.content.contact.phone}
                    onChange={(e) => handleContactChange("phone", e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-sm font-medium text-white/60">주소</label>
                  <input
                    type="text"
                    value={state.content.contact.address}
                    onChange={(e) => handleContactChange("address", e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/60">Instagram URL</label>
                  <input
                    type="text"
                    value={state.content.contact.instagram}
                    onChange={(e) => handleContactChange("instagram", e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/60">YouTube URL</label>
                  <input
                    type="text"
                    value={state.content.contact.youtube}
                    onChange={(e) => handleContactChange("youtube", e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === "services" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {state.content.services?.map((service) => (
                <div key={service.id} className="bg-white/5 p-6 rounded-3xl border border-white/10 relative group">
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditingId(editingId === service.id ? null : service.id)}
                      className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20"
                    >
                      <Settings size={16} />
                    </button>
                    <button
                      onClick={() => removeService(service.id)}
                      className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  {editingId === service.id ? (
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-white/40 uppercase">제목</label>
                        <input
                          type="text"
                          value={service.title}
                          onChange={(e) => updateService(service.id, { title: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-white/40 uppercase">설명</label>
                        <textarea
                          rows={3}
                          value={service.description}
                          onChange={(e) => updateService(service.id, { description: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-500 resize-none"
                        />
                      </div>
                      <button 
                        onClick={() => setEditingId(null)}
                        className="w-full py-2 bg-purple-600 rounded-xl text-sm font-bold"
                      >
                        저장 완료
                      </button>
                    </div>
                  ) : (
                    <>
                      <h3 className="font-bold text-lg mb-2">{service.title}</h3>
                      <p className="text-white/40 text-sm">{service.description}</p>
                    </>
                  )}
                </div>
              ))}
              <button
                onClick={() => addService({ title: "새 서비스", description: "서비스 설명을 입력하세요.", icon: "Speaker" })}
                className="border-2 border-dashed border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 text-white/30 hover:border-purple-500 hover:text-purple-500 transition-all"
              >
                <Plus size={32} />
                <span className="font-bold">서비스 추가하기</span>
              </button>
            </div>
          </div>
        )}

        {/* Portfolio Tab */}
        {activeTab === "portfolio" && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
              {state.content.portfolio?.map((item) => (
                <div key={item.id} className="bg-white/5 rounded-3xl border border-white/10 overflow-hidden group relative">
                  {item.imageUrl && item.imageUrl !== "" && (
                    <img src={item.imageUrl} alt={item.title} className="aspect-square object-cover w-full" referrerPolicy="no-referrer" />
                  )}
                  
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4 p-6">
                    <button
                      onClick={() => setEditingId(editingId === item.id ? null : item.id)}
                      className="w-full py-2 bg-white/10 rounded-xl text-sm font-bold hover:bg-white/20"
                    >
                      {editingId === item.id ? "닫기" : "수정하기"}
                    </button>
                    <button
                      onClick={() => removePortfolioItem(item.id)}
                      className="w-full py-2 bg-red-500/20 text-red-500 rounded-xl text-sm font-bold hover:bg-red-500 hover:text-white"
                    >
                      삭제하기
                    </button>
                  </div>

                  {editingId === item.id ? (
                    <div className="p-4 space-y-4 bg-black/95 absolute inset-0 overflow-y-auto z-20 custom-scrollbar">
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-white/40 uppercase">제목</label>
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => updatePortfolioItem(item.id, { title: e.target.value })}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-purple-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-white/40 uppercase">카테고리</label>
                            <input
                              type="text"
                              value={item.category}
                              onChange={(e) => updatePortfolioItem(item.id, { category: e.target.value })}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-purple-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-white/40 uppercase">메인 이미지</label>
                            <div className="flex items-center gap-2 mb-1">
                              {item.imageUrl && item.imageUrl !== "" && (
                                <img src={item.imageUrl} alt="Preview" className="w-8 h-8 rounded object-cover border border-white/10" referrerPolicy="no-referrer" />
                              )}
                              <label className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-white/5 border border-white/10 border-dashed rounded-lg hover:border-purple-500 hover:text-purple-500 cursor-pointer transition-all">
                                <Upload size={12} />
                                <span className="text-[10px]">파일 업로드</span>
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden" 
                                  onChange={(e) => handleSingleFileUpload(e, (base64) => updatePortfolioItem(item.id, { imageUrl: base64 }))}
                                />
                              </label>
                            </div>
                            <input
                              type="text"
                              value={item.imageUrl}
                              onChange={(e) => updatePortfolioItem(item.id, { imageUrl: e.target.value })}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-purple-500"
                              placeholder="또는 이미지 URL 입력"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-white/40 uppercase">설명</label>
                            <textarea
                              rows={2}
                              value={item.description}
                              onChange={(e) => updatePortfolioItem(item.id, { description: e.target.value })}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-purple-500 resize-none"
                            />
                          </div>
                        </div>

                        <div className="pt-4 border-t border-white/10">
                          <h4 className="text-[10px] font-bold text-white/40 uppercase mb-3">상세 항목 관리 (사진 및 글)</h4>
                          <div className="space-y-3">
                            {item.details?.map((detail, dIdx) => (
                              <div key={detail.id} className="bg-white/5 p-3 rounded-xl space-y-2 relative group/detail border border-white/5">
                                <button 
                                  onClick={() => {
                                    const newDetails = (item.details || []).filter(d => d.id !== detail.id);
                                    updatePortfolioItem(item.id, { details: newDetails });
                                  }}
                                  className="absolute top-2 right-2 p-1 text-red-500 opacity-0 group-hover/detail:opacity-100 transition-opacity"
                                >
                                  <Trash2 size={12} />
                                </button>
                                <input 
                                  placeholder="상세 제목 (예: 바퀴, 엔진 등)"
                                  value={detail.title}
                                  onChange={(e) => {
                                    const newDetails = [...(item.details || [])];
                                    newDetails[dIdx] = { ...detail, title: e.target.value };
                                    updatePortfolioItem(item.id, { details: newDetails });
                                  }}
                                  className="w-full bg-transparent border-b border-white/10 text-xs py-1 focus:outline-none focus:border-purple-500"
                                />
                                <textarea 
                                  placeholder="상세 설명"
                                  value={detail.description}
                                  onChange={(e) => {
                                    const newDetails = [...(item.details || [])];
                                    newDetails[dIdx] = { ...detail, description: e.target.value };
                                    updatePortfolioItem(item.id, { details: newDetails });
                                  }}
                                  className="w-full bg-transparent border-b border-white/10 text-[10px] py-1 focus:outline-none focus:border-purple-500 resize-none"
                                />
                                <div className="space-y-2">
                                  <label className="text-[10px] font-bold text-white/40 uppercase">사진 관리</label>
                                  <div className="flex flex-wrap gap-2">
                                    {detail.imageUrls?.map((url, uIdx) => (
                                      <div key={uIdx} className="relative group/img-item">
                                        {url && url !== "" && (
                                          <img src={url} className="w-14 h-14 object-cover rounded-lg border border-white/10" referrerPolicy="no-referrer" />
                                        )}
                                        <button 
                                          onClick={() => {
                                            const newUrls = (detail.imageUrls || []).filter((_, i) => i !== uIdx);
                                            const newDetails = [...(item.details || [])];
                                            newDetails[dIdx] = { ...detail, imageUrls: newUrls };
                                            updatePortfolioItem(item.id, { details: newDetails });
                                          }}
                                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/img-item:opacity-100 transition-opacity"
                                        >
                                          <X size={10} />
                                        </button>
                                      </div>
                                    ))}
                                    <label className="w-14 h-14 rounded-lg border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-white/20 hover:border-purple-500 hover:text-purple-500 cursor-pointer transition-all">
                                      <Upload size={16} />
                                      <span className="text-[8px] mt-1">추가</span>
                                      <input 
                                        type="file" 
                                        multiple 
                                        accept="image/*" 
                                        className="hidden" 
                                        onChange={(e) => handleFileUpload(e, item.id, dIdx)}
                                      />
                                    </label>
                                  </div>
                                  <input 
                                    placeholder="또는 이미지 URL 입력 (쉼표 구분)"
                                    value={detail.imageUrls?.join(", ") || ""}
                                    onChange={(e) => {
                                      const newDetails = [...(item.details || [])];
                                      const urls = e.target.value.split(",").map(url => url.trim()).filter(url => url !== "");
                                      newDetails[dIdx] = { ...detail, imageUrls: urls };
                                      updatePortfolioItem(item.id, { details: newDetails });
                                    }}
                                    className="w-full bg-transparent border-b border-white/10 text-[10px] py-1 focus:outline-none focus:border-purple-500"
                                  />
                                </div>
                              </div>
                            ))}
                            <button 
                              onClick={() => {
                                const newDetail = { id: Date.now().toString(), title: "", description: "", imageUrls: [] };
                                const currentDetails = item.details || [];
                                updatePortfolioItem(item.id, { details: [...currentDetails, newDetail] });
                              }}
                              className="w-full py-2 border border-dashed border-white/20 rounded-xl text-[10px] text-white/40 hover:border-purple-500 hover:text-purple-500 transition-all"
                            >
                              + 상세 항목 추가
                            </button>
                          </div>
                        </div>

                        <button 
                          onClick={() => setEditingId(null)}
                          className="w-full py-2.5 bg-purple-600 rounded-xl text-xs font-bold mt-2 sticky bottom-0 shadow-lg"
                        >
                          저장 완료
                        </button>
                      </div>
                  ) : (
                    <div className="p-4">
                      <h3 className="font-bold text-sm truncate">{item.title}</h3>
                      <p className="text-white/40 text-xs">{item.category}</p>
                    </div>
                  )}
                </div>
              ))}
              <button
                onClick={() => addPortfolioItem({ 
                  title: "새 프로젝트", 
                  imageUrl: "https://picsum.photos/seed/new/800/600", 
                  category: "기타",
                  description: "프로젝트에 대한 설명을 입력하세요.",
                  details: []
                })}
                className="border-2 border-dashed border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 text-white/30 hover:border-purple-500 hover:text-purple-500 transition-all aspect-square"
              >
                <Plus size={32} />
                <span className="font-bold">포트폴리오 추가</span>
              </button>
            </div>
          </div>
        )}

        {/* Posts Tab */}
        {activeTab === "posts" && (
          <div className="space-y-6">
            <div className="space-y-4">
              {state.content.posts?.map((post) => (
                <div key={post.id} className="bg-white/5 p-6 rounded-3xl border border-white/10 flex flex-col gap-4 group">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-lg mb-1">{post.title}</h3>
                      <p className="text-white/40 text-sm">{post.date}</p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingId(editingId === post.id ? null : post.id)}
                        className="p-3 rounded-xl bg-white/10 text-white hover:bg-white/20"
                      >
                        <Settings size={20} />
                      </button>
                      <button
                        onClick={() => removePost(post.id)}
                        className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>

                  {editingId === post.id && (
                    <div className="space-y-4 border-t border-white/10 pt-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-white/40 uppercase">제목</label>
                        <input
                          type="text"
                          value={post.title}
                          onChange={(e) => updatePost(post.id, { title: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-white/40 uppercase">내용</label>
                        <textarea
                          rows={4}
                          value={post.content}
                          onChange={(e) => updatePost(post.id, { content: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-500 resize-none"
                        />
                      </div>
                      <button 
                        onClick={() => setEditingId(null)}
                        className="w-full py-2 bg-purple-600 rounded-xl text-sm font-bold"
                      >
                        저장 완료
                      </button>
                    </div>
                  )}
                </div>
              ))}
              <button
                onClick={() => addPost({ title: "새로운 소식", content: "내용을 입력하세요." })}
                className="w-full border-2 border-dashed border-white/10 rounded-3xl p-8 flex items-center justify-center gap-3 text-white/30 hover:border-purple-500 hover:text-purple-500 transition-all"
              >
                <Plus size={24} />
                <span className="font-bold">새 게시글 작성</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
