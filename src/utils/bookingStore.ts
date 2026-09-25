import { ADD_ON_CATALOG, AddOnCatalogItem } from '../constants/addOneCatalog';
import { PACKAGE_CATALOG, PackageItem } from '../constants/packageCatalog';

export interface SpecialistItem {
  id: string;
  name: string;
  role: string;
  rating: string;
  reviews: number;
  image: string;
}

export interface SelectedStyleItem {
  id: string;
  name: string;
  audience?: string;
  image: any;
  rating?: string;
  price?: number;
}

export interface BookingPaymentDetails {
  method: 'bank_transfer' | 'card' | 'cash';
  methodTitle: string;
  accountName?: string;
  accountNumber?: string;
  bankName?: string;
  cardBrand?: string;
  cardLast4?: string;
  transactionRef?: string;
  status?: string;
  receiver?: string;
}

export const MOCK_SPECIALISTS: SpecialistItem[] = [
  {
    id: 's1',
    name: 'Micheal Ureal',
    role: 'Nail Art Specialist',
    rating: '5.0',
    reviews: 22,
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
  },
  {
    id: 's2',
    name: 'Eze Joseph',
    role: 'Nail Art Specialist',
    rating: '5.0',
    reviews: 22,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
  },
  {
    id: 's3',
    name: 'Samson Nnkanu',
    role: 'Nail Art Specialist',
    rating: '5.0',
    reviews: 22,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
  },
  {
    id: 's4',
    name: 'Omotola David',
    role: 'Nail Art Specialist',
    rating: '5.0',
    reviews: 22,
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80',
  },
];

type Listener = () => void;

class BookingStore {
  private serviceId: string = 'na5';
  private serviceName: string = 'Acrylic nails';
  private serviceImage: any = null;
  private selectedStyle: SelectedStyleItem = {
    id: 's_tapper_fade',
    name: 'Tapper Fade',
    audience: 'Male only',
    image: require('../../assets/images/profile/cont1.jpg'),
    rating: '5.1',
  };
  private salonName: string = 'Luminous Lux';
  private salonAddress: string = '1st floor off David Chris Cresent, Kado Abuja';
  private salonId: string = 'salon2';
  private duration: string = '24min';
  private rating: string = '5.1';
  private basePrice: number = 10200;
  private selectedAddOnIds: Set<string> = new Set([]);
  private selectedPackageId: string | null = null;
  private selectedSpecialist: SpecialistItem | null = null;
  private selectedSpecialists: SpecialistItem[] = [];
  private addOnSpecialist: SpecialistItem | null = null;
  private specialistNote: string = '';
  private appointmentDate: string = '';
  private appointmentTime: string = '';
  private appointmentType: string = '';
  private couponApplied: boolean = false;
  private usePoints: boolean = false;
  private paymentType: string | null = null;
  private paymentDetails: BookingPaymentDetails | null = null;
  private listeners: Set<Listener> = new Set();

  getServiceId(): string {
    return this.serviceId;
  }

  setServiceId(id: string) {
    this.serviceId = id;
    this.notify();
  }

  getServiceName(): string {
    return this.serviceName;
  }

  setServiceName(name: string) {
    this.serviceName = name;
    this.notify();
  }

  getServiceImage(): any {
    return this.serviceImage;
  }

  setServiceImage(img: any) {
    this.serviceImage = img;
    this.notify();
  }

  getSelectedStyle(): SelectedStyleItem {
    return this.selectedStyle;
  }

  setSelectedStyle(style: SelectedStyleItem) {
    this.selectedStyle = style;
    this.serviceImage = style.image;
    this.notify();
  }

  getSalonAddress(): string {
    return this.salonAddress;
  }

  setSalonAddress(addr: string) {
    this.salonAddress = addr;
    this.notify();
  }

  getSalonName(): string {
    return this.salonName;
  }

  setSalonName(name: string) {
    this.salonName = name;
    this.notify();
  }

  getSalonId(): string {
    return this.salonId;
  }

  setSalonId(id: string) {
    this.salonId = id;
    this.notify();
  }

  getDuration(): string {
    return this.duration;
  }

  setDuration(dur: string) {
    this.duration = dur;
    this.notify();
  }

  getRating(): string {
    return this.rating;
  }

  setRating(r: string) {
    this.rating = r;
    this.notify();
  }

  getBasePrice(): number {
    return this.basePrice;
  }

  setBasePrice(price: number) {
    this.basePrice = price;
    this.notify();
  }

  getSpecialistNote(): string {
    return this.specialistNote;
  }

  setSpecialistNote(note: string) {
    this.specialistNote = note;
    this.notify();
  }

  getSelectedSpecialist(): SpecialistItem | null {
    return this.selectedSpecialist;
  }

  getSelectedSpecialists(): SpecialistItem[] {
    if (this.selectedSpecialists.length > 0) {
      return this.selectedSpecialists;
    }
    return this.selectedSpecialist ? [this.selectedSpecialist] : [];
  }

  setSelectedSpecialist(specialist: SpecialistItem | null) {
    this.selectedSpecialist = specialist;
    this.selectedSpecialists = specialist ? [specialist] : [];
    this.notify();
  }

  setSelectedSpecialists(specialists: SpecialistItem[]) {
    this.selectedSpecialists = specialists;
    this.selectedSpecialist = specialists.length > 0 ? specialists[0] : null;
    this.notify();
  }

  addSpecialist(specialist: SpecialistItem) {
    if (!this.selectedSpecialists.some((s) => s.id === specialist.id)) {
      this.selectedSpecialists = [...this.selectedSpecialists, specialist];
      this.selectedSpecialist = this.selectedSpecialists[0];
      this.notify();
    }
  }

  removeSpecialist(id: string) {
    this.selectedSpecialists = this.selectedSpecialists.filter((s) => s.id !== id);
    this.selectedSpecialist = this.selectedSpecialists.length > 0 ? this.selectedSpecialists[0] : null;
    this.notify();
  }

  getAddOnSpecialist(): SpecialistItem | null {
    return this.addOnSpecialist;
  }

  setAddOnSpecialist(specialist: SpecialistItem | null) {
    this.addOnSpecialist = specialist;
    this.notify();
  }

  getAppointmentDate(): string {
    return this.appointmentDate;
  }

  setAppointmentDate(date: string) {
    this.appointmentDate = date;
    this.notify();
  }

  getAppointmentTime(): string {
    return this.appointmentTime;
  }

  setAppointmentTime(time: string) {
    this.appointmentTime = time;
    this.notify();
  }

  getAppointmentType(): string {
    return this.appointmentType;
  }

  setAppointmentType(type: string) {
    this.appointmentType = type;
    this.notify();
  }

  getSelectedIds(): string[] {
    return Array.from(this.selectedAddOnIds);
  }

  getSelectedItems(): AddOnCatalogItem[] {
    return Array.from(this.selectedAddOnIds)
      .map((id) => ADD_ON_CATALOG[id])
      .filter(Boolean);
  }

  setSelectedIds(ids: string[]) {
    this.selectedAddOnIds = new Set(ids);
    if (this.selectedAddOnIds.size === 0) {
      this.addOnSpecialist = null;
    }
    this.notify();
  }

  toggleAddOn(id: string) {
    if (this.selectedAddOnIds.has(id)) {
      this.selectedAddOnIds.delete(id);
      if (this.selectedAddOnIds.size === 0) {
        this.addOnSpecialist = null;
      }
    } else {
      this.selectedAddOnIds.add(id);
      // Auto-assign specialist uploaded for this add-on if none exists yet
      if (!this.addOnSpecialist) {
        const item = ADD_ON_CATALOG[id];
        if (item?.specialist) {
          this.addOnSpecialist = item.specialist;
        }
      }
    }
    this.notify();
  }

  removeAddOn(id: string) {
    if (this.selectedAddOnIds.has(id)) {
      this.selectedAddOnIds.delete(id);
      if (this.selectedAddOnIds.size === 0) {
        this.addOnSpecialist = null;
      }
      this.notify();
    }
  }

  addAddOn(id: string) {
    if (!this.selectedAddOnIds.has(id)) {
      this.selectedAddOnIds.add(id);
      if (!this.addOnSpecialist) {
        const item = ADD_ON_CATALOG[id];
        if (item?.specialist) {
          this.addOnSpecialist = item.specialist;
        }
      }
      this.notify();
    }
  }

  isAddOnSelected(id: string): boolean {
    return this.selectedAddOnIds.has(id);
  }

  getSelectedPackage(): PackageItem | null {
    return PACKAGE_CATALOG.find((p) => p.id === this.selectedPackageId) || null;
  }

  setSelectedPackage(id: string | null) {
    this.selectedPackageId = id;
    this.notify();
  }

  getCouponApplied(): boolean {
    return this.couponApplied;
  }

  setCouponApplied(applied: boolean) {
    this.couponApplied = applied;
    this.notify();
  }

  getUsePoints(): boolean {
    return this.usePoints;
  }

  setUsePoints(use: boolean) {
    this.usePoints = use;
    this.notify();
  }

  getPaymentType(): string | null {
    return this.paymentType;
  }

  setPaymentType(type: string | null) {
    this.paymentType = type;
    this.notify();
  }

  getPaymentDetails(): BookingPaymentDetails | null {
    return this.paymentDetails;
  }

  setPaymentDetails(details: BookingPaymentDetails | null) {
    this.paymentDetails = details;
    if (details) {
      this.paymentType = details.method;
    }
    this.notify();
  }

  // ── Dynamic Price Calculation ──
  getAddOnsTotal(): number {
    return this.getSelectedItems().reduce((sum, item) => sum + item.price, 0);
  }

  getPackageTotal(): number {
    const pkg = this.getSelectedPackage();
    return pkg ? pkg.price : 0;
  }

  getSpecialistTotal(): number {
    let total = 0;
    const count =
      this.selectedSpecialists.length > 0
        ? this.selectedSpecialists.length
        : this.selectedSpecialist
        ? 1
        : 0;
    // Primary staff is covered by service base price; additional staff (double staff) adds ₦4,500
    total += Math.max(0, count - 1) * 4500;
    if (this.addOnSpecialist && this.selectedAddOnIds.size > 0) total += 4500;
    return total;
  }

  getSubtotal(): number {
    return (
      this.basePrice +
      this.getAddOnsTotal() +
      this.getPackageTotal() +
      this.getSpecialistTotal()
    );
  }

  getDiscountAmount(couponApplied: boolean = this.couponApplied, paymentType: string | null = this.paymentType): number {
    const sub = this.getSubtotal();
    let discount = 0;
    if (couponApplied) {
      discount += Math.round(sub * 0.08);
    }
    if (paymentType === 'bank_transfer' || paymentType === 'card') {
      discount += Math.round(sub * 0.02);
    }
    return discount;
  }

  getFinalTotal(
    couponApplied: boolean = this.couponApplied,
    usePoints: boolean = this.usePoints,
    paymentType: string | null = this.paymentType
  ): number {
    const sub = this.getSubtotal();
    const discount = this.getDiscountAmount(couponApplied, paymentType);
    const pointsDiscount = usePoints ? 300 : 0;
    return Math.max(0, sub - discount - pointsDiscount);
  }

  resetBookingSelections() {
    this.selectedSpecialist = null;
    this.selectedSpecialists = [];
    this.addOnSpecialist = null;
    this.specialistNote = '';
    this.selectedAddOnIds = new Set([]);
    this.selectedPackageId = null;
    this.appointmentDate = '';
    this.appointmentTime = '';
    this.appointmentType = '';
    this.couponApplied = false;
    this.usePoints = false;
    this.paymentType = null;
    this.paymentDetails = null;
    this.notify();
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }
}

export const bookingStore = new BookingStore();
