

#include "win32lib.hh"
// Helpers
// EnumProc for IgnoreShowDesktop
BOOL FindShell(HWND wHandle, LPARAM lParam);

BOOL SetBottomWindow(HWND handle) {
    return SetWindowPos(
        handle,
        HWND_BOTTOM,
        0,
        0,
        0,
        0,
        SWP_NOACTIVATE | SWP_NOMOVE | SWP_NOSIZE
    );
}

BOOL FindShell(HWND wHandle, LPARAM lParam) {
    HWND hNext = FindWindowExW(wHandle, NULL, L"SHELLDLL_DefView", NULL);
    if (hNext) {
        if (GetNextWindow(hNext, GW_HWNDNEXT) || GetNextWindow(hNext, GW_HWNDPREV))
            return TRUE;
        SetWindowLongPtr((HWND)lParam, -8, (LONG_PTR)hNext);
        return FALSE;
    }
    return TRUE;
}

/**
 * Forces the window to ignore being moved by the 'show desktop' command (Windows + D).
 * @param handle Handle to the window.
 */ 
BOOL IgnoreShowDesktop(HWND handle) {
    BOOL outcome = EnumWindows(&FindShell, (LPARAM)handle); // Returns FALSE if SHELLDLL_DefView is found
    return !outcome;
}

/**
 * Pass true to allow the window to recieve keyboard and mouse events, false to disable. Returns true if window state was changed.
 * @param handle Handle to the window.
 * @param onOff True to enable window interactivity, false to disable.
 */
BOOL ToggleWindowInteraction(HWND handle, bool onOff) {
    BOOL windowPreviousState = IsWindowEnabled(handle);
    if (static_cast<bool>(windowPreviousState) == onOff) {
        return false;
    }
    BOOL opResult = EnableWindow(handle, static_cast<BOOL>(onOff));
    windowPreviousState = IsWindowEnabled(handle);
    return ~(static_cast<BOOL>(onOff) ^ windowPreviousState);
}
/**
 * Toggles the given window's ability to recieve keyboard and mouse events.
 * @param handle Handle to the window.
 */ 
BOOL ToggleWindowInteraction(HWND handle) {
    BOOL windowPreviousState = IsWindowEnabled(handle);
    BOOL opResult = ToggleWindowInteraction(handle, static_cast<bool>(windowPreviousState));
    return opResult;
}

BOOL ToggleWindowFrame(HWND handle, bool onOff) {
    constexpr LONG_PTR options = (WS_CAPTION | WS_THICKFRAME | WS_MAXIMIZEBOX | WS_MINIMIZEBOX | WS_SYSMENU);
    LONG_PTR currentStyle = GetWindowLongPtr(handle, GWL_STYLE);
    LONG_PTR result;
    if (onOff) {
        result = SetWindowLongPtr(handle, GWL_STYLE, currentStyle | options);
    } else {
        result = SetWindowLongPtr(handle, GWL_STYLE, currentStyle & (~options));
    }
    if (result) SetWindowPos(handle, NULL, 0, 0, 0, 0, SWP_NOSIZE | SWP_NOMOVE | SWP_FRAMECHANGED | SWP_NOOWNERZORDER | SWP_NOACTIVATE);
    return static_cast<BOOL>(result != 0);
}

BOOL ToggleWindowFrame(HWND handle) {
    LONG_PTR currentStyle = GetWindowLongPtr(handle, GWL_STYLE);
    // Border and title bar are visible
    if (currentStyle & WS_CAPTION) {
        return ToggleWindowFrame(handle, false);
    } else {
        return ToggleWindowFrame(handle, true);
    }
}