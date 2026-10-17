import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db, generateToken, verifyToken } from './server/db.js';
import { marketDataService } from './server/marketDataService.js';

const app = express();
const PORT = 3000;

app.use(express.json());

// Auth middleware for normal users
interface AuthenticatedRequest extends Request {
  userId?: string;
  userRole?: string;
}

function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }
  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload || !payload.id) {
    return res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
  }
  req.userId = payload.id;
  req.userRole = payload.role;
  (req as any).user = { id: payload.id, role: payload.role };
  next();
}

// Admin middleware for protected admin APIs
function adminMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Admin authorization required' });
  }
  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload || payload.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Access denied: Super Admin credentials required' });
  }
  req.userId = payload.id;
  req.userRole = payload.role;
  (req as any).user = { id: payload.id, role: payload.role };
  next();
}

// ==========================================
// 1. AUTHENTICATION ENDPOINTS
// ==========================================
app.post('/api/auth/register', (req, res) => {
  const { email, password, name, phone } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  const existing = db.findUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: 'Account with this email already exists' });
  }

  const user = db.createUser(email, name, password, phone);
  const token = generateToken({ id: user.id, role: user.role });
  const profile = db.getProfile(user.id);
  const wallet = db.getWallet(user.id);

  res.status(201).json({
    message: 'Welcome to TradeX Simulator! Account created successfully.',
    user,
    token,
    profile,
    wallet
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const user = db.findUserByEmail(email);
  if (!user || !db.verifyUserPassword(user.id, password)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = generateToken({ id: user.id, role: user.role });
  const profile = db.getProfile(user.id);
  const wallet = db.getWallet(user.id);

  res.json({
    message: 'Logged in successfully',
    user,
    token,
    profile,
    wallet
  });
});

app.post('/api/auth/demo-login', (req, res) => {
  let user = db.findUserByEmail('investor@tradex.sim');
  if (!user) {
    user = db.createUser('investor@tradex.sim', 'Groww Demo Trader', 'tradex123');
  }
  const token = generateToken({ id: user.id, role: user.role });
  const profile = db.getProfile(user.id);
  const wallet = db.getWallet(user.id);
  res.json({
    message: 'Demo trading session ready',
    user,
    token,
    profile,
    wallet
  });
});

app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email address is required' });
  }
  const user = db.findUserByEmail(email);
  if (!user) {
    // Standard secure response
    return res.json({
      message: 'If the account exists, a simulated reset verification code has been generated.',
      simulatedCode: '782910'
    });
  }

  // Educational simulator helper: returns a simulated reset OTP code
  res.json({
    message: 'Simulated password reset code generated. Use code 782910 to reset your password.',
    simulatedCode: '782910'
  });
});

app.post('/api/auth/reset-password', (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!email || !newPassword || !code) {
    return res.status(400).json({ error: 'Email, code, and new password are required' });
  }
  if (code !== '782910' && code !== '123456') {
    return res.status(400).json({ error: 'Invalid simulated reset code' });
  }
  const user = db.findUserByEmail(email);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  db.resetUserPassword(user.id, newPassword);
  res.json({ message: 'Password updated successfully. You can now log in.' });
});

app.get('/api/auth/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = db.findUserById(req.userId!);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const profile = db.getProfile(user.id);
  const wallet = db.getWallet(user.id);
  res.json({ user, profile, wallet });
});

app.put('/api/auth/profile', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const updated = db.updateProfile(req.userId!, req.body);
  res.json({ profile: updated });
});

// ==========================================
// 2. WALLET & VIRTUAL TRANSACTIONS
// ==========================================
app.get('/api/wallet', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const wallet = db.getWallet(req.userId!);
  res.json({ wallet });
});

app.post('/api/wallet/quick-add', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const amount = Number(req.body.amount);
  if (!amount || amount <= 0 || amount > 10000000) {
    return res.status(400).json({ error: 'Please enter a valid virtual amount up to ₹1,00,00,000' });
  }
  const result = db.addVirtualDeposit(req.userId!, amount, 'INSTANT_CREDIT');
  res.json({
    message: `₹${amount.toLocaleString('en-IN')} added to your virtual learning wallet!`,
    wallet: result.wallet,
    deposit: result.deposit
  });
});

app.post('/api/wallet/deposit', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { amount, method } = req.body;
  const numAmount = Number(amount);
  if (!numAmount || numAmount <= 0) {
    return res.status(400).json({ error: 'Invalid deposit amount' });
  }
  const validMethods = ['UPI_SIMULATED', 'NETBANKING_SIMULATED', 'IMPS_SIMULATED', 'INSTANT_CREDIT'];
  const chosenMethod = validMethods.includes(method) ? method : 'UPI_SIMULATED';

  const result = db.addVirtualDeposit(req.userId!, numAmount, chosenMethod as any);
  res.json({
    message: 'Virtual deposit simulation completed successfully.',
    deposit: result.deposit,
    wallet: result.wallet
  });
});

app.post('/api/wallet/withdraw', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { amount, simulatedBankName, simulatedAccountMask } = req.body;
  const numAmount = Number(amount);
  if (!numAmount || numAmount <= 0) {
    return res.status(400).json({ error: 'Invalid withdrawal amount' });
  }

  const result = db.requestVirtualWithdrawal(
    req.userId!,
    numAmount,
    simulatedBankName || 'State Bank of India (Simulated)',
    simulatedAccountMask || '•••• 8821'
  );

  if ('error' in result) {
    return res.status(400).json({ error: result.error });
  }

  res.json({
    message: 'Virtual withdrawal initiated! Settlement scheduled via T+1 simulator cycle.',
    withdrawal: result.withdrawal,
    wallet: result.wallet
  });
});

app.post('/api/wallet/reset', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const result = db.resetUserAccount(req.userId!);
  res.json({
    message: 'Virtual portfolio and balance reset to initial ₹5,00,000.',
    wallet: result.wallet
  });
});

app.post('/api/wallet/simulate-dividend', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { symbol, amountPerShare } = req.body;
  const result = db.creditSimulatedDividend(
    req.userId!,
    symbol || 'RELIANCE',
    Number(amountPerShare) || 12.50
  );
  if ('error' in result) {
    return res.status(400).json({ error: result.error });
  }
  res.json({
    message: 'Simulated dividend payout successfully credited!',
    wallet: result.wallet,
    transaction: result.transaction
  });
});

// ==========================================
// 3. STOCKS & MARKET DATA
// ==========================================
app.get('/api/stocks', (req, res) => {
  const stocks = db.getStocks();
  const settings = db.getSettings();
  res.json({ stocks, settings });
});

app.get('/api/stocks/:symbol', (req, res) => {
  const symbol = req.params.symbol;
  const stock = db.getStockBySymbol(symbol);
  if (!stock) return res.status(404).json({ error: 'Stock not found' });
  res.json({ stock });
});

app.get('/api/stocks/:symbol/history', (req, res) => {
  const symbol = req.params.symbol;
  const timeframe = (req.query.timeframe as any) || '1D';
  const history = db.getStockHistory(symbol, timeframe);
  res.json({ symbol: symbol.toUpperCase(), timeframe, points: history });
});

app.get('/api/market/indices', (_req, res) => {
  res.json({ indices: marketDataService.getIndices() });
});

app.get('/api/market/status', (_req, res) => {
  res.json(marketDataService.getStatus());
});

app.post('/api/market/sync-now', async (_req, res) => {
  await marketDataService.syncNow();
  res.json({
    success: true,
    indices: marketDataService.getIndices(),
    stocks: db.getStocks(),
    status: marketDataService.getStatus()
  });
});

app.get('/api/market/live-feed', (_req, res) => {
  res.json({
    indices: marketDataService.getIndices(),
    stocks: db.getStocks(),
    status: marketDataService.getStatus()
  });
});

// ==========================================
// 4. TRADING & ORDERS
// ==========================================
app.get('/api/orders', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const orders = db.getOrders(req.userId!);
  res.json({ orders });
});

app.post('/api/orders', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { symbol, side, orderType, quantity, limitPrice } = req.body;
  if (!symbol || !side || !orderType || !quantity) {
    return res.status(400).json({ error: 'Missing required order parameters' });
  }

  const result = db.placeOrder(
    req.userId!,
    symbol,
    side,
    orderType,
    Number(quantity),
    limitPrice ? Number(limitPrice) : undefined
  );

  if ('error' in result) {
    return res.status(400).json({ error: result.error });
  }

  res.status(201).json({
    message: `${side} order for ${quantity} share(s) of ${symbol} placed successfully.`,
    order: result.order,
    wallet: result.wallet
  });
});

app.post('/api/orders/:id/cancel', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const orderId = req.params.id;
  const result = db.cancelOrder(req.userId!, orderId);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  const wallet = db.getWallet(req.userId!);
  res.json({ message: 'Order cancelled successfully', wallet });
});

// ==========================================
// 5. PORTFOLIO & TRANSACTIONS
// ==========================================
app.get('/api/portfolio', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const holdings = db.getPortfolioHoldings(req.userId!);
  const wallet = db.getWallet(req.userId!);

  const totalInvested = Number(holdings.reduce((sum, h) => sum + h.investedValue, 0).toFixed(2));
  const currentValue = Number(holdings.reduce((sum, h) => sum + h.currentValue, 0).toFixed(2));
  const unrealizedPnL = Number((currentValue - totalInvested).toFixed(2));
  const totalPnL = unrealizedPnL;
  const totalPnLPercent = totalInvested > 0 ? Number(((totalPnL / totalInvested) * 100).toFixed(2)) : 0;
  const realizedPnL = db.getRealizedPnL(req.userId!);
  const oneDayPnL = Number(holdings.reduce((sum, h) => sum + h.oneDayPnL, 0).toFixed(2));
  const oneDayPnLPercent = totalInvested > 0 ? Number(((oneDayPnL / totalInvested) * 100).toFixed(2)) : 0;

  res.json({
    holdings,
    summary: {
      totalInvested,
      currentValue,
      totalPnL,
      totalPnLPercent,
      unrealizedPnL,
      realizedPnL,
      oneDayPnL,
      oneDayPnLPercent,
      holdingsCount: holdings.length,
      availableVirtualCash: wallet.balance
    }
  });
});

app.get('/api/transactions', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const transactions = db.getTransactions(req.userId!);
  res.json({ transactions });
});

app.get('/api/community/transactions', (req, res) => {
  const transactions = db.getCommunityTransactions();
  res.json({ transactions, total: transactions.length });
});

// ==========================================
// 6. SIMULATOR STATUS & SETTINGS
// ==========================================
app.get('/api/simulator/status', (req, res) => {
  const settings = db.getSettings();
  res.json({
    settings,
    serverTime: new Date().toISOString(),
    disclosure: 'TradeX is a 100% virtual trading simulator for educational purposes only. No real financial capital or securities transactions are involved.'
  });
});

// ==========================================
// 7. ADMIN ENDPOINTS (Protected)
// ==========================================
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const admin = db.findAdminByUsername(username);
  if (!admin || !db.verifyAdminPassword(admin, password)) {
    return res.status(401).json({ error: 'Invalid admin credentials' });
  }

  const token = generateToken({ id: admin.id, role: 'SUPER_ADMIN' });
  res.json({
    message: 'Admin authorization granted',
    token,
    admin: { id: admin.id, username: admin.username, email: admin.email, role: admin.role }
  });
});

app.get('/api/admin/stats', adminMiddleware, (req, res) => {
  const stats = db.getAdminStats();
  res.json({ stats });
});

app.get('/api/admin/users', adminMiddleware, (req, res) => {
  const usersDetailed = db.getAdminUsersDetailed();
  res.json({ users: usersDetailed });
});

app.post('/api/admin/users/:id/balance', adminMiddleware, (req, res) => {
  const userId = req.params.id;
  const { newBalance } = req.body;
  if (typeof newBalance !== 'number' || newBalance < 0) {
    return res.status(400).json({ error: 'Valid positive balance required' });
  }
  const updated = db.adminAdjustUserBalance(userId, newBalance);
  if (!updated) return res.status(404).json({ error: 'User not found' });
  res.json({ message: 'User virtual balance updated', wallet: updated });
});

// Admin edit/override simulated holding for user (Quantity & Average Buy Price)
app.post('/api/admin/users/:id/holding', adminMiddleware, (req, res) => {
  const userId = req.params.id;
  const { symbol, quantity, averageBuyPrice } = req.body;
  if (!symbol || typeof quantity !== 'number' || typeof averageBuyPrice !== 'number') {
    return res.status(400).json({ error: 'Symbol, quantity, and average buy price are required.' });
  }
  const result = db.adminEditUserHolding(userId, symbol, quantity, averageBuyPrice);
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }
  res.json(result);
});

// Admin delete simulated holding from user
app.delete('/api/admin/users/:id/holding/:symbol', adminMiddleware, (req, res) => {
  const userId = req.params.id;
  const symbol = req.params.symbol;
  const result = db.adminDeleteUserHolding(userId, symbol);
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }
  res.json(result);
});

// Admin inject simulated profit / loss directly into user account
app.post('/api/admin/users/:id/inject-pnl', adminMiddleware, (req, res) => {
  const userId = req.params.id;
  const { amount, type, reason } = req.body;
  if (typeof amount !== 'number' || amount <= 0 || (type !== 'PROFIT' && type !== 'LOSS')) {
    return res.status(400).json({ error: 'Valid positive amount and type (PROFIT or LOSS) are required.' });
  }
  const result = db.adminInjectUserPnL(userId, amount, type, reason);
  res.json(result);
});

// Admin change password securely (no hardcoded passwords)
app.post('/api/admin/change-password', adminMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const adminId = req.userId || (req as any).user?.id;
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }
  const result = db.adminChangePassword(adminId, currentPassword, newPassword);
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }
  res.json(result);
});

app.get('/api/admin/stocks', adminMiddleware, (req, res) => {
  res.json({ stocks: db.getStocks() });
});

app.get('/api/admin/holdings', adminMiddleware, (req, res) => {
  const holdings = db.getAllUserHoldings();
  res.json({ holdings });
});

app.post('/api/admin/manipulate-holding', adminMiddleware, (req, res) => {
  const result = db.adminManipulateHoldingPnL(req.body);
  if ('error' in result) {
    return res.status(400).json({ error: result.error });
  }
  res.json(result);
});

app.post('/api/admin/reset-stock/:symbol', adminMiddleware, async (req, res) => {
  const symbol = req.params.symbol;
  const result = db.adminManipulateHoldingPnL({ symbol, mode: 'RESET' });
  if ('error' in result) {
    return res.status(400).json({ error: result.error });
  }
  try {
    await marketDataService.syncNow();
  } catch {}
  res.json({ message: `${symbol} reset to real market feed`, stock: db.getStockBySymbol(symbol) });
});

app.put('/api/admin/stocks/:symbol', adminMiddleware, (req, res) => {
  const symbol = req.params.symbol;
  const updated = db.adminUpdateStock(symbol, req.body);
  if (!updated) return res.status(404).json({ error: 'Stock not found' });
  res.json({ message: 'Stock updated', stock: updated });
});

app.post('/api/admin/stocks', adminMiddleware, (req, res) => {
  const newStock = db.adminAddStock(req.body);
  res.status(201).json({ message: 'Stock added successfully', stock: newStock });
});

app.get('/api/admin/orders', adminMiddleware, (req, res) => {
  const orders = db.getData().orders;
  res.json({ orders });
});

app.get('/api/admin/transactions', adminMiddleware, (req, res) => {
  const transactions = db.getData().transactions;
  res.json({ transactions });
});

app.get('/api/admin/deposits', adminMiddleware, (req, res) => {
  res.json({ deposits: db.getData().virtual_deposits });
});

app.get('/api/admin/withdrawals', adminMiddleware, (req, res) => {
  res.json({ withdrawals: db.getData().virtual_withdrawals });
});

app.get('/api/admin/settings', adminMiddleware, (req, res) => {
  res.json({ settings: db.getSettings() });
});

app.post('/api/admin/settings', adminMiddleware, (req, res) => {
  const updated = db.updateSettings(req.body);
  res.json({ message: 'Simulator settings updated', settings: updated });
});

app.post('/api/admin/tick', adminMiddleware, (req, res) => {
  db.tickSimulation();
  res.json({ message: 'Simulation tick executed successfully', settings: db.getSettings() });
});

// ==========================================
// EV ENERGY STOCK SIMULATION & ADMIN CONTROL ROUTES
// ==========================================
// User: fetch my active and historical EV energy slots
app.get('/api/ev-energy/slots', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const slots = db.getEvEnergySlots(userId);
  const config = db.getEvEnergyConfig();
  res.json({ slots, config, serverTime: new Date().toISOString() });
});

// User: book a new EV Energy Stock slot
app.post('/api/ev-energy/book-slot', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const { tierPrice, durationHours, sharesQuantity } = req.body;

  const result = db.bookEvEnergySlot(
    userId,
    Number(tierPrice),
    Number(durationHours),
    sharesQuantity ? Number(sharesQuantity) : 1
  );

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  const wallet = db.getWallet(userId);
  res.status(201).json({
    message: `EV Energy Stock Slot #${result.slot?.id} booked successfully for ₹${Number(tierPrice).toLocaleString()}`,
    slot: result.slot,
    wallet
  });
});

// User: check and settle finished slot
app.post('/api/ev-energy/settle-slot/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const slotId = req.params.id;
  const result = db.settleEvEnergySlot(slotId);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  const wallet = db.getWallet(req.userId!);
  res.json({
    message: result.result === 'WIN' ? 'Congratulations! Slot ended in Profit!' : 'Slot expired with loss.',
    ...result,
    wallet
  });
});

// Admin: fetch all slots across all users
app.get('/api/admin/ev-energy/slots', adminMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const slots = db.getEvEnergySlots();
  const config = db.getEvEnergyConfig();
  res.json({ slots, config, serverTime: new Date().toISOString() });
});

// Admin: get EV Energy config
app.get('/api/admin/ev-energy/config', adminMiddleware, (req: AuthenticatedRequest, res: Response) => {
  res.json({ config: db.getEvEnergyConfig() });
});

// Admin: update EV Energy config
app.post('/api/admin/ev-energy/config', adminMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const updated = db.updateEvEnergyConfig(req.body);
  res.json({ message: 'EV Energy Stock configuration updated', config: updated });
});

// Admin: update slot outcome and profit/loss amounts
app.post('/api/admin/ev-energy/slot/:id/set-outcome', adminMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const slotId = req.params.id;
  const { adminOutcome, profitAmount, lossAmount, notes } = req.body;
  const result = db.updateEvEnergySlot(slotId, {
    adminOutcome,
    profitAmount: profitAmount !== undefined ? Number(profitAmount) : undefined,
    lossAmount: lossAmount !== undefined ? Number(lossAmount) : undefined,
    notes
  });
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  res.json({ message: `EV Energy Slot #${slotId} outcome updated`, slot: result.slot });
});

// Admin: force settle slot immediately (Win or Loss)
app.post('/api/admin/ev-energy/slot/:id/settle-now', adminMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const slotId = req.params.id;
  const { forceOutcome } = req.body; // 'FORCE_WIN' | 'FORCE_LOSS'
  const result = db.settleEvEnergySlot(slotId, forceOutcome);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  res.json({
    message: `EV Energy Slot #${slotId} resolved as ${result.result}`,
    ...result
  });
});

// ==========================================
// BACKGROUND REAL-TIME MARKET DATA & SIMULATOR RUNNER
// ==========================================
marketDataService.start();

// ==========================================
// VITE SPA MIDDLEWARE / PRODUCTION STATIC
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TradeX Simulator Server running on port ${PORT}`);
  });
}

startServer();
