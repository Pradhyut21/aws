/**
 * Vitest global setup — imported before each test file.
 * Extends Vitest's expect() with @testing-library/jest-dom matchers
 * such as toBeInTheDocument(), toHaveClass(), toBeVisible() etc.
 */
import '@testing-library/jest-dom';
