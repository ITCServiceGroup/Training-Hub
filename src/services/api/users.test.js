import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { invoke } = vi.hoisted(() => ({ invoke: vi.fn() }));

vi.mock('../../config/supabase', () => ({
  supabase: {
    functions: { invoke }
  }
}));

import { createUser } from './users';

describe('user provisioning contract', () => {
  beforeEach(() => {
    invoke.mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('provisions users through the authenticated Edge Function', async () => {
    invoke.mockResolvedValue({ data: { userId: 'user-1' }, error: null });
    const user = {
      email: 'learner@example.com',
      password: 'a-long-temporary-password',
      display_name: 'Learner One',
      role: 'technician',
      market_id: 2,
      reports_to_user_id: 'manager-1'
    };

    await expect(createUser(user)).resolves.toEqual({
      data: { userId: 'user-1' },
      error: null
    });
    expect(invoke).toHaveBeenCalledWith('admin-create-user', {
      body: {
        email: user.email,
        password: user.password,
        displayName: user.display_name,
        role: user.role,
        marketId: user.market_id,
        reportsToUserId: user.reports_to_user_id
      }
    });
  });

  it('returns a provisioning error without falling back to direct profile writes', async () => {
    const error = new Error('Function unavailable');
    invoke.mockResolvedValue({ data: null, error });

    await expect(createUser({})).resolves.toEqual({ data: null, error });
  });
});
