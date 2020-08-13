#include <napi.h>
#include <windows.h>
#include "win32lib.hh"

Napi::Boolean SetWindowBottom_Wrapper(Napi::CallbackInfo& info) {
    Napi::Env jsEnv = info.Env();
    // Check for erroneus arguments from JS call
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
    if (outcome) {
        return Napi::Boolean::New(jsEnv, true);
    } else {
        return Napi::Boolean::New(jsEnv, false);
    }

}

Napi::Object Init(Napi::Env jsEnv, Napi::Object exports) {
    exports.Set(
        Napi::String::New(jsEnv, "setBottomMost"),
        Napi::Function::New(jsEnv, SetWindowBottom_Wrapper)
    );
    return exports;
}

NODE_API_MODULE(win32lib, Init);