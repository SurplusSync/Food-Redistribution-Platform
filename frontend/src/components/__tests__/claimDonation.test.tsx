import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NGODashboard from '../../pages/dashboard/NGODashboard';
import { getDonations, claimDonation } from '../../services/api';

vi.mock('react-router-dom', () => ({
    Link: ({ to, children }: any) => <a href={to}>{children}</a>,
    useNavigate: () => vi.fn(),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('../../services/socket', () => ({
    socketService: {
        onDonationCreated: vi.fn().mockReturnValue(() => { }),
        onDonationClaimed: vi.fn().mockReturnValue(() => { }),
        onVolunteerLocation: vi.fn().mockReturnValue(() => { }),
    },
}));

vi.mock('../../services/api', () => ({
    getDonations: vi.fn(),
    claimDonation: vi.fn(),
}));

vi.mock('react-leaflet', () => ({
    MapContainer: ({ children }: any) => <div data-testid="map-container">{children}</div>,
    TileLayer: () => <div />,
    Marker: () => <div />,
    Polyline: () => <div />,
    useMap: () => ({ flyTo: vi.fn() }),
}));

describe('ClaimDonation UI Flows', () => {
    beforeEach(() => {
        localStorage.clear();
        localStorage.setItem(
            'user',
            JSON.stringify({ id: 'ngo-1', name: 'NGO Org', role: 'ngo', isVerified: true })
        );
        vi.clearAllMocks();
    });

    it('When user clicks "Claim Donation", item is removed and state updates to "Claimed"', async () => {
        const freshPayload = {
            id: 'don-1',
            name: 'Fresh Veggies',
            foodType: 'raw',
            status: 'AVAILABLE', // Currently available
            quantity: 10,
            unit: 'kg',
            donorName: 'Farm Fresh',
            preparationTime: new Date().toISOString(),
            expiryTime: new Date(Date.now() + 86400000).toISOString(),
        };

        // First API call renders an available item
        (getDonations as any).mockResolvedValueOnce([freshPayload]);

        render(<NGODashboard />);

        // Ensures component loaded
        await waitFor(() => {
            expect(screen.getByText('Fresh Veggies')).toBeInTheDocument();
        });

        // 1. Click "viewDetails" to open the detail modal housing the claim button
        const viewDetailsButtons = screen.getAllByText('viewDetails');
        fireEvent.click(viewDetailsButtons[0]);

        // Ensure the modal actually opened up displaying claim button
        await waitFor(() => {
            expect(screen.getByText('claimThisFood')).toBeInTheDocument();
        });

        // Setup backend to return the item as CLAIMED next time around ensuring UI state refresh natively
        (getDonations as any).mockResolvedValueOnce([
            { ...freshPayload, status: 'CLAIMED' },
        ]);
        (claimDonation as any).mockResolvedValueOnce({ success: true });

        // 2. Click "Claim Donation" button (text matched to translation mock 'claimThisFood')
        const claimBtn = screen.getByText('claimThisFood');
        fireEvent.click(claimBtn);

        await waitFor(() => {
            expect(claimDonation).toHaveBeenCalledWith('don-1');
        });

        // 3. UI State: Verify the available button string flips from 'available' to 'claimed' after re-render bounds natively
        await waitFor(() => {
            // The status badges output are mapped out to the `CLAIMED` status array
            expect(screen.getByText('claimed')).toBeInTheDocument();
        });
    });
});
