# KB Academy System Settings Maintenance Mode

## Purpose
Provides app-wide control for maintenance windows and system messaging.

## Current Fields
- settings_key
- maintenance_mode
- maintenance_message
- updated_at

## Notes
- global settings row uses settings_key = global
- non-admin users should be blocked during maintenance mode
- admins may bypass maintenance mode
- later phases can add scheduled maintenance windows and pre-maintenance banners