/**
 * Tests — ErrorBoundary component (frontend/src/components/ErrorBoundary.tsx)
 *
 * Tests:
 *   - Renders children normally when no error
 *   - Shows fallback UI when a child throws
 *   - Displays the error message in the fallback
 */

import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ErrorBoundary } from '../ErrorBoundary';

// Suppress console.error for expected error boundary catches
const originalConsoleError = console.error;
beforeEach(() => {
    console.error = vi.fn();
});
afterEach(() => {
    console.error = originalConsoleError;
});

// Helper component that throws on render
function BrokenComponent({ message }: { message: string }): React.ReactElement {
    throw new Error(message);
}

// Helper component that renders normally
function GoodComponent() {
    return <div data-testid="good-child">Healthy content</div>;
}

describe('ErrorBoundary', () => {
    it('renders children when there is no error', () => {
        render(
            <ErrorBoundary>
                <GoodComponent />
            </ErrorBoundary>
        );

        expect(screen.getByTestId('good-child')).toBeInTheDocument();
        expect(screen.getByText('Healthy content')).toBeInTheDocument();
    });

    it('renders fallback UI when a child throws', () => {
        render(
            <ErrorBoundary>
                <BrokenComponent message="Test error occurred" />
            </ErrorBoundary>
        );

        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('displays the specific error message in the fallback', () => {
        const errorMessage = 'My specific test error';

        render(
            <ErrorBoundary>
                <BrokenComponent message={errorMessage} />
            </ErrorBoundary>
        );

        expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('shows a reload button in the fallback UI', () => {
        render(
            <ErrorBoundary>
                <BrokenComponent message="error" />
            </ErrorBoundary>
        );

        expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument();
    });

    it('shows a go back button in the fallback UI', () => {
        render(
            <ErrorBoundary>
                <BrokenComponent message="error" />
            </ErrorBoundary>
        );

        expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
    });

    it('does not render children when an error has been caught', () => {
        render(
            <ErrorBoundary>
                <BrokenComponent message="error" />
                <GoodComponent />
            </ErrorBoundary>
        );

        // Fallback is shown — good child should NOT be in DOM
        expect(screen.queryByTestId('good-child')).not.toBeInTheDocument();
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
});
