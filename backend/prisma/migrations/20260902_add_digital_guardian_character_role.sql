-- Character Universe: split WORLD_GUIDE into two distinct roles.
-- Atlas keeps WORLD_GUIDE (explains worlds/regions/navigation).
-- Byte gets the new DIGITAL_GUARDIAN role (digital literacy/safety/privacy).
ALTER TYPE "CharacterRole" ADD VALUE IF NOT EXISTS 'DIGITAL_GUARDIAN';
