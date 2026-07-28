-- CH, LL y RR: letras propias del abecedario dactilológico de LSA.
--
-- La grilla del abecedario del frontend (LSA_ALPHABET en
-- app/(protected)/alphabet.tsx) ya las ofrece, pero `letter` era varchar(1):
-- `complete_alphabet_letter('CH', ...)` fallaba al insertar con
-- "value too long for type character varying(1)".
--
-- `text` y no varchar(2): así no hay que volver a migrar esta columna si algún
-- día se suma otra letra compuesta. Qué string es una letra válida lo decide el
-- backend (LSA_ALPHABET en src/controllers/alphabetController.ts), no la DB.
--
-- La columna es parte de la PK (user_id, letter); varchar(n) -> text es un
-- cambio binario-compatible, así que no reescribe la tabla ni pierde el índice.

alter table public.user_alphabet_progress
    alter column letter type text;

comment on column public.user_alphabet_progress.letter is
    'Letra del abecedario dactilológico LSA. Puede tener más de un carácter (CH, LL, RR). El conjunto válido lo valida el backend, no la DB.';
