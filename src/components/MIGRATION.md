# Base44 Component Migration Notes (placeholder)

This file is a scaffold for the “Base44 components + apply fixes” step.

When you paste in the real component code, apply these fixes:

1. `HistoryCard`: rename `created_date` -> `created_at`
2. `ResultCard`:
   - shared URL: `?shared=id` -> `/shared/id`
   - Clock icon -> Globe icon
3. `PricingSection`: ensure CTA buttons accept:
   - `onClick={onStartFreeClick}`
   - `onClick={onUpgradeClick}`

