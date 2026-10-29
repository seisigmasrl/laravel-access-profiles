---
title: Events and audit
description: Every write dispatches an event after commit with actor, reason and before/after snapshots for your audit log.
---

Writes dispatch after commit: `AssignmentGranted`, `AssignmentRevoked`, `AssignmentUpdated`, `ProfileCreated`, `ProfileUpdated`, `ProfileDeleted` and `TemplatesSynced`. They carry readonly `actor`, `system`, `reason`, `before` and `after` fields. A system actor is null. Passive expiry fires no event.

## Send snapshots to your audit log

Register listeners in your host to send snapshots to its audit log.

```php
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Log;
use Seisigma\AccessProfiles\Events\AssignmentGranted;

Event::listen(AssignmentGranted::class, function (AssignmentGranted $event): void {
    Log::info('Access granted', [
        'actor' => $event->actor?->getKey(),
        'system' => $event->system,
        'reason' => $event->reason,
        'before' => $event->before,
        'after' => $event->after,
    ]);
});
```

## Access checks

`events.access_checked` is **false by default**. Enable it for shadow checks or debugging. `AccessChecked` carries `actor`, `target` and `decision` plus `system` and `reason`; it has no before/after snapshots. It fires for each decision, including memo hits.
