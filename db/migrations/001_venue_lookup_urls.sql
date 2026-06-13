-- Migration 001: add lookup_urls to venues
-- Run in Supabase SQL Editor (safe to run multiple times).
--
-- lookup_urls stores an ordered list of brewery web pages the admin
-- wants to use for automatic beer detail enrichment. Format:
--   [{ "label": "Tap menu", "url": "https://..." }, ...]
-- Max 5 entries enforced in the application layer.

alter table venues
  add column if not exists lookup_urls jsonb not null default '[]'::jsonb;
