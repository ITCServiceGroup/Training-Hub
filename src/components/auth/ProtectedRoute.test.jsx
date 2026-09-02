import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
  auth: { isAuthenticated: false, loading: false },
  rbac: { profile: null, loading: false, hasRole: vi.fn(() => false) }
}));

vi.mock('../../contexts/AuthContext', () => ({ useAuth: () => state.auth }));
vi.mock('../../contexts/RBACContext', () => ({ useRBAC: () => state.rbac }));

import ProtectedRoute from './ProtectedRoute';

const renderRoute = () => render(
  <MemoryRouter initialEntries={['/admin']}>
    <Routes>
      <Route path="/login" element={<h1>Login</h1>} />
      <Route path="/unauthorized" element={<h1>Unauthorized</h1>} />
      <Route path="/account-inactive" element={<h1>Inactive</h1>} />
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin" element={<h1>Admin workspace</h1>} />
      </Route>
    </Routes>
  </MemoryRouter>
);

describe('ProtectedRoute', () => {
  beforeEach(() => {
    state.auth = { isAuthenticated: false, loading: false };
    state.rbac = { profile: null, loading: false, hasRole: vi.fn(() => false) };
  });

  it('redirects signed-out users to login', () => {
    renderRoute();
    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
  });

  it('fails closed when an authenticated user has no profile', () => {
    state.auth.isAuthenticated = true;
    renderRoute();
    expect(screen.getByRole('heading', { name: 'Unauthorized' })).toBeInTheDocument();
  });

  it('separates inactive and role-denied states', () => {
    state.auth.isAuthenticated = true;
    state.rbac.profile = { is_active: false, role: 'admin' };
    renderRoute();
    expect(screen.getByRole('heading', { name: 'Inactive' })).toBeInTheDocument();
  });

  it('shows a deterministic loading state while authorization resolves', () => {
    state.auth.loading = true;
    renderRoute();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('denies an active user whose role is outside the route policy', () => {
    state.auth.isAuthenticated = true;
    state.rbac.profile = { is_active: true, role: 'technician' };
    renderRoute();
    expect(screen.getByRole('heading', { name: 'Unauthorized' })).toBeInTheDocument();
  });

  it('renders the protected outlet only for an active allowed role', () => {
    state.auth.isAuthenticated = true;
    state.rbac.profile = { is_active: true, role: 'admin' };
    state.rbac.hasRole = vi.fn(() => true);
    renderRoute();
    expect(screen.getByRole('heading', { name: 'Admin workspace' })).toBeInTheDocument();
  });
});
