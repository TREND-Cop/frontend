/**
 * Unified Specialist Portfolio Catalog (Customer Side)
 * Parity with Provider Specialist Portfolio Data.
 */

export interface PortfolioItem {
  id: string;
  image: any;
  height: number;
  title: string;
  price: string;
  duration: string;
  rating: string;
  column: 'left' | 'right';
  order: number;
}

export const BISOLA_PORTFOLIO_ITEMS: PortfolioItem[] = [
  // ── Row 1 ──
  {
    id: 'bp-1',
    image: require('../../../assets/images/portfolio/bisola_portfolio_1.png'),
    height: 239,
    title: 'Baby Blue Ribbon Acrylics',
    price: '₦18,500',
    duration: '1hr 15min',
    rating: '5.0',
    column: 'left',
    order: 1,
  },
  {
    id: 'bp-2',
    image: require('../../../assets/images/portfolio/bisola_portfolio_2.png'),
    height: 188,
    title: 'Gold Starfish Ocean Tips',
    price: '₦16,000',
    duration: '1hr',
    rating: '4.9',
    column: 'right',
    order: 2,
  },
  // ── Row 2 ──
  {
    id: 'bp-3',
    image: require('../../../assets/images/portfolio/bisola_portfolio_3.png'),
    height: 188,
    title: 'Tropical Monstera Art',
    price: '₦15,000',
    duration: '50min',
    rating: '4.8',
    column: 'left',
    order: 3,
  },
  {
    id: 'bp-4',
    image: require('../../../assets/images/portfolio/bisola_portfolio_4.png'),
    height: 239,
    title: 'Midnight Floral French Set',
    price: '₦22,000',
    duration: '1hr 30min',
    rating: '5.0',
    column: 'right',
    order: 4,
  },
  // ── Row 3 ──
  {
    id: 'bp-5',
    image: require('../../../assets/images/portfolio/bisola_portfolio_5.png'),
    height: 239,
    title: 'Burgundy Star Ombre',
    price: '₦19,500',
    duration: '1hr 20min',
    rating: '4.9',
    column: 'left',
    order: 5,
  },
  {
    id: 'bp-6',
    image: require('../../../assets/images/portfolio/bisola_portfolio_6.png'),
    height: 188,
    title: 'Hot Pink Floral Pedicure',
    price: '₦14,000',
    duration: '45min',
    rating: '4.9',
    column: 'right',
    order: 6,
  },
];

export function getSpecialistPortfolio(nameOrId?: string): PortfolioItem[] {
  return BISOLA_PORTFOLIO_ITEMS;
}
