// ── Global Module Mocks ─────────────────────────────────

vi.mock('../services/api');

vi.mock('../services/socket', () => ({
  socketService: {
    connect: vi.fn(),
    disconnect: vi.fn(),
    isConnected: vi.fn(() => false),
    onDonationCreated: vi.fn(() => vi.fn()),
    onDonationClaimed: vi.fn(() => vi.fn()),
    onNotification: vi.fn(() => vi.fn()),
    onVolunteerAssigned: vi.fn(() => vi.fn()),
    onNearExpiryAlert: vi.fn(() => vi.fn()),
    onVolunteerLocation: vi.fn(() => vi.fn()),
    emitVolunteerLocation: vi.fn(),
  },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: vi.fn(), language: 'en' },
  }),
  Trans: ({ children }: any) => children,
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

vi.mock('sonner', () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  }),
  Toaster: () => null,
}));

vi.mock('react-leaflet', () => ({
  MapContainer: () => null,
  TileLayer: () => null,
  Marker: () => null,
  Popup: () => null,
  Polyline: () => null,
  useMap: () => ({ flyTo: vi.fn(), getZoom: vi.fn(() => 15) }),
}));

vi.mock('leaflet', () => ({
  default: {
    DivIcon: vi.fn(),
    Icon: { Default: { prototype: {}, mergeOptions: vi.fn() } },
    icon: vi.fn(),
    divIcon: vi.fn(),
  },
  DivIcon: vi.fn(),
  Icon: { Default: { prototype: {}, mergeOptions: vi.fn() } },
  icon: vi.fn(),
  divIcon: vi.fn(),
}));

vi.mock('../i18n', () => ({}));

// ── Mock navigator.geolocation ──────────────────────────
Object.defineProperty(navigator, 'geolocation', {
  value: {
    watchPosition: vi.fn(),
    clearWatch: vi.fn(),
    getCurrentPosition: vi.fn(),
  },
  writable: true,
});

// ── Mock localStorage ───────────────────────────────────
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// ── Mock window.matchMedia ──────────────────────────────
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
