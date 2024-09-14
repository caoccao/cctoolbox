# Simple Message Box

Simple Message Box is a cross-platform message box that shows arbitrary messages in GUI for alerting in console automation.

## Features

- Specify arbitrary number of messages to be shown.
- Specify the height and width of the message box.
- Specify the title of the message box.
- Specify the auto-close timeout.

## Usage

```text
Simple Message Box

Usage: smbox.exe [OPTIONS] [messages]...

Arguments:
  [messages]...  Messages to be shown

Options:
      --height <HEIGHT>    Height of the message box [default: 300]
      --width <WIDTH>      Width of the message box [default: 400]
      --timeout <TIMEOUT>  Auto-close the message box after timeout (milliseconds) [default: 0]
  -t, --title <TITLE>      Title of the message box [default: "Simple Message Box"]
  -v, --verbose            Verbose
  -h, --help               Print help
  -V, --version            Print version
```
