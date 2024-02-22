# Touch

Touch is a Windows application that update the access and modification times of each FILE to the current time. It mimics the touch on Linux or MacOS.

There are additional features as follows.

- It supports logging the each touch event.
- It supports repeatedly touch files. This is useful in preventing a remote device from being disconnected after being inactive when timed out occurs.

## Usage

```text
Touch for Windows

Usage: touch [OPTIONS] [FILE]...

Arguments:
  [FILE]...  A FILE argument string

Options:
  -a                         change only the access time
  -m                         change only the modification time
  -d, --date <STRING>        parse STRING and use it instead of current time
  -c, --no-create            do not create any files
  -i, --interval <INTERVAL>  touch repeatedly per interval (milliseconds) [default: 0]
  -l, --log                  print the log
  -h, --help                 Print help
  -V, --version              Print version
```
