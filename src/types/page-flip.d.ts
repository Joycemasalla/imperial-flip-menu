declare module "page-flip" {
  export type PageFlipEvent = {
    data: number | string | boolean | object;
  };

  export class PageFlip {
    constructor(element: HTMLElement, settings: Record<string, number | string | boolean>);
    loadFromHTML(items: HTMLElement[]): void;
    flipNext(): void;
    flipPrev(): void;
    flip(page: number): void;
    turnToPage(page: number): void;
    getCurrentPageIndex(): number;
    on(eventName: string, callback: (event: PageFlipEvent) => void): PageFlip;
    off(eventName: string): void;
    destroy(): void;
  }
}