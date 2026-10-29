# Access Profiles — description texts (PRJ-035.WEB S2)

All text comes from `README.md` and `composer.json`. Ricardo pastes these into GitHub and Packagist.

## Tagline (one line)

Different permissions in different parts of a tenant.

## Meta description (site, 105 characters)

Scoped access profiles for multi-tenant Laravel apps. Deny wins. Every grant records who gave it and why.

## GitHub "About" text (≤ 350 characters)

Scoped access profiles for multi-tenant Laravel apps: per-scope assignments, deny rules, validity windows and an audit trail, next to Laravel's Gate.

Website field: `https://laravel-access-profiles.packages.seisigma.co`.

## GitHub topics

`laravel` `php` `permissions` `authorization` `access-control` `multi-tenant` `acl` `rbac` `laravel-package` `eloquent`

## Packagist / composer description

Packagist reads `composer.json`. The current text on `main` is already right:

> Scoped access profiles for multi-tenant Laravel apps: per-scope assignments, deny rules, validity windows and an audit trail, next to Laravel's Gate.

No change needed. Packagist updates on the next release.

## Images

| File | Size | Use |
|---|---|---|
| `banner/social-preview.png` | 1280×640 | GitHub → Settings → Social preview |
| `banner/readme-header.png` | 1280×320 | README header, light |
| `banner/readme-header-dark.png` | 1280×320 | README header, dark |
| `banner/banner.html` | — | Source. Render: Chrome headless, `?w=1280&h=640` (social) or `?w=1280&h=320&c=wide[,dark]` |

README header markup (for a later package PR):

```html
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="art/readme-header-dark.png">
  <img src="art/readme-header.png" alt="Access Profiles — Different permissions in different parts of a tenant." width="1280" height="320">
</picture>
```

`art/` is already export-ignored in `.gitattributes`.
