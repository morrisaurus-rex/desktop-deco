#include "win32lib.hh"

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

BOOL IgnoreShowDesktop(HWND handle) {
    // Might only work on windows 10
    HWND hWorkerW = NULL;
    HWND nextWindow = NULL;
    do {
        hWorkerW = FindWindowExA(NULL, hWorkerW, "WorkerW", NULL);
        nextWindow = FindWindowExA(hWorkerW, NULL, "SHELLDLL_DefView", NULL);
    } while (nextWindow == NULL && hWorkerW != NULL);

    if (nextWindow) {
        SetWindowLongPtr(handle, -8, (LONG_PTR)nextWindow);
        return TRUE;
    }
    return FALSE;

}