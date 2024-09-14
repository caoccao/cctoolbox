# CCToolbox

[![Build Simple Message Box](https://github.com/caoccao/cctoolbox/actions/workflows/build_smbox.yml/badge.svg)](https://github.com/caoccao/cctoolbox/actions/workflows/build_smbox.yml) [![Build Touch](https://github.com/caoccao/cctoolbox/actions/workflows/build_touch.yml/badge.svg)](https://github.com/caoccao/cctoolbox/actions/workflows/build_touch.yml) [![Build Uptime](https://github.com/caoccao/cctoolbox/actions/workflows/build_uptime.yml/badge.svg)](https://github.com/caoccao/cctoolbox/actions/workflows/build_uptime.yml) [![Build web-tools](https://github.com/caoccao/cctoolbox/actions/workflows/build_web_tools.yml/badge.svg)](https://github.com/caoccao/cctoolbox/actions/workflows/build_web_tools.yml)

CCToolbox is a collection of small open source tools written by Sam Cao for fun.

## Linux on Windows

There are some Linux tools absent on Windows. The following tools are written in Rust for Windows. They are available at the [Releases](https://github.com/caoccao/cctoolbox/releases).

- [touch](touch)
- [uptime](uptime)

Why rewrite the tools in Rust? Isn't the Git for Windows good enough? The problem of Git for Windows is it requires the Git bash to be alive. These tools written in Rust are pure native Windows applications without any 3rd party dependencies.

## web-tools

[web-tools](https://www.caoccao.com/cctoolbox/) is a set of web based tools as follows.

| Name | Description |
| ---- | ----------- |
| [Grep It](https://www.caoccao.com/cctoolbox/#grep-it) | Apply JavaScript regular expression to input text and template for code generation. |
| [Srt Sync](https://www.caoccao.com/cctoolbox/#srt-sync) | Sync timeline of one or two subtitle files. |

## Other Tools

| Name | Description |
| ---- | ----------- |
| [Hide Volume OSD](hide-volume-osd) | Hide Volume OSD is a tool for hiding/showing the volume OSD. |
| [PKU Check](pku-check) | PKU Check is a console application that checks the availability of Linux kernel feature [Memory Protection Keys](https://www.kernel.org/doc/html/next/core-api/protection-keys.html) on a certain Linux distribution. |
| [Simple Message Box](simple-message-box) | A cross-platform message box that shows arbitrary messages in GUI for alerting in console automation. |

## License

[APACHE LICENSE, VERSION 2.0](LICENSE)
