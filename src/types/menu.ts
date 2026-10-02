// Tipos do cardápio digital — Espaço Imperial

export type Option = { label: string; price: number };

export type MenuItem = {
  id: string;
  name: string;
  avatar: string;
  price: number | null;
  options: Option[];
  desc: string;
  imageUrl: string;
  serves?: string | null;
  highlight?: boolean;
};

export type Category = {
  id: string;
  title: string;
  navLabel: string;
  subtitle?: string;
  items: MenuItem[];
};

export type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  lastX: number;
  startedAt: number;
  axis: "pending" | "horizontal" | "vertical";
  direction: "next" | "prev" | null;
};
