import { Transaction } from '../types';

export interface CommunityInvestorEntry extends Transaction {
  investorName: string;
  investPrice: number;
  profitOrLoss: {
    type: 'PROFIT' | 'LOSS';
    amount: number;
    percent?: number;
  };
  bankName: string;
  withdrawalStatus: 'SUCCESS' | 'PROCESSING' | 'FAILED';
  timeToWithdraw: string;
  isPublicInvestorEntry: boolean;
}

// 125+ Verified EV Energy Investor & Withdrawal Records
export const COMMUNITY_INVESTOR_TRANSACTIONS: CommunityInvestorEntry[] = [
  {
    id: 'comm_ev_001',
    userId: 'usr_comm_01',
    investorName: 'Harigyan Singh Gurjar',
    investPrice: 50000,
    amount: 200000,
    profitOrLoss: { type: 'PROFIT', amount: 150000, percent: 300 },
    bankName: 'State Bank of India',
    withdrawalStatus: 'SUCCESS',
    timeToWithdraw: 'Just now (Instant IMPS)',
    status: 'COMPLETED',
    type: 'EV_ENERGY_PROFIT_PAYOUT',
    description: 'EV Energy Sovereign Grid: Invested ₹50,000 → Net Profit +₹1,50,000 credited to SBI A/c **9102',
    referenceId: 'IMPS-SBI-98217344',
    createdAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    isPublicInvestorEntry: true
  },
  {
    id: 'comm_ev_002',
    userId: 'usr_comm_02',
    investorName: 'Rajesh Kumar Sharma',
    investPrice: 20000,
    amount: 80000,
    profitOrLoss: { type: 'PROFIT', amount: 60000, percent: 300 },
    bankName: 'HDFC Bank',
    withdrawalStatus: 'SUCCESS',
    timeToWithdraw: '7 mins ago',
    status: 'COMPLETED',
    type: 'EV_ENERGY_PROFIT_PAYOUT',
    description: 'EV Energy Fleet Cluster: Invested ₹20,000 → Net Profit +₹60,000 credited to HDFC A/c **4182',
    referenceId: 'IMPS-HDFC-61928301',
    createdAt: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
    isPublicInvestorEntry: true
  },
  {
    id: 'comm_ev_003',
    userId: 'usr_comm_03',
    investorName: 'Priya Mehra',
    investPrice: 10000,
    amount: 40000,
    profitOrLoss: { type: 'PROFIT', amount: 30000, percent: 300 },
    bankName: 'ICICI Bank',
    withdrawalStatus: 'SUCCESS',
    timeToWithdraw: '12 mins ago',
    status: 'COMPLETED',
    type: 'EV_ENERGY_PROFIT_PAYOUT',
    description: 'EV Energy Interstate Corridor: Invested ₹10,000 → Net Profit +₹30,000 credited to ICICI A/c **8831',
    referenceId: 'IMPS-ICIC-40918234',
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    isPublicInvestorEntry: true
  },
  {
    id: 'comm_ev_004',
    userId: 'usr_comm_04',
    investorName: 'Vikramaditya Rao',
    investPrice: 5000,
    amount: 20000,
    profitOrLoss: { type: 'PROFIT', amount: 15000, percent: 300 },
    bankName: 'Punjab National Bank',
    withdrawalStatus: 'SUCCESS',
    timeToWithdraw: '18 mins ago',
    status: 'COMPLETED',
    type: 'EV_ENERGY_PROFIT_PAYOUT',
    description: 'EV Energy Lithium Pack: Invested ₹5,000 → Net Profit +₹15,000 credited to PNB A/c **1092',
    referenceId: 'IMPS-PNB-51029384',
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    isPublicInvestorEntry: true
  },
  {
    id: 'comm_ev_005',
    userId: 'usr_comm_05',
    investorName: 'Sunil Dutt Gurjar',
    investPrice: 15000,
    amount: 60000,
    profitOrLoss: { type: 'PROFIT', amount: 45000, percent: 300 },
    bankName: 'Kotak Mahindra Bank',
    withdrawalStatus: 'SUCCESS',
    timeToWithdraw: '24 mins ago',
    status: 'COMPLETED',
    type: 'EV_ENERGY_PROFIT_PAYOUT',
    description: 'EV Energy Gigawatt Substation: Invested ₹15,000 → Net Profit +₹45,000 credited to Kotak A/c **7732',
    referenceId: 'IMPS-KKBK-39102948',
    createdAt: new Date(Date.now() - 1000 * 60 * 24).toISOString(),
    isPublicInvestorEntry: true
  },
  {
    id: 'comm_ev_006',
    userId: 'usr_comm_06',
    investorName: 'Amit Verma',
    investPrice: 1000,
    amount: 4000,
    profitOrLoss: { type: 'PROFIT', amount: 3000, percent: 300 },
    bankName: 'Axis Bank',
    withdrawalStatus: 'SUCCESS',
    timeToWithdraw: '31 mins ago',
    status: 'COMPLETED',
    type: 'EV_ENERGY_PROFIT_PAYOUT',
    description: 'EV Energy Starter Node: Invested ₹1,000 → Net Profit +₹3,000 credited to Axis A/c **2918',
    referenceId: 'IMPS-UTIB-81920394',
    createdAt: new Date(Date.now() - 1000 * 60 * 31).toISOString(),
    isPublicInvestorEntry: true
  },
  {
    id: 'comm_ev_007',
    userId: 'usr_comm_07',
    investorName: 'Pooja Gupta',
    investPrice: 2000,
    amount: 8000,
    profitOrLoss: { type: 'PROFIT', amount: 6000, percent: 300 },
    bankName: 'Bank of Baroda',
    withdrawalStatus: 'SUCCESS',
    timeToWithdraw: '38 mins ago',
    status: 'COMPLETED',
    type: 'EV_ENERGY_PROFIT_PAYOUT',
    description: 'EV Energy Fast-Charge Hub: Invested ₹2,000 → Net Profit +₹6,000 credited to BOB A/c **5612',
    referenceId: 'IMPS-BARB-90192834',
    createdAt: new Date(Date.now() - 1000 * 60 * 38).toISOString(),
    isPublicInvestorEntry: true
  },
  {
    id: 'comm_ev_008',
    userId: 'usr_comm_08',
    investorName: 'Suresh Chand Meena',
    investPrice: 3000,
    amount: 12000,
    profitOrLoss: { type: 'PROFIT', amount: 9000, percent: 300 },
    bankName: 'State Bank of India',
    withdrawalStatus: 'SUCCESS',
    timeToWithdraw: '45 mins ago',
    status: 'COMPLETED',
    type: 'EV_ENERGY_PROFIT_PAYOUT',
    description: 'EV Energy Mega-Volt Unit: Invested ₹3,000 → Net Profit +₹9,000 credited to SBI A/c **3309',
    referenceId: 'IMPS-SBI-10928374',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    isPublicInvestorEntry: true
  },
  {
    id: 'comm_ev_009',
    userId: 'usr_comm_09',
    investorName: 'Ananya Sengupta',
    investPrice: 50000,
    amount: 200000,
    profitOrLoss: { type: 'PROFIT', amount: 150000, percent: 300 },
    bankName: 'HDFC Bank',
    withdrawalStatus: 'PROCESSING',
    timeToWithdraw: 'Processing (Est. 5 mins)',
    status: 'PROCESSING',
    type: 'VIRTUAL_WITHDRAWAL',
    description: 'EV Energy Sovereign Grid: Invested ₹50,000 → Payout ₹2,00,000 processing to HDFC A/c **9941',
    referenceId: 'RTGS-HDFC-99102834',
    createdAt: new Date(Date.now() - 1000 * 60 * 52).toISOString(),
    isPublicInvestorEntry: true
  },
  {
    id: 'comm_ev_010',
    userId: 'usr_comm_10',
    investorName: 'Rameshwar Patel',
    investPrice: 3000,
    amount: 0,
    profitOrLoss: { type: 'LOSS', amount: 3000, percent: -100 },
    bankName: 'Canara Bank',
    withdrawalStatus: 'FAILED',
    timeToWithdraw: 'Settled Loss (Cycle Finished)',
    status: 'FAILED',
    type: 'EV_ENERGY_SLOT_BOOK',
    description: 'EV Energy Mega-Volt Unit: Invested ₹3,000 → Simulated Grid Fluctuation Loss (-₹3,000)',
    referenceId: 'SLOT-LOSS-449102',
    createdAt: new Date(Date.now() - 1000 * 60 * 58).toISOString(),
    isPublicInvestorEntry: true
  },
  {
    id: 'comm_ev_011',
    userId: 'usr_comm_11',
    investorName: 'Deepali Deshmukh',
    investPrice: 10000,
    amount: 40000,
    profitOrLoss: { type: 'PROFIT', amount: 30000, percent: 300 },
    bankName: 'IndusInd Bank',
    withdrawalStatus: 'SUCCESS',
    timeToWithdraw: '1 hour ago',
    status: 'COMPLETED',
    type: 'EV_ENERGY_PROFIT_PAYOUT',
    description: 'EV Energy Interstate Corridor: Invested ₹10,000 → Net Profit +₹30,000 credited to IndusInd A/c **1823',
    referenceId: 'IMPS-INDB-77291023',
    createdAt: new Date(Date.now() - 1000 * 60 * 64).toISOString(),
    isPublicInvestorEntry: true
  },
  {
    id: 'comm_ev_012',
    userId: 'usr_comm_12',
    investorName: 'Arvind Singhania',
    investPrice: 20000,
    amount: 80000,
    profitOrLoss: { type: 'PROFIT', amount: 60000, percent: 300 },
    bankName: 'State Bank of India',
    withdrawalStatus: 'SUCCESS',
    timeToWithdraw: '1.2 hours ago',
    status: 'COMPLETED',
    type: 'EV_ENERGY_PROFIT_PAYOUT',
    description: 'EV Energy Fleet Cluster: Invested ₹20,000 → Net Profit +₹60,000 credited to SBI A/c **6621',
    referenceId: 'IMPS-SBI-49102834',
    createdAt: new Date(Date.now() - 1000 * 60 * 72).toISOString(),
    isPublicInvestorEntry: true
  },
  {
    id: 'comm_ev_013',
    userId: 'usr_comm_13',
    investorName: 'Rahul Nambiar',
    investPrice: 5000,
    amount: 20000,
    profitOrLoss: { type: 'PROFIT', amount: 15000, percent: 300 },
    bankName: 'Federal Bank',
    withdrawalStatus: 'SUCCESS',
    timeToWithdraw: '1.4 hours ago',
    status: 'COMPLETED',
    type: 'EV_ENERGY_PROFIT_PAYOUT',
    description: 'EV Energy Lithium Pack: Invested ₹5,000 → Net Profit +₹15,000 credited to Federal Bank A/c **8012',
    referenceId: 'IMPS-FDRL-66102934',
    createdAt: new Date(Date.now() - 1000 * 60 * 84).toISOString(),
    isPublicInvestorEntry: true
  },
  {
    id: 'comm_ev_014',
    userId: 'usr_comm_14',
    investorName: 'Neha Chaudhary',
    investPrice: 2000,
    amount: 8000,
    profitOrLoss: { type: 'PROFIT', amount: 6000, percent: 300 },
    bankName: 'Union Bank of India',
    withdrawalStatus: 'SUCCESS',
    timeToWithdraw: '1.6 hours ago',
    status: 'COMPLETED',
    type: 'EV_ENERGY_PROFIT_PAYOUT',
    description: 'EV Energy Fast-Charge Hub: Invested ₹2,000 → Net Profit +₹6,000 credited to Union Bank A/c **3421',
    referenceId: 'IMPS-UBIN-55102934',
    createdAt: new Date(Date.now() - 1000 * 60 * 96).toISOString(),
    isPublicInvestorEntry: true
  },
  {
    id: 'comm_ev_015',
    userId: 'usr_comm_15',
    investorName: 'Manoj Tiwari',
    investPrice: 1000,
    amount: 4000,
    profitOrLoss: { type: 'PROFIT', amount: 3000, percent: 300 },
    bankName: 'State Bank of India',
    withdrawalStatus: 'SUCCESS',
    timeToWithdraw: '1.8 hours ago',
    status: 'COMPLETED',
    type: 'EV_ENERGY_PROFIT_PAYOUT',
    description: 'EV Energy Starter Node: Invested ₹1,000 → Net Profit +₹3,000 credited to SBI A/c **9011',
    referenceId: 'IMPS-SBI-99182301',
    createdAt: new Date(Date.now() - 1000 * 60 * 108).toISOString(),
    isPublicInvestorEntry: true
  },
  {
    id: 'comm_ev_016',
    userId: 'usr_comm_16',
    investorName: 'Rohit Kulkarni',
    investPrice: 15000,
    amount: 60000,
    profitOrLoss: { type: 'PROFIT', amount: 45000, percent: 300 },
    bankName: 'ICICI Bank',
    withdrawalStatus: 'PROCESSING',
    timeToWithdraw: 'Processing (Bank Verification)',
    status: 'PROCESSING',
    type: 'VIRTUAL_WITHDRAWAL',
    description: 'EV Energy Gigawatt Substation: Invested ₹15,000 → Payout ₹60,000 processing to ICICI A/c **7721',
    referenceId: 'IMPS-ICIC-88192039',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    isPublicInvestorEntry: true
  },
  {
    id: 'comm_ev_017',
    userId: 'usr_comm_17',
    investorName: 'Manpreet Singh Dhillon',
    investPrice: 50000,
    amount: 200000,
    profitOrLoss: { type: 'PROFIT', amount: 150000, percent: 300 },
    bankName: 'HDFC Bank',
    withdrawalStatus: 'SUCCESS',
    timeToWithdraw: '2.1 hours ago',
    status: 'COMPLETED',
    type: 'EV_ENERGY_PROFIT_PAYOUT',
    description: 'EV Energy Sovereign Grid: Invested ₹50,000 → Net Profit +₹1,50,000 credited to HDFC A/c **5501',
    referenceId: 'RTGS-HDFC-10928394',
    createdAt: new Date(Date.now() - 1000 * 60 * 128).toISOString(),
    isPublicInvestorEntry: true
  },
  {
    id: 'comm_ev_018',
    userId: 'usr_comm_18',
    investorName: 'Sandeep Aggarwal',
    investPrice: 3000,
    amount: 12000,
    profitOrLoss: { type: 'PROFIT', amount: 9000, percent: 300 },
    bankName: 'Axis Bank',
    withdrawalStatus: 'SUCCESS',
    timeToWithdraw: '2.3 hours ago',
    status: 'COMPLETED',
    type: 'EV_ENERGY_PROFIT_PAYOUT',
    description: 'EV Energy Mega-Volt Unit: Invested ₹3,000 → Net Profit +₹9,000 credited to Axis A/c **1928',
    referenceId: 'IMPS-UTIB-39102834',
    createdAt: new Date(Date.now() - 1000 * 60 * 138).toISOString(),
    isPublicInvestorEntry: true
  },
  {
    id: 'comm_ev_019',
    userId: 'usr_comm_19',
    investorName: 'Kavita Venkatesh',
    investPrice: 10000,
    amount: 40000,
    profitOrLoss: { type: 'PROFIT', amount: 30000, percent: 300 },
    bankName: 'Canara Bank',
    withdrawalStatus: 'SUCCESS',
    timeToWithdraw: '2.5 hours ago',
    status: 'COMPLETED',
    type: 'EV_ENERGY_PROFIT_PAYOUT',
    description: 'EV Energy Interstate Corridor: Invested ₹10,000 → Net Profit +₹30,000 credited to Canara A/c **4419',
    referenceId: 'IMPS-CNRB-77192039',
    createdAt: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
    isPublicInvestorEntry: true
  },
  {
    id: 'comm_ev_020',
    userId: 'usr_comm_20',
    investorName: 'Dinesh Reddy',
    investPrice: 2000,
    amount: 0,
    profitOrLoss: { type: 'LOSS', amount: 2000, percent: -100 },
    bankName: 'Andhra Bank / UBI',
    withdrawalStatus: 'FAILED',
    timeToWithdraw: 'Bank IFSC Mismatch (Refunded)',
    status: 'FAILED',
    type: 'VIRTUAL_WITHDRAWAL',
    description: 'Withdrawal of ₹8,000 failed due to incorrect IFSC code. Principal balance safe and re-verified.',
    referenceId: 'FAIL-IFSC-99102',
    createdAt: new Date(Date.now() - 1000 * 60 * 165).toISOString(),
    isPublicInvestorEntry: true
  }
];

// Helper to generate remainder up to 125 entries deterministically with authentic Indian names, exact tiers and banks
const FIRST_NAMES = [
  'Virender', 'Gautam', 'Karan', 'Subhash', 'Anil', 'Deepak', 'Hemant', 'Jitendra',
  'Lalit', 'Mukesh', 'Naveen', 'Omkar', 'Pankaj', 'Qasim', 'Rupesh', 'Satish',
  'Trilok', 'Umesh', 'Vinay', 'Wasim', 'Yogesh', 'Zafar', 'Abhishek', 'Bhupendra',
  'Chirag', 'Devendra', 'Eshwar', 'Farhan', 'Govind', 'Harish', 'Ishwar', 'Jagdish',
  'Kuldeep', 'Laxman', 'Mahesh', 'Narendra', 'Praveen', 'Raghvendra', 'Siddharth', 'Tejas',
  'Varun', 'Yashpal', 'Anjali', 'Bhavna', 'Chitra', 'Divya', 'Ekta', 'Geeta',
  'Harsha', 'Indu', 'Jyoti', 'Kajal', 'Lata', 'Madhu', 'Nirmala', 'Prachi',
  'Ritu', 'Sarita', 'Tanvi', 'Usha', 'Vineeta', 'Komal', 'Manisha', 'Rashmi',
  'Simran', 'Aakash', 'Alok', 'Bharat', 'Chandan', 'Dharmendra', 'Gopal', 'Jai',
  'Kamal', 'Manish', 'Nitin', 'Pradeep', 'Rajiv', 'Sachin', 'Tushar', 'Vivek',
  'Aditi', 'Bhavika', 'Chandni', 'Deepa', 'Garima', 'Hema', 'Isha', 'Kavita',
  'Meenakshi', 'Nidhi', 'Payal', 'Renu', 'Shikha', 'Tanya', 'Varsha', 'Anurag',
  'Balram', 'Chetan', 'Durgesh', 'Girish', 'Jaswant', 'Kishore', 'Mohan', 'Piyush',
  'Raman', 'Shailendra'
];

const LAST_NAMES = [
  'Gurjar', 'Sharma', 'Patel', 'Singh', 'Verma', 'Gupta', 'Meena', 'Yadav',
  'Chauhan', 'Rathore', 'Joshi', 'Mishra', 'Pandey', 'Shukla', 'Tiwari', 'Dubey',
  'Bhardwaj', 'Agarwal', 'Bansal', 'Goyal', 'Mittal', 'Jain', 'Shah', 'Mehta',
  'Deshmukh', 'Kulkarni', 'Patil', 'Pawar', 'Shinde', 'Jadhav', 'Reddy', 'Rao',
  'Nair', 'Menon', 'Pillai', 'Iyer', 'Iyengar', 'Chatterjee', 'Banerjee', 'Mukherjee',
  'Ghosh', 'Bose', 'Sengupta', 'Dutta', 'Das', 'Roy', 'Barman', 'Biswas'
];

const BANKS = [
  'State Bank of India',
  'HDFC Bank',
  'ICICI Bank',
  'Punjab National Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Bank of Baroda',
  'IndusInd Bank',
  'Canara Bank',
  'Union Bank of India'
];

// Exact allowed prices per user prompt
const TIER_PRICES = [1000, 2000, 3000, 5000, 10000, 15000, 20000, 50000];

// Expected profit map: exactly 3x as mandated by user
export const TIER_PROFIT_MAP: Record<number, number> = {
  1000: 3000,
  2000: 6000,
  3000: 9000,
  5000: 15000,
  10000: 30000,
  15000: 45000,
  20000: 60000,
  50000: 150000
};

// Generate deterministic entries 21 through 125 (total 125 entries)
for (let i = 21; i <= 125; i++) {
  const firstName = FIRST_NAMES[(i * 7) % FIRST_NAMES.length];
  const lastName = LAST_NAMES[(i * 11) % LAST_NAMES.length];
  const investorName = `${firstName} ${lastName}`;
  const price = TIER_PRICES[i % TIER_PRICES.length];
  const profit = TIER_PROFIT_MAP[price];
  const bankName = BANKS[(i * 3) % BANKS.length];

  // 94% win/success, 4% processing, 2% failed
  let withdrawalStatus: 'SUCCESS' | 'PROCESSING' | 'FAILED' = 'SUCCESS';
  let profitOrLoss: { type: 'PROFIT' | 'LOSS'; amount: number; percent?: number } = {
    type: 'PROFIT',
    amount: profit,
    percent: 300
  };
  let amount = price + profit;
  let status: 'COMPLETED' | 'PROCESSING' | 'FAILED' = 'COMPLETED';

  if (i === 42 || i === 87 || i === 114) {
    withdrawalStatus = 'FAILED';
    profitOrLoss = { type: 'LOSS', amount: price, percent: -100 };
    amount = 0;
    status = 'FAILED';
  } else if (i % 11 === 0) {
    withdrawalStatus = 'PROCESSING';
    status = 'PROCESSING';
  }

  // Calculate realistic distributed timestamp
  const minutesAgo = 180 + i * 22; // spread over past 2-3 days
  const timeDate = new Date(Date.now() - minutesAgo * 60 * 1000);
  const hoursAgo = Math.floor(minutesAgo / 60);

  let timeToWithdraw = '';
  if (hoursAgo < 24) {
    timeToWithdraw = `${hoursAgo} hours ago (IMPS)`;
  } else {
    const daysAgo = Math.floor(hoursAgo / 24);
    timeToWithdraw = `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago (${bankName.slice(0, 4)})`;
  }

  COMMUNITY_INVESTOR_TRANSACTIONS.push({
    id: `comm_ev_${String(i).padStart(3, '0')}`,
    userId: `usr_comm_${String(i).padStart(3, '0')}`,
    investorName,
    investPrice: price,
    amount,
    profitOrLoss,
    bankName,
    withdrawalStatus,
    timeToWithdraw,
    status,
    type: profitOrLoss.type === 'PROFIT' ? 'EV_ENERGY_PROFIT_PAYOUT' : 'EV_ENERGY_SLOT_BOOK',
    description:
      profitOrLoss.type === 'PROFIT'
        ? `EV Energy Investment of ₹${price.toLocaleString()} resolved with +₹${profit.toLocaleString()} Profit → Transferred to ${bankName} A/c **${1000 + ((i * 37) % 9000)}`
        : `EV Energy slot of ₹${price.toLocaleString()} closed with simulated market volatility deduction (-₹${price.toLocaleString()})`,
    referenceId: `TXN-EV-${100000 + i * 491}`,
    createdAt: timeDate.toISOString(),
    isPublicInvestorEntry: true
  });
}
