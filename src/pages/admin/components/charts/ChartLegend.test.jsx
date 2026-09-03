import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ChartLegend from './ChartLegend';

describe('ChartLegend', () => {
  it('renders a contained, named legend with full labels available as titles', () => {
    render(
      <ChartLegend
        items={[
          { id: 'austin', label: 'Austin' },
          {
            id: 'long-market',
            label: 'Long market…',
            fullName: 'Long market name',
          },
        ]}
        colors={['#3b82f6', '#10b981']}
        ariaLabel="Market results legend"
      />,
    );

    const legend = screen.getByRole('list', {
      name: 'Market results legend',
    });
    expect(legend).toBeInTheDocument();
    expect(screen.getByText('Austin').closest('li')).toHaveAttribute(
      'title',
      'Austin',
    );
    expect(screen.getByText('Long market…').closest('li')).toHaveAttribute(
      'title',
      'Long market name',
    );
  });
});
