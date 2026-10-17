/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TradeProvider, useTrade } from './context/TradeContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { QuickAddModal } from './components/QuickAddModal';
import { OrderModal } from './components/OrderModal';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { MarketsPage } from './pages/MarketsPage';
import { StockDetailsPage } from './pages/StockDetailsPage';
import { IndexDetailPage } from './pages/IndexDetailPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { OrdersPage } from './pages/OrdersPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { VirtualWalletPage } from './pages/VirtualWalletPage';
import { DepositLearnPage } from './pages/DepositLearnPage';
import { WithdrawLearnPage } from './pages/WithdrawLearnPage';
import { InvestmentLearnPage } from './pages/InvestmentLearnPage';
import { MutualFundsPage } from './pages/MutualFundsPage';
import { IpoPage } from './pages/IpoPage';
import { EtfPage } from './pages/EtfPage';
import { WatchlistsPage } from './pages/WatchlistsPage';
import { BankAccountsPage } from './pages/BankAccountsPage';
import { CommoditiesPage } from './pages/CommoditiesPage';
import { PnLSheetPage } from './pages/PnLSheetPage';
import { ProfilePage } from './pages/ProfilePage';
import { IndiansEnergyPage } from './pages/IndiansEnergyPage';
import { EvEnergyStockPage } from './pages/EvEnergyStockPage';
import { SettingsPage } from './pages/SettingsPage';
import { TermsAboutPage } from './pages/TermsAboutPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

const AppContent: React.FC = () => {
  const { currentPage, theme, isAdmin } = useTrade();

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage />;
      case 'login':
        return <LoginPage />;
      case 'register':
        return <RegisterPage />;
      case 'dashboard':
        return <DashboardPage />;
      case 'markets':
      case 'buy-sell':
        return <MarketsPage />;
      case 'stock-details':
        return <StockDetailsPage />;
      case 'index-details':
        return <IndexDetailPage />;
      case 'portfolio':
        return <PortfolioPage />;
      case 'orders':
        return <OrdersPage />;
      case 'transactions':
        return <TransactionsPage />;
      case 'wallet':
        return <VirtualWalletPage />;
      case 'deposit-learn':
        return <DepositLearnPage />;
      case 'withdraw-learn':
        return <WithdrawLearnPage />;
      case 'investment':
        return <InvestmentLearnPage />;
      case 'mutual-funds':
        return <MutualFundsPage />;
      case 'ipos':
        return <IpoPage />;
      case 'etfs':
        return <EtfPage />;
      case 'watchlists':
        return <WatchlistsPage />;
      case 'bank-accounts':
        return <BankAccountsPage />;
      case 'commodities':
        return <CommoditiesPage />;
      case 'pnl-sheet':
        return <PnLSheetPage />;
      case 'profile':
        return <ProfilePage />;
      case 'settings':
        return <SettingsPage />;
      case 'terms':
        return <TermsAboutPage />;
      case 'indians-energy':
        return <IndiansEnergyPage />;
      case 'ev-energy-stock':
        return <EvEnergyStockPage />;
      case 'admin-login':
        return isAdmin ? <AdminDashboardPage /> : <AdminLoginPage />;
      case 'admin-dashboard':
        return isAdmin ? <AdminDashboardPage /> : <DashboardPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-150 ${
        theme === 'dark'
          ? 'dark bg-[#0c0f17] text-slate-100 selection:bg-[#00d09c] selection:text-slate-950'
          : 'bg-[#f4f7fa] text-slate-900 selection:bg-[#00d09c] selection:text-white'
      }`}
    >
      <Navbar />
      <main className="flex-1">{renderPage()}</main>
      <BottomNav />
      <QuickAddModal />
      <OrderModal />
    </div>
  );
};

export default function App() {
  return (
    <TradeProvider>
      <AppContent />
    </TradeProvider>
  );
}
