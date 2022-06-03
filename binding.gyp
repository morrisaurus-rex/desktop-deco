{
    "targets":[
        {
            "target_name": "win32",
            "cflags!": [
                "-fno-exceptions"
            ],
            "ccflags!": [
                "-fno-exceptions",
                "-pedantic",
                "-Wall",
                "-Wextra"
            ],
            "sources": [
                "./native/win32module.cc",
                "./native/win32lib.cc"
            ],
            "include_dirs": [
                "./node_modules/node-addon-api"
            ],
            "defines": [
                "NAPI_DISABLE_CPP_EXCEPTIONS",
                "UNICODE"
            ]
        }
    ]
}