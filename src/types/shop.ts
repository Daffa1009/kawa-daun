export type StatusMode = "auto" | "open" | "closed";

export type ShopSettings = {
  /** auto = ikut jam buka; open/closed = dipaksa oleh admin */
  statusMode: StatusMode;
  openHour: number; // 0-23
  closeHour: number; // 1-24
  address: string;
  instagram: string;
  phone: string; // 62xxx tanpa +
  mapEmbedSrc: string; // iframe src dari Google Maps -> Share -> Embed
  mapLink: string; // https://maps.google.com/?q=...
  qrisEnabled: boolean;
  qrisImage: string;
};

export type ShopStatus = {
  isOpen: boolean;
  label: string;
  hours: string;
  mode: StatusMode;
};
