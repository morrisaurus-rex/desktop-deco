#ifndef UNICODE
#define UNICODE
#endif

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
    HWND hNext = FindWindowEx(wHandle, NULL, L"SHELLDLL_DefView", NULL);
    if (hNext) {
        if (GetNextWindow(hNext, GW_HWNDNEXT) || GetNextWindow(hNext, GW_HWNDPREV))
            return TRUE;
        SetWindowLongPtr((HWND)lParam, -8, (LONG_PTR)hNext);
        return FALSE;
    }
    return TRUE;
}

BOOL IgnoreShowDesktop(HWND handle) {
    BOOL outcome = EnumWindows(&FindShell, (LPARAM)handle); // Returns FALSE if SHELLDLL_DefView is found
    return !outcome;
}