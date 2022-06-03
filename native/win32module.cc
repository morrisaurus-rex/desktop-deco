/*
    Native library to replicate some aspects of BrowserWindow({type: 'desktop'}) for win32 platforms.
    Note: Desktop Gadgets was deprecated in favour of live tiles for Windows 7+ so the implementation will be a bit hacky
*/

#include <napi.h>

#if defined (_WIN32) || defined (_MSC_VER) || defined (__MINGW32__)
#include <windows.h>
#include "win32lib.hh"
#define PLATFORM_API
#endif

HWND* GetWindowHandle(const Napi::Value& napiVal) {
    void* handleData = napiVal.As<Napi::Buffer<void*>>().Data();
    return reinterpret_cast<HWND*>(handleData);
}

Napi::Boolean SetWindowBottom_Wrapper(Napi::CallbackInfo& info) {
    Napi::Env jsEnv = info.Env();
    // Check for erroneus JS call
    if (info.Length() > 1) {
        Napi::Error::New(jsEnv, "Too many arguments").ThrowAsJavaScriptException();
        return Napi::Boolean::New(jsEnv, false);
    }
    if (!info[0].IsBuffer()) {
        Napi::Error::New(jsEnv, "Argument is not a Buffer").ThrowAsJavaScriptException();
        return Napi::Boolean::New(jsEnv, false);
    }

    char* handleData = info[0].As<Napi::Buffer<char>>().Data();
    HWND* windowHandle = reinterpret_cast<HWND*>(handleData);

    BOOL outcome = SetBottomWindow(*windowHandle);
    return Napi::Boolean::New(jsEnv, outcome);
}

Napi::Boolean IgnoreShowDesktop_Wrapper(Napi::CallbackInfo& info) {
    Napi::Env jsEnv = info.Env();
    // Check for erroneous JS call
        if (info.Length() > 1) {
        Napi::Error::New(jsEnv, "Too many arguments").ThrowAsJavaScriptException();
        return Napi::Boolean::New(jsEnv, false);
    }
    if (!info[0].IsBuffer()) {
        Napi::Error::New(jsEnv, "Argument is not a Buffer").ThrowAsJavaScriptException();
        return Napi::Boolean::New(jsEnv, false);
    }
    HWND* windowHandle = GetWindowHandle(info[0]);
    BOOL outcome = IgnoreShowDesktop(*windowHandle);
    return Napi::Boolean::New(jsEnv, outcome);
}
// Toggles window interaction on or off, must pass the window handle as first argument and an optional bool as the second
Napi::Boolean ToggleWindowInteraction_Wrapper(Napi::CallbackInfo& info) {
    Napi::Env jsEnv = info.Env();
    unsigned numArgs = info.Length();
    // Check for arguments, we MUST recieve the native window handle from the JS call
    if (numArgs > 2 || numArgs == 0) {
        Napi::Error::New(jsEnv, "Wrong number of arguments").ThrowAsJavaScriptException();
        return Napi::Boolean::New(jsEnv, false);
    }
    // Note that the EnableWindow function returns true IF the window was previously disabled
    BOOL operationResult;
    if (info[0].IsBuffer()) {
        HWND* windowHandle = GetWindowHandle(info[0]);
        if (numArgs > 1 && info[1].IsBoolean()) {
            bool onOff = info[1].As<Napi::Boolean>().Value();
            operationResult = ToggleWindowInteraction(*windowHandle, onOff);
        } else {
            operationResult = ToggleWindowInteraction(*windowHandle);
        }
        
    } else {
        Napi::Error::New(jsEnv, "Handle to native window must be first argument").ThrowAsJavaScriptException();
        return Napi::Boolean::New(jsEnv, false);
    }
    return Napi::Boolean::New(jsEnv, operationResult != FALSE);
}
// Toggles window frame on or off, must pass window handle as first arguement and an optional bool as second
Napi::Boolean ToggleWindowFrame_Wrapper(Napi::CallbackInfo& info) {
    Napi::Env jsEnv = info.Env();
    unsigned numArgs = info.Length();
    if (numArgs > 2 || numArgs == 0) {
        Napi::Error::New(jsEnv, "Wrong number of arguments").ThrowAsJavaScriptException();
        return Napi::Boolean::New(jsEnv, false);
    }

    BOOL operationResult;
    if (info[0].IsBuffer()) {
        HWND* windowHandle = GetWindowHandle(info[0]);
        if (numArgs > 1 && info[1].IsBoolean()) {
            bool onOff = info[1].As<Napi::Boolean>().Value();
            operationResult = ToggleWindowFrame(*windowHandle, onOff);
        } else {
            operationResult = ToggleWindowFrame(*windowHandle);
        }
    } else {
        Napi::Error::New(jsEnv, "Handle to native window must be first argument").ThrowAsJavaScriptException();
        return Napi::Boolean::New(jsEnv, false);
    }
    return Napi::Boolean::New(jsEnv, operationResult != FALSE);
}

Napi::Object Init(Napi::Env jsEnv, Napi::Object exports) {
    exports.Set(
        Napi::String::New(jsEnv, "setBottomMost"),
        Napi::Function::New(jsEnv, SetWindowBottom_Wrapper)
    );
    exports.Set(
        Napi::String::New(jsEnv, "ignoreShowDesktop"),
        Napi::Function::New(jsEnv, IgnoreShowDesktop_Wrapper)
    );
    exports.Set(
        Napi::String::New(jsEnv, "toggleWindowInteraction"),
        Napi::Function::New(jsEnv, ToggleWindowInteraction_Wrapper)
    );
    exports.Set(
        Napi::String::New(jsEnv, "toggleWindowFrame"),
        Napi::Function::New(jsEnv, ToggleWindowFrame_Wrapper)
    );
    return exports;
}

NODE_API_MODULE(win32lib, Init);