export type TListing = {
  id: string;
  title: string;
  description: string;
  image?: string;
  price: number;
  link?: string;
};

declare global {
  interface Window {
    listings: any;
    setListings: any;
  }
}
