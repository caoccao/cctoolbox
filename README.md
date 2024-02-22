# CCToolbox

[![Windows Build](https://github.com/caoccao/cctoolbox/actions/workflows/windows_build.yml/badge.svg)](https://github.com/caoccao/cctoolbox/actions/workflows/windows_build.yml)

CCToolbox is a collection of small open source tools written by Sam Cao for fun.

## Regular Tools

| Name | Description |
| ---- | ----------- |
| [Hide Volume OSD](hide-volume-osd) | Hide Volume OSD is a tool for hiding/showing the volume OSD. |
| [PKU Check](pku-check) | PKU Check is a console application that checks the availability of Linux kernel feature [Memory Protection Keys](https://www.kernel.org/doc/html/next/core-api/protection-keys.html) on a certain Linux distribution. |

## Linux on Windows

There are some Linux tools absent on Windows. The following tools are written in Rust for Windows. They are available at the [Releases](https://github.com/caoccao/cctoolbox/releases).

- [uptime](uptime)

Why rewrite the tools in Rust? Isn't the Git for Windows good enough? The problem of Git for Windows is it requires the Git bash to be alive. These tools written in Rush are pure native Windows applications without any 3rd party dependencies.

## License

[APACHE LICENSE, VERSION 2.0](LICENSE)
