import React, { createContext, useContext, useState, useEffect } from "react";
import { AppState, Service, PortfolioItem, Post } from "../types";
import { get, set } from "idb-keyval";

interface AppContextType {
  state: AppState;
  updateTheme: (theme: Partial<AppState["theme"]>) => void;
  updateContent: (content: Partial<AppState["content"]>) => void;
  addService: (service: Omit<Service, "id">) => void;
  updateService: (id: string, service: Partial<Omit<Service, "id">>) => void;
  removeService: (id: string) => void;
  addPortfolioItem: (item: Omit<PortfolioItem, "id">) => void;
  updatePortfolioItem: (id: string, item: Partial<Omit<PortfolioItem, "id">>) => void;
  removePortfolioItem: (id: string) => void;
  addPost: (post: Omit<Post, "id" | "date">) => void;
  updatePost: (id: string, post: Partial<Omit<Post, "id" | "date">>) => void;
  removePost: (id: string) => void;
  updateAdminPassword: (password: string) => void;
}

const initialState: AppState = {
  theme: {
    primaryColor: "#1a1a1a", // Dark Ink
    backgroundColor: "#f5f2ed", // Warm Off-White
    fontFamily: "'Inter', sans-serif",
  },
  content: {
    heroTitle: "빅사운드 (BIG SOUND)",
    heroSubtitle: "최고의 음향과 조명으로 이벤트를 완성합니다. 기업 행사 전문 빅사운드.",
    logoUrl: "https://picsum.photos/seed/sound-hexagon/200/200",
    aboutText: "빅사운드는 다년간의 경험을 바탕으로 한 프리미엄 행사 전문 업체입니다.\n최첨단 장비와 전문 인력을\n통해 고객의 비전을 현실로 만들어 드립니다.",
    aboutImageUrl: "https://picsum.photos/seed/concert-stage-truss/1200/800",
    backgroundMusicUrl: "https://www.youtube.com/watch?v=y0HAY49YtEY",
    formspreeId: "mzdypgdj",
    services: [
      { id: "1", title: "행사 음향", description: "고출력, 고음질의 최첨단 음향 시스템으로 현장의 감동을 전달합니다.", icon: "Speaker" },
      { id: "2", title: "무대 조명", description: "화려하고 감각적인 조명 연출로 무대의 주인공을 더욱 빛나게 합니다.", icon: "Lightbulb" },
      { id: "3", title: "행사 기획", description: "창의적인 아이디어와 철저한 준비로 성공적인 행사를 기획합니다.", icon: "Calendar" },
      { id: "4", title: "영상 중계", description: "고화질 영상 시스템과 전문 중계팀이 행사의 모든 순간을 기록합니다.", icon: "Video" },
    ],
    portfolio: [
      { id: "1", title: "2024 글로벌 IT 컨퍼런스", imageUrl: "https://picsum.photos/seed/event1/800/600", category: "컨퍼런스", description: "글로벌 IT 리더들이 모이는 최대 규모의 컨퍼런스 음향 및 영상 시스템을 총괄했습니다.", details: [] },
      { id: "2", title: "K-Pop 루키 쇼케이스", imageUrl: "https://picsum.photos/seed/event2/800/600", category: "공연", description: "신인 아티스트들의 데뷔 무대를 위한 화려한 조명과 파워풀한 음향을 연출했습니다.", details: [] },
      { id: "3", title: "럭셔리 브랜드 런칭 파티", imageUrl: "https://picsum.photos/seed/event3/800/600", category: "파티", description: "브랜드의 품격에 맞는 고급스러운 분위기의 음향과 무드 조명을 기획했습니다.", details: [] },
      { id: "4", title: "연말 기업 사은의 밤", imageUrl: "https://picsum.photos/seed/event4/800/600", category: "기업행사", description: "기업 임직원들을 위한 따뜻하고 활기찬 연말 파티 시스템을 운영했습니다.", details: [] },
    ],
    posts: [
      { id: "1", title: "빅사운드 홈페이지 리뉴얼 안내", content: "더욱 세련된 디자인으로 돌아왔습니다.", date: "2024-03-20" },
      { id: "2", title: "신규 음향 장비 도입 소식", content: "최신형 라인 어레이 스피커를 도입하였습니다.", date: "2024-03-15" },
    ],
    contact: {
      email: "info@bigsound.com",
      phone: "02-1234-5678",
      address: "서울특별시 강남구 테헤란로 123 빅사운드 빌딩",
      instagram: "https://instagram.com/bigsound",
      youtube: "https://youtube.com/bigsound",
    },
  },
  adminPassword: "admin",
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(initialState);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const saved = await get("bigsound_state");
        if (saved) {
          setState(saved);
        }
      } catch (error) {
        console.error("Failed to load state from IndexedDB:", error);
      } finally {
        setIsInitialized(true);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (isInitialized) {
      set("bigsound_state", state).catch((error) => {
        console.error("Failed to save state to IndexedDB:", error);
      });
    }
  }, [state, isInitialized]);

  const updateTheme = (theme: Partial<AppState["theme"]>) => {
    setState((prev) => ({ ...prev, theme: { ...prev.theme, ...theme } }));
  };

  const updateContent = (content: Partial<AppState["content"]>) => {
    setState((prev) => ({ ...prev, content: { ...prev.content, ...content } }));
  };

  const addService = (service: Omit<Service, "id">) => {
    const newService = { ...service, id: Date.now().toString() };
    setState((prev) => ({
      ...prev,
      content: { ...prev.content, services: [...prev.content.services, newService] },
    }));
  };

  const updateService = (id: string, service: Partial<Omit<Service, "id">>) => {
    setState((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        services: prev.content.services.map((s) => (s.id === id ? { ...s, ...service } : s)),
      },
    }));
  };

  const removeService = (id: string) => {
    setState((prev) => ({
      ...prev,
      content: { ...prev.content, services: prev.content.services.filter((s) => s.id !== id) },
    }));
  };

  const addPortfolioItem = (item: Omit<PortfolioItem, "id">) => {
    const newItem = { 
      ...item, 
      id: Date.now().toString(),
      details: item.details || [] 
    };
    setState((prev) => ({
      ...prev,
      content: { ...prev.content, portfolio: [...prev.content.portfolio, newItem] },
    }));
  };

  const updatePortfolioItem = (id: string, item: Partial<Omit<PortfolioItem, "id">>) => {
    setState((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        portfolio: prev.content.portfolio.map((i) => (i.id === id ? { ...i, ...item } : i)),
      },
    }));
  };

  const removePortfolioItem = (id: string) => {
    setState((prev) => ({
      ...prev,
      content: { ...prev.content, portfolio: prev.content.portfolio.filter((i) => i.id !== id) },
    }));
  };

  const addPost = (post: Omit<Post, "id" | "date">) => {
    const newPost = { ...post, id: Date.now().toString(), date: new Date().toISOString().split("T")[0] };
    setState((prev) => ({
      ...prev,
      content: { ...prev.content, posts: [newPost, ...prev.content.posts] },
    }));
  };

  const updatePost = (id: string, post: Partial<Omit<Post, "id" | "date">>) => {
    setState((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        posts: prev.content.posts.map((p) => (p.id === id ? { ...p, ...post } : p)),
      },
    }));
  };

  const removePost = (id: string) => {
    setState((prev) => ({
      ...prev,
      content: { ...prev.content, posts: prev.content.posts.filter((p) => p.id !== id) },
    }));
  };

  const updateAdminPassword = (password: string) => {
    setState((prev) => ({ ...prev, adminPassword: password }));
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-purple-500 animate-pulse font-bold">Loading...</div>
      </div>
    );
  }

  return (
    <AppContext.Provider
      value={{
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
        removePost,
        updateAdminPassword,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
};
