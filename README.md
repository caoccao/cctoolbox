# CCToolbox

[![Build Touch](https://github.com/caoccao/cctoolbox/actions/workflows/build_touch.yml/badge.svg)](https://github.com/caoccao/cctoolbox/actions/workflows/build_touch.yml) [![Build Uptime](https://github.com/caoccao/cctoolbox/actions/workflows/build_uptime.yml/badge.svg)](https://github.com/caoccao/cctoolbox/actions/workflows/build_uptime.yml)

CCToolbox is a collection of small open source tools written by Sam Cao for fun.

## Linux on Windows

There are some Linux tools absent on Windows. The following tools are written in Rust for Windows. They are available at the [Releases](https://github.com/caoccao/cctoolbox/releases).

- [touch](touch)
- [uptime](uptime)

Why rewrite the tools in Rust? Isn't the Git for Windows good enough? The problem of Git for Windows is it requires the Git bash to be alive. These tools written in Rust are pure native Windows applications without any 3rd party dependencies.

## web-tools

[web-tools](https://www.caoccao.com/cctoolbox/) is a set of tools as follows.

| Name | Description |
| ---- | ----------- |
| Grep It | Apply JavaScript regular expression to input text and template for code generation. |

## Other Tools

| Name | Description |
| ---- | ----------- |
| [Hide Volume OSD](hide-volume-osd) | Hide Volume OSD is a tool for hiding/showing the volume OSD. |
| [PKU Check](pku-check) | PKU Check is a console application that checks the availability of Linux kernel feature [Memory Protection Keys](https://www.kernel.org/doc/html/next/core-api/protection-keys.html) on a certain Linux distribution. |

## License

[APACHE LICENSE, VERSION 2.0](LICENSE)
