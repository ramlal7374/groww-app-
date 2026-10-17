export interface MutualFund {
  id: string;
  name: string;
  fundHouse: string;
  category: 'Large Cap' | 'Mid Cap' | 'Small Cap' | 'Flexi Cap' | 'Index Funds' | 'ELSS' | 'Hybrid' | 'Debt';
  nav: number;
  navChange: number;
  navChangePercent: number;
  returns1Y: number;
  returns3Y: number;
  returns5Y: number;
  expenseRatio: number;
  aum: number; // in Cr
  riskLevel: 'Very High' | 'High' | 'Moderate' | 'Low';
  rating: number; // 1-5
  minSipAmount: number;
  minLumpsumAmount: number;
  benchmark: string;
  fundManager: string;
  topHoldings: { company: string; percentage: number }[];
  description: string;
}

export interface IpoItem {
  id: string;
  companyName: string;
  symbol: string;
  status: 'OPEN' | 'UPCOMING' | 'LISTED';
  priceBandMin: number;
  priceBandMax: number;
  lotSize: number; // shares per lot
  issueSizeCr: number;
  openDate: string;
  closeDate: string;
  allotmentDate: string;
  listingDate: string;
  subscription: {
    qib: number;
    nii: number;
    retail: number;
    total: number;
  };
  gmp?: number; // Grey market premium
  expectedListingGain?: number;
  description: string;
}

export interface EtfItem {
  id: string;
  symbol: string;
  name: string;
  category: 'Index' | 'Gold & Silver' | 'Sectoral' | 'International';
  currentPrice: number;
  change: number;
  changePercent: number;
  returns1Y: number;
  returns3Y: number;
  aumCr: number;
  expenseRatio: number;
  underlyingIndex: string;
  holdings: { name: string; weight: number }[];
  description: string;
}

export const MUTUAL_FUNDS_DATA: MutualFund[] = [
  {
    id: 'mf-1',
    name: 'Parag Parikh Flexi Cap Fund Direct-Growth',
    fundHouse: 'PPFAS Mutual Fund',
    category: 'Flexi Cap',
    nav: 84.32,
    navChange: 0.65,
    navChangePercent: 0.78,
    returns1Y: 34.2,
    returns3Y: 22.8,
    returns5Y: 24.5,
    expenseRatio: 0.62,
    aum: 72400,
    riskLevel: 'Very High',
    rating: 5,
    minSipAmount: 1000,
    minLumpsumAmount: 5000,
    benchmark: 'NIFTY 500 TRI',
    fundManager: 'Rajeev Thakkar',
    topHoldings: [
      { company: 'HDFC Bank Ltd', percentage: 7.8 },
      { company: 'ITC Ltd', percentage: 6.9 },
      { company: 'Bajaj Holdings', percentage: 6.4 },
      { company: 'Alphabet Inc (Google)', percentage: 5.2 },
      { company: 'Power Grid Corp', percentage: 4.8 }
    ],
    description: 'A disciplined equity fund investing across large, mid, and international bluechips with value investing philosophy.'
  },
  {
    id: 'mf-2',
    name: 'Quant Small Cap Fund Direct Plan-Growth',
    fundHouse: 'Quant Mutual Fund',
    category: 'Small Cap',
    nav: 268.45,
    navChange: 2.15,
    navChangePercent: 0.81,
    returns1Y: 48.6,
    returns3Y: 32.4,
    returns5Y: 38.2,
    expenseRatio: 0.77,
    aum: 24800,
    riskLevel: 'Very High',
    rating: 5,
    minSipAmount: 1000,
    minLumpsumAmount: 5000,
    benchmark: 'NIFTY Smallcap 250 TRI',
    fundManager: 'Sandeep Tandon',
    topHoldings: [
      { company: 'Reliance Industries', percentage: 8.4 },
      { company: 'Jio Financial Services', percentage: 5.9 },
      { company: 'Aditya Birla Fashion', percentage: 4.6 },
      { company: 'Bikaji Foods', percentage: 3.8 }
    ],
    description: 'High alpha, momentum and predictive analytics-driven portfolio investing in aggressive high-growth small caps.'
  },
  {
    id: 'mf-3',
    name: 'Mirae Asset Large Cap Fund Direct-Growth',
    fundHouse: 'Mirae Asset Mutual Fund',
    category: 'Large Cap',
    nav: 122.18,
    navChange: 0.42,
    navChangePercent: 0.35,
    returns1Y: 26.4,
    returns3Y: 16.9,
    returns5Y: 18.2,
    expenseRatio: 0.54,
    aum: 39600,
    riskLevel: 'High',
    rating: 4,
    minSipAmount: 500,
    minLumpsumAmount: 5000,
    benchmark: 'NIFTY 100 TRI',
    fundManager: 'Gaurav Misra',
    topHoldings: [
      { company: 'HDFC Bank Ltd', percentage: 9.8 },
      { company: 'Reliance Industries', percentage: 9.1 },
      { company: 'ICICI Bank Ltd', percentage: 7.9 },
      { company: 'Infosys Ltd', percentage: 6.2 }
    ],
    description: 'Steady compounder focusing on industry leaders with proven moat and strong corporate governance.'
  },
  {
    id: 'mf-4',
    name: 'UTI Nifty 50 Index Fund Direct-Growth',
    fundHouse: 'UTI Mutual Fund',
    category: 'Index Funds',
    nav: 182.75,
    navChange: 0.95,
    navChangePercent: 0.52,
    returns1Y: 28.5,
    returns3Y: 17.6,
    returns5Y: 17.8,
    expenseRatio: 0.18,
    aum: 18900,
    riskLevel: 'High',
    rating: 5,
    minSipAmount: 500,
    minLumpsumAmount: 1000,
    benchmark: 'NIFTY 50 TRI',
    fundManager: 'Sharwan Kumar Goyal',
    topHoldings: [
      { company: 'HDFC Bank', percentage: 11.2 },
      { company: 'Reliance Industries', percentage: 9.8 },
      { company: 'ICICI Bank', percentage: 7.8 },
      { company: 'Infosys', percentage: 5.9 }
    ],
    description: 'Low-cost passive index fund replicating India’s 50 bellwether bluechips with minimal tracking error.'
  },
  {
    id: 'mf-5',
    name: 'HDFC Mid-Cap Opportunities Fund Direct-Growth',
    fundHouse: 'HDFC Mutual Fund',
    category: 'Mid Cap',
    nav: 194.10,
    navChange: 1.35,
    navChangePercent: 0.70,
    returns1Y: 39.8,
    returns3Y: 26.5,
    returns5Y: 25.9,
    expenseRatio: 0.74,
    aum: 68500,
    riskLevel: 'Very High',
    rating: 5,
    minSipAmount: 1000,
    minLumpsumAmount: 5000,
    benchmark: 'NIFTY Midcap 150 TRI',
    fundManager: 'Chirag Setalvad',
    topHoldings: [
      { company: 'Tata Technologies', percentage: 4.8 },
      { company: 'Indian Hotels', percentage: 4.5 },
      { company: 'Max Healthcare', percentage: 4.2 },
      { company: 'Apollo Hospitals', percentage: 3.9 }
    ],
    description: 'India’s largest mid-cap fund specializing in spotting emerging market leaders before they turn large-cap.'
  },
  {
    id: 'mf-6',
    name: 'Mirae Asset ELSS Tax Saver Fund Direct-Growth',
    fundHouse: 'Mirae Asset Mutual Fund',
    category: 'ELSS',
    nav: 48.60,
    navChange: 0.28,
    navChangePercent: 0.58,
    returns1Y: 31.2,
    returns3Y: 19.8,
    returns5Y: 21.4,
    expenseRatio: 0.59,
    aum: 23100,
    riskLevel: 'Very High',
    rating: 4,
    minSipAmount: 500,
    minLumpsumAmount: 500,
    benchmark: 'NIFTY 200 TRI',
    fundManager: 'Neelesh Surana',
    topHoldings: [
      { company: 'HDFC Bank', percentage: 8.5 },
      { company: 'ICICI Bank', percentage: 7.2 },
      { company: 'L&T', percentage: 5.8 }
    ],
    description: 'Tax saving equity fund with 3-year lock-in offering Section 80C tax deduction and wealth accumulation.'
  }
];

export const IPOS_DATA: IpoItem[] = [
  {
    id: 'ipo-1',
    companyName: 'Swiggy Limited',
    symbol: 'SWIGGY',
    status: 'OPEN',
    priceBandMin: 371,
    priceBandMax: 390,
    lotSize: 38,
    issueSizeCr: 11327,
    openDate: '06 Nov 2024',
    closeDate: '08 Nov 2024',
    allotmentDate: '11 Nov 2024',
    listingDate: '13 Nov 2024',
    subscription: {
      qib: 6.02,
      nii: 1.24,
      retail: 1.14,
      total: 3.59
    },
    gmp: 22,
    expectedListingGain: 5.6,
    description: 'Pioneer Indian hyper-local consumer tech platform delivering food, grocery via Instamart, and dining reservations.'
  },
  {
    id: 'ipo-2',
    companyName: 'NTPC Green Energy Limited',
    symbol: 'NTPCGREEN',
    status: 'OPEN',
    priceBandMin: 102,
    priceBandMax: 108,
    lotSize: 138,
    issueSizeCr: 10000,
    openDate: '19 Nov 2024',
    closeDate: '22 Nov 2024',
    allotmentDate: '25 Nov 2024',
    listingDate: '27 Nov 2024',
    subscription: {
      qib: 3.28,
      nii: 4.82,
      retail: 3.41,
      total: 3.75
    },
    gmp: 12,
    expectedListingGain: 11.1,
    description: 'Renewable energy arm of India’s largest state-owned power utility NTPC, with gigawatt-scale solar and wind projects.'
  },
  {
    id: 'ipo-3',
    companyName: 'Hyundai Motor India Limited',
    symbol: 'HYUNDAI',
    status: 'LISTED',
    priceBandMin: 1865,
    priceBandMax: 1960,
    lotSize: 7,
    issueSizeCr: 27870,
    openDate: '15 Oct 2024',
    closeDate: '17 Oct 2024',
    allotmentDate: '18 Oct 2024',
    listingDate: '22 Oct 2024',
    subscription: {
      qib: 6.97,
      nii: 0.60,
      retail: 0.50,
      total: 2.37
    },
    gmp: -15,
    expectedListingGain: 1.2,
    description: 'India’s second largest passenger car manufacturer with iconic Creta, Venue, and i20 models.'
  },
  {
    id: 'ipo-4',
    companyName: 'Tata Technologies Limited',
    symbol: 'TATATECH',
    status: 'LISTED',
    priceBandMin: 475,
    priceBandMax: 500,
    lotSize: 30,
    issueSizeCr: 3042,
    openDate: '22 Nov 2023',
    closeDate: '24 Nov 2023',
    allotmentDate: '28 Nov 2023',
    listingDate: '30 Nov 2023',
    subscription: {
      qib: 203.4,
      nii: 62.1,
      retail: 16.5,
      total: 69.4
    },
    gmp: 500,
    expectedListingGain: 140.0,
    description: 'Global engineering services and digital transformation leader from the Tata Group.'
  },
  {
    id: 'ipo-5',
    companyName: 'Zomato Blinkit Logistics Tech',
    symbol: 'BLINKLOG',
    status: 'UPCOMING',
    priceBandMin: 220,
    priceBandMax: 240,
    lotSize: 60,
    issueSizeCr: 4500,
    openDate: 'Expected Dec 2024',
    closeDate: 'Dec 2024',
    allotmentDate: 'Dec 2024',
    listingDate: 'Dec 2024',
    subscription: {
      qib: 0,
      nii: 0,
      retail: 0,
      total: 0
    },
    gmp: 45,
    expectedListingGain: 18.5,
    description: 'Upcoming public issue for expanding autonomous dark stores, EV fleet, and micro-fulfillment hubs across Tier 1 & 2 cities.'
  }
];

export const ETFS_DATA: EtfItem[] = [
  {
    id: 'etf-1',
    symbol: 'NIFTYBEES',
    name: 'Nippon India ETF Nifty 50 BeES',
    category: 'Index',
    currentPrice: 268.40,
    change: 1.55,
    changePercent: 0.58,
    returns1Y: 28.2,
    returns3Y: 17.1,
    aumCr: 32400,
    expenseRatio: 0.04,
    underlyingIndex: 'NIFTY 50 Index',
    holdings: [
      { name: 'HDFC Bank Ltd', weight: 11.4 },
      { name: 'Reliance Industries', weight: 9.7 },
      { name: 'ICICI Bank Ltd', weight: 8.1 },
      { name: 'Infosys Ltd', weight: 6.0 }
    ],
    description: 'The most liquid ETF in India providing instant low-cost exposure to India’s top 50 companies.'
  },
  {
    id: 'etf-2',
    symbol: 'BANKBEES',
    name: 'Nippon India ETF Bank BeES',
    category: 'Sectoral',
    currentPrice: 538.90,
    change: 3.40,
    changePercent: 0.63,
    returns1Y: 21.8,
    returns3Y: 15.4,
    aumCr: 14800,
    expenseRatio: 0.16,
    underlyingIndex: 'NIFTY Bank Index',
    holdings: [
      { name: 'HDFC Bank Ltd', weight: 29.2 },
      { name: 'ICICI Bank Ltd', weight: 24.1 },
      { name: 'State Bank of India', weight: 11.0 },
      { name: 'Kotak Mahindra Bank', weight: 9.8 }
    ],
    description: 'Pure-play exposure to Indian banking champions driving financial inclusion and credit growth.'
  },
  {
    id: 'etf-3',
    symbol: 'GOLDBEES',
    name: 'Nippon India ETF Gold BeES',
    category: 'Gold & Silver',
    currentPrice: 68.25,
    change: 0.35,
    changePercent: 0.51,
    returns1Y: 24.6,
    returns3Y: 14.8,
    aumCr: 12900,
    expenseRatio: 0.79,
    underlyingIndex: 'Domestic Physical Gold Price (99.5% Purity)',
    holdings: [
      { name: 'Physical Gold Bars (0.995 Purity)', weight: 99.1 },
      { name: 'Cash & Short term receivables', weight: 0.9 }
    ],
    description: 'Dematerialized physical gold backing with zero storage worries, zero making charges, and instant liquidity.'
  },
  {
    id: 'etf-4',
    symbol: 'MON100',
    name: 'Motilal Oswal Nasdaq 100 ETF',
    category: 'International',
    currentPrice: 174.50,
    change: 1.80,
    changePercent: 1.04,
    returns1Y: 38.4,
    returns3Y: 18.2,
    aumCr: 8700,
    expenseRatio: 0.58,
    underlyingIndex: 'NASDAQ 100 Index (USD)',
    holdings: [
      { name: 'Apple Inc', weight: 9.2 },
      { name: 'Microsoft Corp', weight: 8.7 },
      { name: 'Nvidia Corp', weight: 8.1 },
      { name: 'Amazon.com', weight: 5.4 }
    ],
    description: 'Invest directly in global tech titans driving artificial intelligence, cloud, and semiconductor revolutions.'
  },
  {
    id: 'etf-5',
    symbol: 'ITBEES',
    name: 'Nippon India ETF Nifty IT',
    category: 'Sectoral',
    currentPrice: 42.10,
    change: -0.22,
    changePercent: -0.52,
    returns1Y: 33.1,
    returns3Y: 12.8,
    aumCr: 4100,
    expenseRatio: 0.22,
    underlyingIndex: 'NIFTY IT Index',
    holdings: [
      { name: 'Tata Consultancy Services', weight: 26.5 },
      { name: 'Infosys Ltd', weight: 25.8 },
      { name: 'HCL Technologies', weight: 9.9 },
      { name: 'Wipro Ltd', weight: 8.2 }
    ],
    description: 'Direct investment in India’s export powerhouse software technology majors.'
  }
];
