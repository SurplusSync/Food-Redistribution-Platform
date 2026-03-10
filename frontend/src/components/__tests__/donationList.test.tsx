import { render, screen, waitFor } from '@testing-library/react';
import NGODashboard from '../../pages/dashboard/NGODashboard';
import { getDonations } from '../../services/api';

vi.mock('react-router-dom', () => ({
    Link: ({ to, children }: any) => <a href={to}>{children}</a>,
    useNavigate: () => vi.fn(),
    BrowserRouter: ({ children }: any) => children,
    Routes: ({ children }: any) => children,
    Route: ({ element }: any) => element,
}));

vi.mock('../../services/api', () => ({
    getDonations: vi.fn(),
    claimDonation: vi.fn(),
}));

// Mock leaflet since NGODashboard relies on generic maps intrinsically
vi.mock('react-leaflet', () => ({
    MapContainer: ({ children }: any) => <div data-testid="map-container">{children}</div>,
    TileLayer: () => <div />,
    Marker: () => <div />,
    Polyline: () => <div />,
    useMap: () => ({ flyTo: vi.fn() }),
}));

describe('DonationList Rendering', () => {
    beforeEach(() => {
        localStorage.clear();
        localStorage.setItem(
            'user',
            JSON.stringify({ id: 'ngo-1', name: 'NGO Org', role: 'ngo' })
        );
        vi.clearAllMocks();
    });

    it('Mock API response and ensure donation cards render correctly', async () => {
        // 1. Mock API Data Rendering
        const mockDonations = [
            {
                id: 'don-1',
                name: 'Fresh Veggies',
                foodType: 'raw',
                status: 'AVAILABLE',
                quantity: 10,
                unit: 'kg',
                donorName: 'Farm Fresh',
                expiryTime: new Date(Date.now() + 86400000).toISOString(),
            },
            {
                id: 'don-2',
                name: 'Leftover Buffet',
                foodType: 'cooked',
                status: 'AVAILABLE',
                quantity: 20,
                unit: 'meals',
                donorName: 'Grand Hotel',
                expiryTime: new Date(Date.now() + 86400000).toISOString(),
            },
        ];

        (getDonations as any).mockResolvedValue(mockDonations);

        render(<NGODashboard />);

        // Wait for the elements to fetch and render
        await waitFor(() => {
            // 2. Assert API Data Renders fully onto the cards!
            expect(screen.getByText('Fresh Veggies')).toBeInTheDocument();
            expect(screen.getByText('Leftover Buffet')).toBeInTheDocument();
            expect(screen.getByText(/Farm Fresh/)).toBeInTheDocument();
            expect(screen.getByText(/Grand Hotel/)).toBeInTheDocument();
        });
    });
});
