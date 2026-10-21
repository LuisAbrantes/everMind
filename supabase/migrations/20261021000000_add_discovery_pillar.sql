-- ============================================================================
-- everMind: PWA persistence — passo 1 de 2
-- Migration: 20261021000000_add_discovery_pillar.sql
--
-- O PWA registra as "Descobertas Surpresa" como um pilar próprio no log de
-- atividades (pillar = 'DISCOVERY'). Isso exige um novo valor no enum.
--
-- ALTER TYPE ... ADD VALUE fica em arquivo SEPARADO de propósito: o valor novo
-- só pode ser USADO depois que esta transação for confirmada (commit).
-- A migration seguinte (20261021000100_pwa_persistence.sql) já pode usá-lo.
-- ============================================================================

ALTER TYPE challenge_pillar_type ADD VALUE IF NOT EXISTS 'discovery';
