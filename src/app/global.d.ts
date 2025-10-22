declare global {
  interface Window {
    dataLayer: any[];
    gaLoaded?: boolean;
    gtag?: (...args: any[]) => void;
  }
}
export {};
