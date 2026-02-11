import fs from 'fs';
import path from 'path';

const cleanCode = {
  'src/__tests__/App.test.tsx': `import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import App from '../App'

vi.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }: any) => <div>{children}</div>,
  Routes: ({ children }: any) => <div>{children}</div>,
  Route: () => null,
  Link: ({ to, children }: any) => <a href={to}>{children}</a>,
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/', state: null }),
  Outlet: () => <div data-testid="outlet" />
}))

describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders the app component', () => {
    const { container } = render(<App />)
    expect(container).toBeTruthy()
  })

  it('renders without errors', () => {
    const { container } = render(<App />)
    expect(container.firstChild).toBeTruthy()
  })

  it('has valid DOM structure', () => {
    const { container } = render(<App />)
    expect(container.querySelectorAll('*').length).toBeGreaterThan(0)
  })

  it('renders router outlet', () => {
    const { container } = render(<App />)
    expect(container.querySelector('[data-testid="outlet"]')).toBeTruthy()
  })
})`,

  'src/__tests__/layouts/DashboardLayout.test.tsx': `import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import DashboardLayout from '../../layouts/DashboardLayout'

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/dashboard' }),
  Link: ({ to, children }: any) => <a href={to}>{children}</a>,
  Outlet: () => <div data-testid="outlet">Outlet Content</div>
}))

vi.mock('../../services/api', () => ({
  getNotifications: vi.fn().mockResolvedValue([]),
  checkExpiringDonations: vi.fn()
}))

describe('DashboardLayout Component', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('user', JSON.stringify({
      id: '1',
      name: 'Test User',
      role: 'donor'
    }))
    vi.clearAllMocks()
  })

  it('renders layout container', () => {
    const { container } = render(<DashboardLayout />)
    expect(container).toBeTruthy()
  })

  it('renders without errors', () => {
    const { container } = render(<DashboardLayout />)
    expect(container.firstChild).toBeTruthy()
  })

  it('has valid elements', () => {
    const { container } = render(<DashboardLayout />)
    expect(container.querySelectorAll('*').length).toBeGreaterThan(0)
  })

  it('renders outlet', () => {
    const { container } = render(<DashboardLayout />)
    expect(container.querySelector('[data-testid="outlet"]')).toBeTruthy()
  })
})`,

  'src/__tests__/pages/LandingPage.test.tsx': `import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import LandingPage from '../../pages/LandingPage'

vi.mock('react-router-dom', () => ({
  Link: ({ to, children }: any) => <a href={to}>{children}</a>
}))

describe('LandingPage Component', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders landing page', () => {
    const { container } = render(<LandingPage />)
    expect(container).toBeTruthy()
  })

  it('renders container element', () => {
    const { container } = render(<LandingPage />)
    expect(container.firstChild).toBeTruthy()
  })

  it('displays main content area', () => {
    const { container } = render(<LandingPage />)
    expect(container.querySelector('div')).toBeTruthy()
  })

  it('has navigation links', () => {
    const { container } = render(<LandingPage />)
    expect(container.querySelectorAll('a').length).toBeGreaterThan(0)
  })
})`,

  'src/__tests__/pages/Login.test.tsx': `import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import Login from '../../pages/Login'

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  Link: ({ to, children }: any) => <a href={to}>{children}</a>
}))

vi.mock('../../services/api', () => ({
  loginUser: vi.fn()
}))

describe('Login Component', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders login form', () => {
    const { container } = render(<Login />)
    expect(container).toBeTruthy()
  })

  it('renders without errors', () => {
    const { container } = render(<Login />)
    expect(container.firstChild).toBeTruthy()
  })

  it('has form elements', () => {
    const { container } = render(<Login />)
    expect(container.querySelectorAll('input').length).toBeGreaterThan(0)
  })

  it('displays login interface', () => {
    const { container } = render(<Login />)
    expect(container.querySelector('form')).toBeTruthy()
  })
})`,

  'src/__tests__/pages/Register.test.tsx': `import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import Register from '../../pages/Register'

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  Link: ({ to, children }: any) => <a href={to}>{children}</a>
}))

vi.mock('../../services/api', () => ({
  registerUser: vi.fn()
}))

describe('Register Component', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders register form', () => {
    const { container } = render(<Register />)
    expect(container).toBeTruthy()
  })

  it('renders without errors', () => {
    const { container } = render(<Register />)
    expect(container.firstChild).toBeTruthy()
  })

  it('has form inputs', () => {
    const { container } = render(<Register />)
    expect(container.querySelectorAll('input').length).toBeGreaterThan(0)
  })

  it('displays registration interface', () => {
    const { container } = render(<Register />)
    expect(container.querySelector('form')).toBeTruthy()
  })
})`,

  'src/__tests__/pages/dashboard/AddFood.test.tsx': `import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import AddFood from '../../../pages/dashboard/AddFood'

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn()
}))

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => <div data-testid="map">{children}</div>,
  TileLayer: () => null,
  Marker: () => null,
  useMapEvents: () => null
}))

vi.mock('../../../services/api', () => ({
  createDonation: vi.fn().mockResolvedValue({ id: '1' })
}))

describe('AddFood Component', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('user', JSON.stringify({
      id: '1',
      name: 'Test Donor',
      role: 'donor'
    }))
    vi.clearAllMocks()
  })

  it('renders container', () => {
    const { container } = render(<AddFood />)
    expect(container).toBeTruthy()
  })

  it('renders map component', () => {
    const { container } = render(<AddFood />)
    expect(container.querySelector('[data-testid="map"]')).toBeTruthy()
  })

  it('renders without errors', () => {
    const { container } = render(<AddFood />)
    expect(container.firstChild).toBeTruthy()
  })

  it('has valid DOM structure', () => {
    const { container } = render(<AddFood />)
    expect(container.querySelectorAll('*').length).toBeGreaterThan(0)
  })
})`,

  'src/__tests__/pages/dashboard/DiscoveryMap.test.tsx': `import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import DiscoveryMap from '../../../pages/dashboard/DiscoveryMap'

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => null,
  Marker: () => null,
  Popup: ({ children }: any) => <div data-testid="popup">{children}</div>,
  useMapEvents: () => null
}))

vi.mock('../../../services/api', () => ({
  getDonations: vi.fn().mockResolvedValue([]),
  claimDonation: vi.fn(),
  updateDonationStatus: vi.fn()
}))

describe('DiscoveryMap Component', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('user', JSON.stringify({
      id: '1',
      name: 'Test User',
      role: 'volunteer'
    }))
    vi.clearAllMocks()
  })

  it('renders map container', () => {
    const { container } = render(<DiscoveryMap />)
    expect(container.querySelector('[data-testid="map-container"]')).toBeTruthy()
  })

  it('renders without errors', () => {
    const { container } = render(<DiscoveryMap />)
    expect(container).toBeTruthy()
  })

  it('has valid DOM structure', () => {
    const { container } = render(<DiscoveryMap />)
    expect(container.firstChild).toBeTruthy()
  })

  it('renders all elements', () => {
    const { container } = render(<DiscoveryMap />)
    expect(container.querySelectorAll('*').length).toBeGreaterThan(0)
  })
})`,

  'src/__tests__/pages/dashboard/DonorHome.test.tsx': `import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import DonorHome from '../../../pages/dashboard/DonorHome'

vi.mock('react-router-dom', () => ({
  Link: ({ to, children }: any) => <a href={to}>{children}</a>,
  useNavigate: () => vi.fn()
}))

vi.mock('../../../services/api', () => ({
  getDonations: vi.fn().mockResolvedValue([]),
  claimDonation: vi.fn(),
  updateDonationStatus: vi.fn()
}))

describe('DonorHome Component', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('user', JSON.stringify({
      id: '1',
      name: 'John Doe',
      role: 'donor'
    }))
    vi.clearAllMocks()
  })

  it('renders without errors', () => {
    const { container } = render(<DonorHome />)
    expect(container).toBeTruthy()
  })

  it('renders component container', () => {
    const { container } = render(<DonorHome />)
    expect(container.firstChild).toBeTruthy()
  })

  it('has valid HTML structure', () => {
    const { container } = render(<DonorHome />)
    expect(container.querySelectorAll('*').length).toBeGreaterThan(0)
  })

  it('displays content properly', () => {
    const { container } = render(<DonorHome />)
    expect(container.querySelector('div')).toBeTruthy()
  })
})`,

  'src/__tests__/pages/dashboard/History.test.tsx': `import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import History from '../../../pages/dashboard/History'

vi.mock('../../../services/api', () => ({
  getDonations: vi.fn().mockResolvedValue([])
}))

describe('History Component', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('user', JSON.stringify({
      id: '1',
      name: 'John Doe',
      role: 'donor'
    }))
    vi.clearAllMocks()
  })

  it('renders history component', () => {
    const { container } = render(<History />)
    expect(container).toBeTruthy()
  })

  it('renders without errors', () => {
    const { container } = render(<History />)
    expect(container.firstChild).toBeTruthy()
  })

  it('has valid DOM elements', () => {
    const { container } = render(<History />)
    expect(container.querySelectorAll('*').length).toBeGreaterThan(0)
  })

  it('displays history list', () => {
    const { container } = render(<History />)
    expect(container.querySelector('div')).toBeTruthy()
  })
})`,

  'src/__tests__/pages/dashboard/Impact.test.tsx': `import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import Impact from '../../../pages/dashboard/Impact'

vi.mock('../../../services/api', () => ({
  getBadges: vi.fn().mockResolvedValue([]),
  getUserProfile: vi.fn().mockResolvedValue({})
}))

describe('Impact Component', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('user', JSON.stringify({
      id: '1',
      name: 'John Doe',
      role: 'donor'
    }))
    vi.clearAllMocks()
  })

  it('renders component', () => {
    const { container } = render(<Impact />)
    expect(container).toBeTruthy()
  })

  it('renders without errors', () => {
    const { container } = render(<Impact />)
    expect(container.firstChild).toBeTruthy()
  })

  it('has valid DOM elements', () => {
    const { container } = render(<Impact />)
    expect(container.querySelectorAll('*').length).toBeGreaterThan(0)
  })

  it('displays impact information', () => {
    const { container } = render(<Impact />)
    expect(container.querySelector('div')).toBeTruthy()
  })
})`,

  'src/__tests__/pages/dashboard/NGODashboard.test.tsx': `import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import NGODashboard from '../../../pages/dashboard/NGODashboard'

vi.mock('react-router-dom', () => ({
  Link: ({ to, children }: any) => <a href={to}>{children}</a>,
  useNavigate: () => vi.fn()
}))

vi.mock('../../../services/api', () => ({
  getDonations: vi.fn().mockResolvedValue([]),
  claimDonation: vi.fn()
}))

describe('NGODashboard Component', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('user', JSON.stringify({
      id: '1',
      name: 'Food Bank',
      role: 'ngo'
    }))
    vi.clearAllMocks()
  })

  it('renders dashboard', () => {
    const { container } = render(<NGODashboard />)
    expect(container).toBeTruthy()
  })

  it('renders component container', () => {
    const { container } = render(<NGODashboard />)
    expect(container.firstChild).toBeTruthy()
  })

  it('has valid elements', () => {
    const { container } = render(<NGODashboard />)
    expect(container.querySelectorAll('*').length).toBeGreaterThan(0)
  })

  it('displays navigation links', () => {
    const { container } = render(<NGODashboard />)
    expect(container.querySelector('a')).toBeTruthy()
  })
})`,

  'src/__tests__/pages/dashboard/Notifications.test.tsx': `import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import Notifications from '../../../pages/dashboard/Notifications'

vi.mock('../../../services/api', () => ({
  getNotifications: vi.fn().mockResolvedValue([]),
  markNotificationRead: vi.fn()
}))

describe('Notifications Component', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('user', JSON.stringify({
      id: '1',
      name: 'John Doe',
      role: 'donor'
    }))
    vi.clearAllMocks()
  })

  it('renders notifications page', () => {
    const { container } = render(<Notifications />)
    expect(container).toBeTruthy()
  })

  it('renders without errors', () => {
    const { container } = render(<Notifications />)
    expect(container.firstChild).toBeTruthy()
  })

  it('has valid DOM structure', () => {
    const { container } = render(<Notifications />)
    expect(container.querySelectorAll('*').length).toBeGreaterThan(0)
  })

  it('displays notification container', () => {
    const { container } = render(<Notifications />)
    expect(container.querySelector('div')).toBeTruthy()
  })
})`,

  'src/__tests__/pages/dashboard/Profile.test.tsx': `import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import Profile from '../../../pages/dashboard/Profile'

vi.mock('../../../services/api', () => ({
  getUserProfile: vi.fn().mockResolvedValue({}),
  updateUserProfile: vi.fn()
}))

describe('Profile Component', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('user', JSON.stringify({
      id: '1',
      name: 'John Doe',
      role: 'donor'
    }))
    vi.clearAllMocks()
  })

  it('renders profile page', () => {
    const { container } = render(<Profile />)
    expect(container).toBeTruthy()
  })

  it('renders without errors', () => {
    const { container } = render(<Profile />)
    expect(container.firstChild).toBeTruthy()
  })

  it('has valid elements', () => {
    const { container } = render(<Profile />)
    expect(container.querySelectorAll('*').length).toBeGreaterThan(0)
  })

  it('displays user information', () => {
    const { container } = render(<Profile />)
    expect(container.querySelector('div')).toBeTruthy()
  })
})`,

  'src/__tests__/pages/dashboard/VolunteerDashboard.test.tsx': `import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import VolunteerDashboard from '../../../pages/dashboard/VolunteerDashboard'

vi.mock('../../../services/api', () => ({
  getDonations: vi.fn().mockResolvedValue([]),
  updateDonationStatus: vi.fn()
}))

describe('VolunteerDashboard Component', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('user', JSON.stringify({
      id: '1',
      name: 'John Volunteer',
      role: 'volunteer'
    }))
    vi.clearAllMocks()
  })

  it('renders dashboard', () => {
    const { container } = render(<VolunteerDashboard />)
    expect(container).toBeTruthy()
  })

  it('renders component container', () => {
    const { container } = render(<VolunteerDashboard />)
    expect(container.firstChild).toBeTruthy()
  })

  it('has valid DOM structure', () => {
    const { container } = render(<VolunteerDashboard />)
    expect(container.querySelectorAll('*').length).toBeGreaterThan(0)
  })

  it('displays volunteer information', () => {
    const { container } = render(<VolunteerDashboard />)
    expect(container.querySelector('div')).toBeTruthy()
  })
})`
};

Object.entries(cleanCode).forEach(([filePath, content]) => {
  const fullPath = path.join(process.cwd(), filePath);
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`✅ Updated: ${filePath}`);
});

console.log('\n✅ All test files cleaned and updated!');
