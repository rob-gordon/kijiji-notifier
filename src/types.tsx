export type TListing = {
  id: string;
  title: string;
  description: string;
  image?: string;
  price: number;
};

declare global {
  interface Window {
    setLastId: any;
  }
}
