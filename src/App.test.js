import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import Navbar from './Components/Navbar/Navbar';

beforeEach(() => {
  localStorage.clear();
  window.history.pushState({}, '', '/admin/settings');
});

test('renders admin settings page for admin users', () => {
  localStorage.setItem(
    'user',
    JSON.stringify({ role: 'admin', name: 'Admin User' })
  );

  window.history.pushState({}, '', '/admin/settings');
  render(<App />);

  expect(screen.getByRole('heading', { name: /general settings/i })).toBeInTheDocument();
  expect(screen.getByText(/store profile/i)).toBeInTheDocument();
});

test('renders admin profile page for admin users', () => {
  localStorage.setItem(
    'user',
    JSON.stringify({ id: 1, role: 'admin', name: 'Admin User', email: 'admin@test.com' })
  );

  window.history.pushState({}, '', '/admin/profile');
  render(<App />);

  expect(screen.getByRole('heading', { name: /admin profile/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /edit admin/i })).toBeInTheDocument();
});

test('opens delivery address popup with saved default address', () => {
  localStorage.setItem(
    'user',
    JSON.stringify({
      name: 'Test User',
      address: '12 Temple Street',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '607004'
    })
  );

  render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>
  );

  const locationTriggers = screen.getAllByText(/deliver to chennai/i);
  fireEvent.click(locationTriggers[0]);

  expect(screen.getByText(/current delivery address/i)).toBeInTheDocument();
  expect(screen.getByDisplayValue('12 Temple Street')).toBeInTheDocument();
  expect(screen.getByDisplayValue('607004')).toBeInTheDocument();
});

test('fills city and state when a delivery pincode is entered', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    json: async () => [{
      Status: 'Success',
      PostOffice: [{ District: 'Chennai', State: 'Tamil Nadu' }]
    }]
  });

  localStorage.setItem('user', JSON.stringify({ name: 'Test User' }));

  render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>
  );

  fireEvent.click(screen.getAllByText(/select location/i)[0]);
  fireEvent.change(screen.getByPlaceholderText(/enter new pincode/i), {
    target: { name: 'pincode', value: '600001' }
  });

  expect(await screen.findByDisplayValue('Chennai')).toBeInTheDocument();
  expect(screen.getByDisplayValue('Tamil Nadu')).toBeInTheDocument();
  expect(global.fetch).toHaveBeenCalledWith(
    'https://api.postalpincode.in/pincode/600001'
  );
});

test('syncs a saved delivery address with the backend', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      user: { id: 7, address: '12 Temple Street', city: 'Chennai', state: 'Tamil Nadu', pincode: '600001' }
    })
  });

  localStorage.setItem('user', JSON.stringify({ id: 7, name: 'Test User' }));

  render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>
  );

  fireEvent.click(screen.getAllByText(/select location/i)[0]);
  fireEvent.change(screen.getByPlaceholderText(/house \/ flat \/ street/i), {
    target: { name: 'address', value: '12 Temple Street' }
  });
  fireEvent.click(screen.getByRole('button', { name: /save address/i }));

  expect((await screen.findAllByText(/deliver to chennai/i)).length).toBeGreaterThan(0);
  expect(global.fetch).toHaveBeenCalledWith(
    expect.stringContaining('/api/auth/profile/7'),
    expect.objectContaining({ method: 'PUT', body: expect.any(FormData) })
  );
  expect(JSON.parse(localStorage.getItem('user')).city).toBe('Chennai');
});
