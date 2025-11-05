import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Arbeitszeiterfassung heading', () => {
  render(<App />);
  // Find the main heading (h1) that contains "Arbeitszeiterfassung"
  const headingElement = screen.getByRole('heading', { name: /Arbeitszeiterfassung.*Timetracker/i });
  expect(headingElement).toBeInTheDocument();
});
