import { render, screen } from '@testing-library/react';
import App from './App';

// PUBLIC_INTERFACE
test('renders Tic Tac Toe header', () => {
  render(<App />);
  expect(screen.getByText(/Tic Tac Toe/)).toBeInTheDocument();
});
