# USDC Dashboard - Ethereum Testnet

Frontend application for monitoring and managing USDC transactions on the Ethereum testnet.

## Getting Started

### Prerequisites

1. **MetaMask Extension**: Install MetaMask browser extension
2. **Etherscan API Key**: Register at [Etherscan.io](https://etherscan.io/apis) for a free API key
3. **Test USDC**: Get test USDC tokens for testing transfers

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Copy `.env.example` file and rename it to  `.env`, update the keys with your Etherscan API key:
```
NEXT_PUBLIC_ETHERSCAN_API_KEY=your_api_key_here
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Usage

1. **Connect Wallet**: Click "Connect MetaMask" to connect your wallet
2. **View Dashboard**: Explore your transaction metrics and recent activity
3. **Browse History**: Use the Transaction History tab to view and filter all transactions
4. **Send USDC**: Use the Send USDC tab to transfer tokens to other addresses


## Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## Architecture

### Components Structure
- `WalletConnection`: Handles MetaMask integration and wallet state
- `Dashboard`: Shows transaction metrics with interactive charts
- `TransactionHistory`: Advanced transaction table with filtering
- `TransferUSDC`: Secure USDC transfer interface
- `Navigation`: Tab-based navigation system

### State Management
- `WalletContext`: Centralized wallet state with React Context API
- Custom hooks for wallet operations and data fetching
- Proper error handling and loading states throughout

### Security Features
- Input validation with Zod schemas
- Address validation for all Ethereum addresses
- Secure transaction confirmation flows
- Error boundaries for graceful error handling

## Performance Optimizations

- Memoized transaction filtering and sorting
- Lazy loading for transaction data
- Efficient re-rendering with React hooks
- Responsive image loading for charts

## Accessibility

- WCAG 2.1 compliant design
- Keyboard navigation support
- Screen reader friendly components
- High contrast color schemes

## Browser Support

- Chrome/Chromium-based browsers (recommended)
- Firefox
- Safari
- Edge
