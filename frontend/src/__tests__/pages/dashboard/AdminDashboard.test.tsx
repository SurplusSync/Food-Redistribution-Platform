import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminDashboard from '../../../pages/dashboard/AdminDashboard';
import { adminAPI } from '../../../services/api';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('../../../services/api', () => ({
  adminAPI: {
    getPendingNGOs: vi.fn(),
    verifyNGO: vi.fn(),
    getAllUsers: vi.fn(),
    toggleUserStatus: vi.fn(),
    getAllDonations: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

describe('AdminDashboard - Epic 7 User Story 1 & 2', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should render the admin dashboard with title and description', () => {
    vi.mocked(adminAPI.getPendingNGOs).mockResolvedValue({ data: [] });
    
    render(<AdminDashboard />);

    expect(screen.getByText('System Administration')).toBeTruthy();
    expect(screen.getByText(/Manage users, approve NGOs/i)).toBeTruthy();
  });

  it('should render three tabs: Pending NGOs, All Users, Platform Donations', () => {
    vi.mocked(adminAPI.getPendingNGOs).mockResolvedValue({ data: [] });
    
    render(<AdminDashboard />);

    expect(screen.getByText('Pending NGOs')).toBeTruthy();
    expect(screen.getByText('All Users')).toBeTruthy();
    expect(screen.getByText('Platform Donations')).toBeTruthy();
  });

  it('should render Sign Out button', () => {
    vi.mocked(adminAPI.getPendingNGOs).mockResolvedValue({ data: [] });
    
    render(<AdminDashboard />);

    expect(screen.getByText('Sign Out')).toBeTruthy();
  });

  describe('Pending NGOs Tab (User Story 1)', () => {
    it('should fetch and display pending NGOs on mount', async () => {
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

      vi.mocked(adminAPI.getPendingNGOs).mockResolvedValue({ data: mockPendingNGOs });

      render(<AdminDashboard />);

      await waitFor(() => {
        expect(adminAPI.getPendingNGOs).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByText('Food Bank A')).toBeTruthy();
        expect(screen.getByText('foodbank@example.com')).toBeTruthy();
      });
    });

    it('should display "No records found" when no pending NGOs exist', async () => {
      vi.mocked(adminAPI.getPendingNGOs).mockResolvedValue({ data: [] });

      render(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.getByText('No records found.')).toBeTruthy();
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

      vi.mocked(adminAPI.getPendingNGOs).mockResolvedValue({ data: mockPendingNGOs });
      vi.mocked(adminAPI.verifyNGO).mockResolvedValue({ data: { message: 'Verified' } });

      render(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Approve')).toBeTruthy();
      });

      const approveButton = screen.getByText('Approve');
      fireEvent.click(approveButton);

      await waitFor(() => {
        expect(adminAPI.verifyNGO).toHaveBeenCalledWith('ngo-123');
        expect(toast.success).toHaveBeenCalledWith('NGO Verified Successfully');
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

      vi.mocked(adminAPI.getPendingNGOs).mockResolvedValue({ data: [] });
      vi.mocked(adminAPI.getAllUsers).mockResolvedValue({ data: mockUsers });

      render(<AdminDashboard />);

      const usersTab = screen.getByText('All Users');
      fireEvent.click(usersTab);

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

      vi.mocked(adminAPI.getPendingNGOs).mockResolvedValue({ data: [] });
      vi.mocked(adminAPI.getAllUsers).mockResolvedValue({ data: mockUsers });

      render(<AdminDashboard />);

      const usersTab = screen.getByText('All Users');
      fireEvent.click(usersTab);

      await waitFor(() => {
        expect(screen.getByText('Suspended')).toBeTruthy();
      });
    });

    it('should call toggleUserStatus API when Suspend button is clicked', async () => {
      const mockUsers = [
        {
          id: 'user-123',
          name: 'Active User',
          email: 'user@example.com',
          role: 'DONOR',
          isActive: true,
          createdAt: '2026-02-20T00:00:00.000Z',
        },
      ];

      vi.mocked(adminAPI.getPendingNGOs).mockResolvedValue({ data: [] });
      vi.mocked(adminAPI.getAllUsers).mockResolvedValue({ data: mockUsers });
      vi.mocked(adminAPI.toggleUserStatus).mockResolvedValue({
        data: { message: 'User suspended', isActive: false },
      });

      render(<AdminDashboard />);

      const usersTab = screen.getByText('All Users');
      fireEvent.click(usersTab);

      await waitFor(() => {
        expect(screen.getByText('Suspend')).toBeTruthy();
      });

      const suspendButton = screen.getByText('Suspend');
      fireEvent.click(suspendButton);

      await waitFor(() => {
        expect(adminAPI.toggleUserStatus).toHaveBeenCalledWith('user-123');
        expect(toast.success).toHaveBeenCalledWith('User suspended');
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

      vi.mocked(adminAPI.getPendingNGOs).mockResolvedValue({ data: [] });
      vi.mocked(adminAPI.getAllUsers).mockResolvedValue({ data: mockUsers });

      render(<AdminDashboard />);

      const usersTab = screen.getByText('All Users');
      fireEvent.click(usersTab);

      await waitFor(() => {
        expect(screen.getByText('System Admin')).toBeTruthy();
      });

      // Should not have Suspend or Restore button for admin
      expect(screen.queryByText('Suspend')).toBeNull();
      expect(screen.queryByText('Restore')).toBeNull();
    });
  });

  describe('Platform Donations Tab (User Story 3)', () => {
    it('should fetch and display all donations when switching to Donations tab', async () => {
      const mockDonations = [
        {
          id: '1',
          name: 'Rice',
          foodType: 'packaged',
          quantity: 50,
          unit: 'kg',
          status: 'AVAILABLE',
          donor: {
            email: 'donor@example.com',
          },
          createdAt: '2026-02-20T00:00:00.000Z',
        },
      ];

      vi.mocked(adminAPI.getPendingNGOs).mockResolvedValue({ data: [] });
      vi.mocked(adminAPI.getAllDonations).mockResolvedValue({ data: mockDonations });

      render(<AdminDashboard />);

      const donationsTab = screen.getByText('Platform Donations');
      fireEvent.click(donationsTab);

      await waitFor(() => {
        expect(adminAPI.getAllDonations).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByText('Rice')).toBeTruthy();
        expect(screen.getByText('50 kg')).toBeTruthy();
        expect(screen.getByText('donor@example.com')).toBeTruthy();
        expect(screen.getByText('AVAILABLE')).toBeTruthy();
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error toast when fetching pending NGOs fails', async () => {
      vi.mocked(adminAPI.getPendingNGOs).mockRejectedValue(new Error('Network error'));

      render(<AdminDashboard />);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to fetch admin data');
      });
    });

    it('should show error toast when verifying NGO fails', async () => {
      const mockPendingNGOs = [
        {
          id: 'ngo-123',
          name: 'Food Bank A',
          email: 'foodbank@example.com',
          createdAt: '2026-02-20T00:00:00.000Z',
        },
      ];

      vi.mocked(adminAPI.getPendingNGOs).mockResolvedValue({ data: mockPendingNGOs });
      vi.mocked(adminAPI.verifyNGO).mockRejectedValue(new Error('Verification failed'));

      render(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Approve')).toBeTruthy();
      });

      const approveButton = screen.getByText('Approve');
      fireEvent.click(approveButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to verify NGO');
      });
    });
  });
});
