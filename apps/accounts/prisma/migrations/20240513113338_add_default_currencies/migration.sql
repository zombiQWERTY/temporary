INSERT INTO "Currency" (code, name, symbol, "isPrimary")
VALUES
    ('USD', 'United States Dollar', '$', true),
    ('EUR', 'Euro', '€', false),
    ('RUB', 'Russian Ruble', '₽', false),
    ('JPY', 'Japanese Yen', '¥', false)
ON CONFLICT (code) DO NOTHING;
