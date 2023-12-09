# PKU Check

PKU Check is a console application that checks the availability of Linux kernel feature [Memory Protection Keys](https://www.kernel.org/doc/html/next/core-api/protection-keys.html) on a certain Linux distribution.

There are a few Linux distributions in VM messing up with this Linux kernel feature. That results in V8 crashing while accessing protected memory address. PKU Check can detect such defect.

## Prerequisites

- Linux 4.9+
- glibc 2.27+

## Usage

- Build

```sh
gcc pku-check.c -o pku-check
```

- Run

```sh
./pku-check
```

## Results

- Ubuntu 20.04 on WSL2

```txt
Linux release is 5.15.133.1-microsoft-standard-WSL2.
PKU is supported.
Failed allocate a key though PKU is supported.
The OS is probably in a VM.
```

- Amazon Linux 2023 on AWS

```txt
Linux release is 6.1.61-85.141.amzn2023.x86_64.
PKU is supported.
Key 1 is allocated.
Error: Failed to protect the memory.
Key 1 is freed.
```

- RHEL v8.8 on Hyper-V

```txt
Linux release is 4.18.0-477.10.1.el8_8.x86_64.
Error: PKU is not supported.
```

## License

[APACHE LICENSE, VERSION 2.0](../LICENSE)

## References

- [pkey_alloc — Linux manual page](https://man7.org/linux/man-pages/man2/pkey_alloc.2.html)
- [Memory Protection Keys](https://www.kernel.org/doc/html/next/core-api/protection-keys.html)
- [The GNU C Library - Memory Protection Keys](https://www.gnu.org/software/libc/manual/html_mono/libc.html#Memory-Protection-Keys)

## OS Releases

- Ubuntu 20.04 on WSL2

```properties
cat /etc/os-release

NAME="Ubuntu"
VERSION="20.04.6 LTS (Focal Fossa)"
ID=ubuntu
ID_LIKE=debian
PRETTY_NAME="Ubuntu 20.04.6 LTS"
VERSION_ID="20.04"
HOME_URL="https://www.ubuntu.com/"
SUPPORT_URL="https://help.ubuntu.com/"
BUG_REPORT_URL="https://bugs.launchpad.net/ubuntu/"
PRIVACY_POLICY_URL="https://www.ubuntu.com/legal/terms-and-policies/privacy-policy"
VERSION_CODENAME=focal
UBUNTU_CODENAME=focal
```

- Amazon Linux 2023 on AWS

```properties
cat /etc/os-release

NAME="Amazon Linux"
VERSION="2023"
ID="amzn"
ID_LIKE="fedora"
VERSION_ID="2023"
PLATFORM_ID="platform:al2023"
PRETTY_NAME="Amazon Linux 2023"
ANSI_COLOR="0;33"
CPE_NAME="cpe:2.3:o:amazon:amazon_linux:2023"
HOME_URL="https://aws.amazon.com/linux/"
BUG_REPORT_URL="https://github.com/amazonlinux/amazon-linux-2023"
SUPPORT_END="2028-03-15"
```

- RHEL v8.8 on Hyper-V

```properties
NAME="Red Hat Enterprise Linux"
VERSION="8.8 (Ootpa)"
ID="rhel"
ID_LIKE="fedora"
VERSION_ID="8.8"
PLATFORM_ID="platform:el8"
PRETTY_NAME="Red Hat Enterprise Linux 8.8 (Ootpa)"
ANSI_COLOR="0;31"
CPE_NAME="cpe:/o:redhat:enterprise_linux:8::baseos"
HOME_URL="https://www.redhat.com/"
DOCUMENTATION_URL="https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8"
BUG_REPORT_URL="https://bugzilla.redhat.com/"

REDHAT_BUGZILLA_PRODUCT="Red Hat Enterprise Linux 8"
REDHAT_BUGZILLA_PRODUCT_VERSION=8.8
REDHAT_SUPPORT_PRODUCT="Red Hat Enterprise Linux"
REDHAT_SUPPORT_PRODUCT_VERSION="8.8"
```
