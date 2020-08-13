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