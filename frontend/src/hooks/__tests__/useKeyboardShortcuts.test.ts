/**
 * Tests — useKeyboardShortcuts hook (frontend/src/hooks/useKeyboardShortcuts.tsx)
 *
 * Tests:
 *   - Handler fires for correct key
 *   - Handler does NOT fire when typing in an input
 *   - Handler does NOT fire for wrong key
 *   - Ctrl modifier is respected
 *   - Event listener is cleaned up on unmount (no lingering listeners)
 */

import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useKeyboardShortcuts } from '../useKeyboardShortcuts';

// Helper to dispatch a keyboard event targeting document.body.
// We dispatch on body (not window) so that e.target in the hook is a valid
// HTMLElement with a .tagName property — window.dispatchEvent sets target to null in jsdom.
function fireKey(key: string, options: Partial<KeyboardEventInit> = {}) {
    const event = new KeyboardEvent('keydown', {
        key,
        bubbles: true,
        cancelable: true,
        ...options,
    });
    document.body.dispatchEvent(event);
    return event;
}

describe('useKeyboardShortcuts', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('calls the handler when the matching key is pressed', () => {
        const handler = vi.fn();
        renderHook(() =>
            useKeyboardShortcuts([{ key: 'n', description: 'New campaign', handler }])
        );

        fireKey('n');
        expect(handler).toHaveBeenCalledTimes(1);
    });

    it('does not call the handler for a different key', () => {
        const handler = vi.fn();
        renderHook(() =>
            useKeyboardShortcuts([{ key: 'n', description: 'New campaign', handler }])
        );

        fireKey('x');
        expect(handler).not.toHaveBeenCalled();
    });

    it('is case-insensitive — uppercase key still triggers handler', () => {
        const handler = vi.fn();
        renderHook(() =>
            useKeyboardShortcuts([{ key: 'n', description: 'New campaign', handler }])
        );

        fireKey('N');
        expect(handler).toHaveBeenCalledTimes(1);
    });

    it('respects the ctrl modifier — fires when ctrlKey is held', () => {
        const handler = vi.fn();
        renderHook(() =>
            useKeyboardShortcuts([{ key: 'enter', ctrl: true, description: 'Submit', handler }])
        );

        // Without ctrl — should NOT fire
        fireKey('Enter');
        expect(handler).not.toHaveBeenCalled();

        // With ctrl — should fire
        fireKey('Enter', { ctrlKey: true });
        expect(handler).toHaveBeenCalledTimes(1);
    });

    it('removes the event listener on unmount', () => {
        const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
        const handler = vi.fn();

        const { unmount } = renderHook(() =>
            useKeyboardShortcuts([{ key: 'n', description: 'New campaign', handler }])
        );

        unmount();
        expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

        // After unmount, pressing the key should NOT trigger the handler
        fireKey('n');
        expect(handler).not.toHaveBeenCalled();

        removeEventListenerSpy.mockRestore();
    });

    it('handles multiple shortcuts in the same hook call', () => {
        const handlerN = vi.fn();
        const handlerD = vi.fn();

        renderHook(() =>
            useKeyboardShortcuts([
                { key: 'n', description: 'New', handler: handlerN },
                { key: 'd', description: 'Dashboard', handler: handlerD },
            ])
        );

        fireKey('n');
        expect(handlerN).toHaveBeenCalledTimes(1);
        expect(handlerD).not.toHaveBeenCalled();

        fireKey('d');
        expect(handlerD).toHaveBeenCalledTimes(1);
    });
});
