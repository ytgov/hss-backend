CREATE OR REPLACE FUNCTION "GENERAL".process_blob_value(
    p_blob_value BLOB,
    p_table_name VARCHAR2
) RETURN VARCHAR2 IS
    v_original_value VARCHAR2(4000);
    v_all_replace_text VARCHAR2(4000);
    v_partial_value VARCHAR2(4000);
    v_desc_text VARCHAR2(4000);
   	v_sql VARCHAR2(4000);
BEGIN
    -- Convert BLOB to VARCHAR2
    v_original_value := utl_raw.cast_to_varchar2(p_blob_value);
   
    v_all_replace_text :=   REPLACE(REPLACE(v_original_value, '{"data":', ''), '}', '');
    -- Split the string by commas and iterate over each part
    FOR i IN 1..REGEXP_COUNT(v_all_replace_text, ',') + 1 LOOP
        -- Extract each element from the string
        SELECT TRIM(BOTH ']' FROM TRIM(BOTH '[' FROM REGEXP_SUBSTR(v_all_replace_text, '[^,]+', 1, i)))
        INTO v_partial_value
        FROM DUAL;
        
        IF REGEXP_LIKE(v_partial_value, '^\d+(\.\d+)?$') THEN
            -- If it is numeric, fetch description from the table
            BEGIN
                v_sql := 'SELECT description FROM ' || p_table_name || ' WHERE id = :1';
                EXECUTE IMMEDIATE v_sql INTO v_desc_text USING TO_NUMBER(v_partial_value);            
            EXCEPTION
                WHEN NO_DATA_FOUND THEN
                    v_desc_text := v_partial_value; -- If no match found, keep original value
            END;
        ELSE
            -- If not numeric, trim quotes
            v_desc_text := CONCAT(' ', TRIM(BOTH '"' FROM v_partial_value));
        END IF;
        
        -- Replace the original text with the mapped text
        v_all_replace_text := REPLACE(v_all_replace_text, v_partial_value, v_desc_text);
    END LOOP;
    
    -- Remove any remaining brackets
    v_all_replace_text := REPLACE(REPLACE(v_all_replace_text, '[', ''), ']', '');
    
    RETURN TRIM(v_all_replace_text);
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END process_blob_value;