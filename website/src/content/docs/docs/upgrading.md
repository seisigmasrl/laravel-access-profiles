---
title: Upgrading
description: Supported release lines and where to read what changed in each release.
---

Supported release lines:

| Package | PHP | Laravel | Testbench |
|---|---|---|---|
| 0.1.x | 8.3, 8.4, 8.5 | 12.69+ | 10.x |
| 0.1.x | 8.3, 8.4, 8.5 | 13.30+ | 11.x |

Read the [changelog](/docs/changelog/) before you update. Each release has its own entry.

When you deploy changed template definitions, run `php artisan access-profiles:sync-templates` again.
