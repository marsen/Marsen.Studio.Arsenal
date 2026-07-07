export type HeroSlide = {
  heading: string;
  sub: string;
};

export type Service = {
  title: string;
  desc: string;
};

export type Project = {
  name: string;
  description: string;
  tags: string[];
  url: string;
};

export type LandingContent = {
  heroEyebrow: string;
  heroSlides: HeroSlide[];
  heroCta: string;
  servicesTitle: string;
  services: Service[];
  casesTitle: string;
  projects: Project[];
};
