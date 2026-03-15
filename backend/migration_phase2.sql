-- Migration to update tasks table
ALTER TABLE tasks RENAME COLUMN task_type TO category;
ALTER TABLE tasks ALTER COLUMN category SET DEFAULT 'Personal';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS confidence FLOAT DEFAULT 1.0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Migration to update reminders table
ALTER TABLE reminders ADD COLUMN IF NOT EXISTS interval_type TEXT; -- '24h', '3h', '30m'

-- Create a trigger to update updated_at on every update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
