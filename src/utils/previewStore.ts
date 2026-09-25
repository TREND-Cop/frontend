export interface PreviewItem {
  image: any;
  title?: string;
  price?: string;
  duration?: string;
  rating?: string;
}

class PreviewStore {
  private previewImages: any[] | null = null;
  private previewItems: PreviewItem[] | null = null;
  private previewTitle: string = 'Preview';
  private initialIndex: number = 0;
  private _videoThumbnail: any | null = null;
  private _serviceThumb: any | null = null;
  private _videoSource: any | null = null;

  setPreviewImages(images: any[], title: string = 'Preview', items?: PreviewItem[], initialIndex: number = 0) {
    this.previewImages = images;
    this.previewTitle = title;
    this.previewItems = items || null;
    this.initialIndex = typeof initialIndex === 'number' && !isNaN(initialIndex) ? Math.max(0, initialIndex) : 0;
  }

  setPreviewItems(items: PreviewItem[], title: string = 'Preview', initialIndex: number = 0) {
    this.previewItems = items;
    this.previewImages = items.map((i) => i.image);
    this.previewTitle = title;
    this.initialIndex = typeof initialIndex === 'number' && !isNaN(initialIndex) ? Math.max(0, initialIndex) : 0;
  }

  setInitialIndex(index: number) {
    this.initialIndex = typeof index === 'number' && !isNaN(index) ? Math.max(0, index) : 0;
  }

  getInitialIndex(): number {
    return this.initialIndex;
  }

  setVideoThumbnails(videoThumbnail: any, serviceThumb?: any, videoSource?: any) {
    this._videoThumbnail = videoThumbnail;
    this._serviceThumb = serviceThumb || videoThumbnail;
    this._videoSource = videoSource || null;
  }

  getVideoThumbnail(): any | null {
    return this._videoThumbnail;
  }

  getVideoSource(): any | null {
    return this._videoSource;
  }

  getServiceThumb(): any | null {
    return this._serviceThumb;
  }

  getPreviewImages(): any[] | null {
    return this.previewImages;
  }

  getPreviewItems(): PreviewItem[] | null {
    return this.previewItems;
  }

  getPreviewTitle(): string {
    return this.previewTitle;
  }

  clear() {
    this.previewImages = null;
    this.previewItems = null;
    this.previewTitle = 'Preview';
    this.initialIndex = 0;
    this._videoThumbnail = null;
    this._serviceThumb = null;
    this._videoSource = null;
  }
}

export const previewStore = new PreviewStore();

