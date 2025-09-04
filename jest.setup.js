import '@testing-library/jest-dom';

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
  })
);

// Mock ethers library
jest.mock('ethers', () => ({
  ethers: {
    formatUnits: jest.fn((value, decimals) => {
      return (parseInt(value) / Math.pow(10, decimals)).toString();
    }),
    parseUnits: jest.fn((value, decimals) => {
      return (parseFloat(value) * Math.pow(10, decimals)).toString();
    }),
    formatEther: jest.fn((value) => (parseInt(value) / 1e18).toString()),
    isAddress: jest.fn((address) => /^0x[a-fA-F0-9]{40}$/.test(address)),
    BrowserProvider: jest.fn().mockImplementation(() => ({
      getBalance: jest.fn().mockResolvedValue('1000000000000000000'), // 1 ETH
      getNetwork: jest.fn().mockResolvedValue({ chainId: 5 }),
      getSigner: jest.fn().mockResolvedValue({}),
    })),
    Contract: jest.fn().mockImplementation(() => ({
      balanceOf: jest.fn().mockResolvedValue('1000000'), // 1 USDC
      transfer: jest.fn().mockResolvedValue({ hash: '0x123...abc' }),
      connect: jest.fn().mockReturnThis(),
    })),
  },
}));

// Mock window.ethereum
Object.defineProperty(window, 'ethereum', {
  value: {
    request: jest.fn(),
    on: jest.fn(),
    removeListener: jest.fn(),
  },
  writable: true,
});

// Mock next/font
jest.mock('next/font/google', () => ({
  Inter: () => ({
    className: 'inter-font',
  }),
}));

// Mock recharts
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => children,
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
}));