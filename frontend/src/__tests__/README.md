# Frontend Unit Tests Documentation

This directory contains comprehensive unit tests for all frontend components of the Food Redistribution Platform.

## Test Coverage

### Pages
- **LandingPage.tsx** - Landing page with role introduction and feature showcase
- **Login.tsx** - User login form with authentication
- **Register.tsx** - User registration with role selection
- **App.tsx** - Main app routing component

### Layouts
- **DashboardLayout.tsx** - Main dashboard layout with sidebar navigation

### Dashboard Pages
- **DonorHome.tsx** - Donor dashboard with donation management
- **NGODashboard.tsx** - NGO dashboard with donation discovery
- **VolunteerDashboard.tsx** - Volunteer dashboard with task assignments
- **AddFood.tsx** - Food donation creation form
- **DiscoveryMap.tsx** - Interactive map for finding donations
- **History.tsx** - Donation history and statistics
- **Impact.tsx** - User impact metrics and badges
- **Profile.tsx** - User profile management
- **Notifications.tsx** - Notification center

## Test Files Structure

```
frontend/src/__tests__/
├── setup.ts
├── App.test.tsx
├── pages/
│   ├── LandingPage.test.tsx
│   ├── Login.test.tsx
│   ├── Register.test.tsx
│   └── dashboard/
│       ├── DonorHome.test.tsx
│       ├── NGODashboard.test.tsx
│       ├── VolunteerDashboard.test.tsx
│       ├── AddFood.test.tsx
│       ├── DiscoveryMap.test.tsx
│       ├── History.test.tsx
│       ├── Impact.test.tsx
│       ├── Profile.test.tsx
│       └── Notifications.test.tsx
└── layouts/
    └── DashboardLayout.test.tsx
```

## Test Framework Setup

### Requirements
```json
{
  "devDependencies": {
    "vitest": "latest",
    "@testing-library/react": "^14.0.0",
    "@testing-library/user-event": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@vitest/ui": "latest"
  }
}
```

### Installation
```bash
npm install --save-dev vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom @vitest/ui
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm test -- --watch
```

### Run tests with UI
```bash
npm test -- --ui
```

### Run specific test file
```bash
npm test -- LandingPage.test.tsx
```

### Run tests with coverage
```bash
npm test -- --coverage
```

### Run dashboard tests only
```bash
npm test -- pages/dashboard
```

## Test Coverage Summary

Each component test file includes:

### App & Pages Tests
- **Rendering** - Verify component renders without errors
- **Props/State** - Test props handling and state management
- **User Interactions** - Test form inputs, button clicks, navigation
- **API Calls** - Mock and verify API interactions
- **Error Handling** - Test error states and messages
- **Accessibility** - Verify proper accessibility features

### Specific Test Cases by Component

#### LandingPage
- Hero section rendering
- Navigation links
- Role cards display
- Feature descriptions
- Statistics display
- Responsive design

#### Login
- Form field rendering
- Email/password input handling
- Form submission
- Error message display
- Token storage in localStorage
- Loading state

#### Register
- Form field rendering
- Role selection
- Organization type dropdown
- Form submission
- Error handling
- Successful registration flow

#### DashboardLayout
- Sidebar rendering
- Navigation menu
- User role display
- Logout functionality
- Notifications loading
- Role-based route filtering

#### DonorHome
- Donation loading
- Statistics calculation
- Status badges
- Urgent donation alerts
- Time remaining calculation
- Donation detail modals

#### NGODashboard
- Available donations display
- Daily intake capacity
- Donation claiming
- Urgent alerts
- Status filtering

#### VolunteerDashboard
- Task list loading
- Pickup confirmation
- Delivery confirmation
- Location display
- Time remaining tracking

#### AddFood
- Food type selection
- Form field inputs
- Expiry time calculation
- Image upload
- Location selection
- Form submission

#### DiscoveryMap
- Map rendering
- Marker display
- Filter controls
- Donation claiming
- Status-based filtering

#### History
- Donation history loading
- Statistics display
- Status filtering
- Table rendering
- Empty state

#### Impact
- Impact statistics display
- Badge loading
- Earned badges display
- Progress tracking
- Role-specific views

#### Profile
- Profile data loading
- User information display
- Role badge
- Edit functionality
- Profile update handling

#### Notifications
- Notification loading
- Filter functionality
- Mark as read
- Time display
- Icon based on type

## Mock Patterns

### API Mocking
```typescript
vi.mock('../../services/api', () => ({
  getNotifications: vi.fn(),
  updateUserProfile: vi.fn(),
  // ... other functions
}))
```

### Router Mocking
```typescript
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/' }),
  Link: ({ to, children }: any) => <a href={to}>{children}</a>,
  // ... other exports
}))
```

### localStorage Mocking
```typescript
localStorage.setItem('user', JSON.stringify({
  id: '1',
  name: 'John Doe',
  role: 'donor'
}))
```

## Assertions Patterns

### Text Content Assertions
```typescript
expect(screen.getByText(/Search Text/i)).toBeTruthy()
```

### Form Input Assertions
```typescript
const input = screen.getByPlaceholderText(/placeholder/i) as HTMLInputElement
expect(input.value).toBe('expected value')
```

### API Call Assertions
```typescript
await waitFor(() => {
  expect(getDonations).toHaveBeenCalled()
})
```

### State Change Assertions
```typescript
await userEvent.click(button)
await waitFor(() => {
  expect(screen.getByText(/updated text/i)).toBeTruthy()
})
```

## Best Practices Implemented

1. **Setup and Teardown** - Each test has beforeEach to clear mocks and localStorage
2. **Async Handling** - Using waitFor for async operations
3. **User Events** - Using userEvent for realistic user interactions
4. **Mocking** - All external dependencies (API, Router) are mocked
5. **Descriptive Names** - Test names clearly describe what is being tested
6. **Isolated Tests** - Each test is independent and doesn't affect others
7. **Coverage** - Tests cover happy path, error cases, and edge cases

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run Tests
  run: npm test -- --run

- name: Generate Coverage
  run: npm test -- --coverage
```

### Expected Coverage Targets
- Statements: > 70%
- Branches: > 65%
- Functions: > 70%
- Lines: > 70%

## Troubleshooting

### Common Issues

**Tests timeout**
- Increase timeout: `vi.setConfig({ testTimeout: 10000 })`

**Mock not working**
- Ensure mock is before component import
- Clear mocks in beforeEach

**localStorage undefined**
- Check setup.ts is properly configured

**Component doesn't re-render**
- Use waitFor for state updates
- Verify vi.mocked is working correctly

## Contributing

When adding new components:

1. Create corresponding test file in __tests__ directory
2. Follow same structure as existing tests
3. Mock all external dependencies
4. Write tests for main functionality
5. Test error scenarios
6. Maintain > 70% coverage

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
