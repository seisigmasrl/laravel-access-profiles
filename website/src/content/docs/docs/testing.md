---
title: Testing
description: Run the package test suite, static analysis and formatter. Every README and docs example has a behaviour test.
---

Run `composer test`, `composer analyse` and `composer format`.

Each PHP and Blade example in the README and on these docs pages has a behaviour test in [ReadmeExamplesTest.php](https://github.com/seisigmasrl/laravel-access-profiles/blob/main/tests/Docs/ReadmeExamplesTest.php). Tests keep their own copies of the examples.

CI runs every supported row on its lowest and its newest allowed release. See [Getting started](/docs/getting-started/#requirements).

