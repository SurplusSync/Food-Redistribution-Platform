/* eslint-disable @typescript-eslint/no-explicit-any, prefer-const, @typescript-eslint/no-unused-vars */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminDashboard from '../../../pages/dashboard/AdminDashboard';
import { adminAPI } from '../../../services/api';
import { toast } from 'sonner';

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

describe('AdminDashboard - Epic 7 User Story 1 & 2', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Default tab is 'notifications', so getAdminNotifications fires on mount
    vi.mocked(adminAPI.getAdminNotifications).mockResolvedValue({ data: [] } as any);
    vi.mocked(adminAPI.getPendingNGOs).mockResolvedValue({ data: [] } as any);
    vi.mocked(adminAPI.getAllUsers).mockResolvedValue({ data: [] } as any);
    vi.mocked(adminAPI.getAllDonations).mockResolvedValue({ data: [] } as any);
    vi.mocked(adminAPI.getFlaggedDonations).mockResolvedValue({ data: [] } as any);
    vi.mocked(adminAPI.getAllTickets).mockResolvedValue({ data: [] } as any);
  });

  it('should render the admin dashboard with title and description', async () => {
    render(<AdminDashboard />);
    expect(screen.getByText('System Administration')).toBeTruthy();
    expect(screen.getByText(/Manage users, donations, and platform health/i)).toBeTruthy();
  });

  it('should render tabs including Pending NGOs, All Users, and Donations', async () => {
    render(<AdminDashboard />);
    expect(screen.getByText('Pending NGOs')).toBeTruthy();
    expect(screen.getByText('All Users')).toBeTruthy();
    expect(screen.getByText('Donations')).toBeTruthy();
  });

  it('should render Sign out button', async () => {
    render(<AdminDashboard />);
    expect(screen.getByText('Sign out')).toBeTruthy();
  });

  describe('Pending NGOs Tab (User Story 1)', () => {
    it('should fetch and display pending NGOs', async () => {
      const mockPendingNGOs = [
        {
          id: '1',
          name: 'Food Bank A',
          email: 'foodbank@example.com',
          organizationName: 'Food Bank A',
          role: 'NGO',
          isVerified: false,
          createdAt: '2026-02-20T00:00:00.000Z',
        },
      ];

      vi.mocked(adminAPI.getPendingNGOs).mockResolvedValue({ data: mockPendingNGOs } as any);

      render(<AdminDashboard />);

      fireEvent.click(screen.getByText('Pending NGOs'));

      await waitFor(() => {
        expect(adminAPI.getPendingNGOs).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getAllByText('Food Bank A').length).toBeGreaterThan(0);
        expect(screen.getByText('foodbank@example.com')).toBeTruthy();
      });
    });

    it('should call verifyNGO API when Approve button is clicked', async () => {
      const mockPendingNGOs = [
        {
          id: 'ngo-123',
          name: 'Food Bank A',
          email: 'foodbank@example.com',
          organizationName: 'Food Bank A',
          role: 'NGO',
          createdAt: '2026-02-20T00:00:00.000Z',
        },
      ];

      vi.mocked(adminAPI.getPendingNGOs).mockResolvedValue({ data: mockPendingNGOs } as any);
      vi.mocked(adminAPI.verifyNGO).mockResolvedValue({ data: { message: 'Verified' } } as any);

      render(<AdminDashboard />);

      fireEvent.click(screen.getByText('Pending NGOs'));

      await waitFor(() => {
        expect(screen.getByText('Approve')).toBeTruthy();
      });

      fireEvent.click(screen.getByText('Approve'));

      await waitFor(() => {
        expect(adminAPI.verifyNGO).toHaveBeenCalledWith('ngo-123');
        expect(toast.success).toHaveBeenCalledWith('NGO verified - email sent');
      });
    });
  });

  describe('All Users Tab (User Story 2)', () => {
    it('should fetch and display all users when switching to Users tab', async () => {
      const mockUsers = [
        {
          id: '1',
          name: 'John Donor',
          email: 'john@example.com',
          role: 'DONOR',
          isVerified: true,
          isActive: true,
          createdAt: '2026-02-20T00:00:00.000Z',
        },
      ];

      vi.mocked(adminAPI.getAllUsers).mockResolvedValue({ data: mockUsers } as any);

      render(<AdminDashboard />);

      fireEvent.click(screen.getByText('All Users'));

      await waitFor(() => {
        expect(adminAPI.getAllUsers).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByText('John Donor')).toBeTruthy();
        expect(screen.getByText('john@example.com')).toBeTruthy();
        expect(screen.getByText('Active')).toBeTruthy();
      });
    });

    it('should display suspended status for inactive users', async () => {
      const mockUsers = [
        {
          id: '1',
          name: 'Banned User',
          email: 'banned@example.com',
          role: 'DONOR',
          isActive: false,
          createdAt: '2026-02-20T00:00:00.000Z',
        },
      ];

      vi.mocked(adminAPI.getAllUsers).mockResolvedValue({ data: mockUsers } as any);

      render(<AdminDashboard />);

      fireEvent.click(screen.getByText('All Users'));

      await waitFor(() => {
        expect(screen.getByText('Suspended')).toBeTruthy();
      });
    });

    it('should not show suspend button for ADMIN users', async () => {
      const mockUsers = [
        {
          id: 'admin-123',
          name: 'System Admin',
          email: 'admin@surplussync.com',
          role: 'ADMIN',
          isActive: true,
          createdAt: '2026-02-20T00:00:00.000Z',
        },
      ];

      vi.mocked(adminAPI.getAllUsers).mockResolvedValue({ data: mockUsers } as any);

      render(<AdminDashboard />);

      fireEvent.click(screen.getByText('All Users'));

      await waitFor(() => {
        expect(screen.getByText('System Admin')).toBeTruthy();
      });

      expect(screen.queryByText('Suspend')).toBeNull();
      expect(screen.queryByText('Restore')).toBeNull();
    });
  });

  describe('Donations Tab', () => {
    it('should fetch and display all donations when switching to Donations tab', async () => {
      const mockDonations = [
        {
          id: '1',
          name: 'Rice',
          foodType: 'packaged',
          quantity: 50,
          unit: 'kg',
          status: 'AVAILABLE',
          donor: { email: 'donor@example.com' },
          createdAt: '2026-02-20T00:00:00.000Z',
        },
      ];

      vi.mocked(adminAPI.getAllDonations).mockResolvedValue({ data: mockDonations } as any);

      render(<AdminDashboard />);

      fireEvent.click(screen.getByText('Donations'));

      await waitFor(() => {
        expect(adminAPI.getAllDonations).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByText('Rice')).toBeTruthy();
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error toast when fetching data fails', async () => {
      vi.mocked(adminAPI.getAdminNotifications).mockRejectedValue(new Error('Network error'));

      render(<AdminDashboard />);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to fetch data');
      });
    });
  });
});
