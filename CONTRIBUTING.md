# Contributing

Contributions are welcome. Please read this first.

The user documentation is at [laravel-access-profiles.seisigma-srl.workers.dev](https://laravel-access-profiles.seisigma-srl.workers.dev/docs/getting-started/). Its pages live in `website/src/content/docs/`; a change to public behaviour updates the matching page in the same PR.

## Before you open a pull request

- Open an issue for anything larger than a bug fix, so we can agree on the design first.
  The design lives in [`docs/DESIGN.md`](docs/DESIGN.md); changes to the public API update it in the same PR.
- Keep runtime dependencies to `php` and `illuminate/*`. A PR that adds another runtime dependency will not be merged.
- Keep the API generic. Tenants and scopes are any Eloquent model; do not add domain words to `src/`.

## Checks

Run all three before you push. CI runs the same.

```bash
composer test      # Pest
composer analyse   # PHPStan (Larastan)
composer format    # Pint
```

Tests check behaviour (what the package does), not source text.

## Commits

One logical change per commit. Write the subject in the imperative mood ("Add expiry check", not "Added").
