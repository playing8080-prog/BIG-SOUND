export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface PortfolioDetail {
  id: string;
  title: string;
  description: string;
  imageUrls: string[];
}

export interface PortfolioItem {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  description: string;
  details: PortfolioDetail[];
}

export interface Post {
  id: string;
  title: string;
  content: string;
  date: string;
}

export interface AppState {
  theme: {
    primaryColor: string;
    backgroundColor: string;
    fontFamily: string;
  };
  content: {
    heroTitle: string;
    heroSubtitle: string;
    logoUrl: string;
    aboutText: string;
    aboutImageUrl: string;
    backgroundMusicUrl: string;
    services: Service[];
    portfolio: PortfolioItem[];
    posts: Post[];
    contact: {
      email: string;
      phone: string;
      address: string;
      instagram: string;
      youtube: string;
    };
  };
}
