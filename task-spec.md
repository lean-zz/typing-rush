## Requirements
- Replace all user-facing and internal WPM metrics with LPM (letters per minute).
- Keep scoring behavior consistent with previous relative difficulty after metric unit change.

## Verification
- `npm test`
- `npm run build`

## Success Criteria
- All verification commands pass.
- HUD and result screen show Raw LPM and LPM only.
- Engine stats no longer expose `wpm/rawWpm` fields.
