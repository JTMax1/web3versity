-- Fix award_xp function to ensure level is always >= 1

CREATE OR REPLACE FUNCTION award_xp(
    p_user_id UUID,
    p_xp_amount INTEGER
)
RETURNS void AS $$
DECLARE
    v_new_xp INTEGER;
    v_new_level INTEGER;
BEGIN
    -- Update total XP
    UPDATE users
    SET total_xp = total_xp + p_xp_amount
    WHERE id = p_user_id
    RETURNING total_xp INTO v_new_xp;

    -- Calculate new level
    v_new_level := calculate_user_level(v_new_xp);

    -- Ensure level is at least 1 and at most 100
    v_new_level := GREATEST(1, LEAST(100, v_new_level));

    -- Update level
    UPDATE users
    SET current_level = v_new_level,
        updated_at = NOW()
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;
