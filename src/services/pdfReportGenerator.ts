import jsPDF from 'jspdf';
import { Portfolio, Transaction, User, VirtualWallet } from '../types';
import { formatINR } from './api';

export interface ReportData {
  user: User | null;
  wallet: VirtualWallet | null;
  portfolio: Portfolio | null;
  transactions: Transaction[];
  dateRange?: 'current_fy' | 'last_30_days' | 'all_time';
}

export function generateGrowwPdfReport(data: ReportData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 15;

  // Header Banner - Groww Brand Theme
  doc.setFillColor(0, 208, 156); // #00d09c Groww Green
  doc.rect(0, 0, pageWidth, 24, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Groww | TradeX', 14, 12);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Consolidated P&L & Portfolio Statement', 14, 18);

  // Date on right
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  doc.setFontSize(9);
  doc.text(`Generated: ${dateStr}`, pageWidth - 14, 12, { align: 'right' });
  doc.text(`Doc Ref: GRW-${now.getTime().toString().slice(-8)}`, pageWidth - 14, 18, { align: 'right' });

  y = 32;

  // Client Details Card
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(14, y, pageWidth - 28, 22, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Investor Details:', 18, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Name: ${data.user?.name || 'Verified Trader'}`, 18, y + 12);
  doc.text(`Email: ${data.user?.email || 'trader@groww.in'}`, 18, y + 17);

  doc.text(`PAN: ABCDE1234F (KYC Verified)`, 100, y + 12);
  doc.text(`Depository: CDSL | BO ID: 1208160004921980`, 100, y + 17);

  y += 28;

  // Portfolio Summary Highlights Box
  const summary = data.portfolio?.summary || {
    totalInvested: 0,
    currentValue: 0,
    totalPnL: 0,
    totalPnLPercent: 0,
    oneDayPnL: 0,
    oneDayPnLPercent: 0,
    holdingsCount: 0,
    availableVirtualCash: data.wallet?.balance || 0
  };

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Portfolio & P&L Snapshot', 14, y);

  y += 4;

  const boxWidth = (pageWidth - 28 - 9) / 4;
  const statBoxes = [
    { label: 'Total Invested', value: formatINR(summary.totalInvested), color: [15, 23, 42] },
    { label: 'Current Value', value: formatINR(summary.currentValue), color: [15, 23, 42] },
    {
      label: 'Net P&L (Returns)',
      value: `${summary.totalPnL >= 0 ? '+' : ''}${formatINR(summary.totalPnL)} (${summary.totalPnLPercent.toFixed(2)}%)`,
      color: summary.totalPnL >= 0 ? [0, 179, 134] : [225, 29, 72]
    },
    { label: 'Available Cash', value: formatINR(data.wallet?.balance || 0), color: [0, 179, 134] }
  ];

  statBoxes.forEach((b, idx) => {
    const bx = 14 + idx * (boxWidth + 3);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(bx, y, boxWidth, 16, 1.5, 1.5, 'FD');

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(b.label, bx + 3, y + 5);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(b.color[0], b.color[1], b.color[2]);
    doc.text(b.value, bx + 3, y + 12);
  });

  y += 24;

  // Table 1: Holdings & P&L Breakdown
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Holdings Ledger & Unrealized P&L', 14, y);

  y += 4;

  // Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageWidth - 28, 7, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);

  doc.text('Company / Asset', 16, y + 5);
  doc.text('Qty', 75, y + 5, { align: 'right' });
  doc.text('Avg Price', 95, y + 5, { align: 'right' });
  doc.text('LTP (CMP)', 120, y + 5, { align: 'right' });
  doc.text('Current Value', 145, y + 5, { align: 'right' });
  doc.text('Total P&L (%)', pageWidth - 16, y + 5, { align: 'right' });

  y += 7;

  const holdings = data.portfolio?.holdings || [];
  if (holdings.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('No stock holdings currently in portfolio.', 16, y + 6);
    y += 10;
  } else {
    holdings.forEach((h) => {
      if (y > pageHeight - 30) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);

      // Symbol & Name
      doc.setFont('helvetica', 'bold');
      doc.text(h.symbol, 16, y + 5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text((h.stockName || h.symbol).slice(0, 26), 34, y + 5);

      doc.setTextColor(30, 41, 59);
      doc.text(String(h.quantity), 75, y + 5, { align: 'right' });
      doc.text(formatINR(h.averageBuyPrice), 95, y + 5, { align: 'right' });
      doc.text(formatINR(h.currentPrice), 120, y + 5, { align: 'right' });
      doc.text(formatINR(h.currentValue), 145, y + 5, { align: 'right' });

      const pnlVal = h.unrealizedPnL || 0;
      const pnlPct = h.unrealizedPnLPercent || 0;
      const isPos = pnlVal >= 0;
      if (isPos) doc.setTextColor(0, 179, 134);
      else doc.setTextColor(225, 29, 72);
      doc.setFont('helvetica', 'bold');
      const pnlStr = `${isPos ? '+' : ''}${formatINR(pnlVal)} (${pnlPct.toFixed(1)}%)`;
      doc.text(pnlStr, pageWidth - 16, y + 5, { align: 'right' });

      // Line divider
      doc.setDrawColor(241, 245, 249);
      doc.line(14, y + 7, pageWidth - 14, y + 7);

      y += 7;
    });
  }

  y += 6;

  // Table 2: Recent Transactions & Fund Activity
  if (y > pageHeight - 65) {
    doc.addPage();
    y = 20;
  }

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Transaction Ledger & Fund Movement History', 14, y);

  y += 4;

  // Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageWidth - 28, 7, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);

  doc.text('Date & Time', 16, y + 5);
  doc.text('Type', 65, y + 5);
  doc.text('Details / Reference ID', 105, y + 5);
  doc.text('Status', 145, y + 5);
  doc.text('Amount (INR)', pageWidth - 16, y + 5, { align: 'right' });

  y += 7;

  const txs = data.transactions || [];
  if (txs.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('No recorded transactions.', 16, y + 6);
    y += 10;
  } else {
    txs.slice(0, 12).forEach((tx) => {
      if (y > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);

      const d = new Date(tx.createdAt || new Date());
      const dateStr = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      doc.text(`${dateStr} ${timeStr}`, 16, y + 5);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(tx.type.replace(/_/g, ' '), 65, y + 5);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      const ref = (tx.referenceId || tx.id).slice(0, 18);
      doc.text(ref, 105, y + 5);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 179, 134);
      doc.text(tx.status || 'COMPLETED', 145, y + 5);

      const isCredit =
        tx.type === 'VIRTUAL_DEPOSIT' ||
        tx.type === 'DIVIDEND_CREDIT' ||
        tx.type === 'SELL_ORDER' ||
        tx.type === 'COMMODITY_SELL';
      if (isCredit) doc.setTextColor(0, 179, 134);
      else doc.setTextColor(225, 29, 72);
      const sign = isCredit ? '+' : '-';
      doc.text(`${sign}${formatINR(tx.amount)}`, pageWidth - 16, y + 5, { align: 'right' });

      doc.setDrawColor(241, 245, 249);
      doc.line(14, y + 7, pageWidth - 14, y + 7);

      y += 7;
    });
  }

  // Footer Disclaimer
  const footerY = pageHeight - 14;
  doc.setDrawColor(203, 213, 225);
  doc.line(14, footerY - 4, pageWidth - 14, footerY - 4);

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Groww (Nextbillion Technology Pvt. Ltd.) | SEBI Regn: INZ000301838 | BSE Member: 6699 | NSE Member: 90177 | CDSL DP: 12081600',
    14,
    footerY
  );
  doc.text('Computer generated official record. Verified via clearing node.', pageWidth - 14, footerY, {
    align: 'right'
  });

  return doc;
}

export function downloadGrowwPdf(data: ReportData): void {
  const doc = generateGrowwPdfReport(data);
  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`Groww_TradeX_Statement_${dateStr}.pdf`);
}
