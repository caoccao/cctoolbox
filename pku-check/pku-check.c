/*
 * Copyright (c) 2023. caoccao.com Sam Cao
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#define _GNU_SOURCE

#include <dlfcn.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <sys/mman.h>
#include <sys/utsname.h>

int main(int argc, char *argv[]) {
  // Check Linux distribution
  struct utsname uname_buffer;
  if (uname(&uname_buffer) != 0) {
    printf("Error: Failed to call uname().\n");
    return 1;
  }
  printf("Linux release is %s.\n", uname_buffer.release);
  int kernel, major, minor;
  if (sscanf(uname_buffer.release, "%d.%d.%d", &kernel, &major, &minor) != 3) {
    printf("Error: Failed to parse Linux release.\n");
    return 1;
  }

  // Check PKU availability
  bool pku_supported =
    kernel > 5 || (kernel == 5 && major >= 13) ||   // anything >= 5.13
    (kernel == 5 && major == 4 && minor >= 182) ||  // 5.4 >= 5.4.182
    (kernel == 5 && major == 10 && minor >= 103);   // 5.10 >= 5.10.103
  if (!pku_supported) {
    printf("Error: PKU is not supported.\n");
    return 1;
  }
  printf("PKU is supported.\n");

  // https://man7.org/linux/man-pages/man2/pkey_alloc.2.html
  // Allocate key
  int key = pkey_alloc(0, PKEY_DISABLE_WRITE);
  if (key <= 0) {
    printf("Failed allocate a key though PKU is supported.\n");
    printf("The OS is probably in a VM.\n");
    return 0;
  }
  printf("Key %d is allocated.\n", key);

  // Protect and access the memory
  bool memory_error = false;
  int size = 1024;
  int* buffer = (int*)malloc(size * sizeof(int));
  if (pkey_mprotect(buffer, size, PROT_READ | PROT_WRITE, key) != 0) {
    printf("Error: Failed to protect the memory.\n");
    memory_error = true;
  }
  free(buffer);

  // Free key
  if (pkey_free(key) != 0) {
    printf("Error: Failed free key %d.\n", key);
    return 1;
  }
  printf("Key %d is freed.\n", key);
  return memory_error ? 1 : 0;
}
