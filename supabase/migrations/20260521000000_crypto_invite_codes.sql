-- Swap invite_code default from md5(random()) to gen_random_bytes (crypto-quality entropy).
-- md5(random()::text) uses a non-cryptographic PRNG; gen_random_bytes uses pgcrypto CSPRNG.
-- encode(..., 'hex') keeps the same 8-char hex format; existing codes are unchanged.
alter table trips
  alter column invite_code set default substr(encode(gen_random_bytes(6), 'hex'), 1, 8);
