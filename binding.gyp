{
    "targets":[
        {
            "target_name": "win32lib",
            "cflags!": [
                "-fno-exceptions"
            ],
            "ccflags!": [
                "-fno-exceptions"
            ],
            "sources": [
                "./native/win32module.cc",
                "./native/win32lib.cc"
            ],
            "include_dirs": [
                "./node_modules/node-addon-api"
            ],
            "defines": [
                "NAPI_DISABLE_CPP_EXCEPTIONS"
            ]
        }
    ]
}