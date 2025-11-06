-- HECS Database Initialization Script

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create database if not exists (handled by Docker)
-- CREATE DATABASE hecs;

-- Create schemas
CREATE SCHEMA IF NOT EXISTS hecs;
CREATE SCHEMA IF NOT EXISTS audit;

-- Set search path
SET search_path TO hecs, public;

-- Create users table
CREATE TABLE IF NOT EXISTS hecs.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    is_superuser BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Create devices table
CREATE TABLE IF NOT EXISTS hecs.devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    device_id VARCHAR(100) UNIQUE NOT NULL,
    hardware_id VARCHAR(255) UNIQUE,
    customer_id UUID NOT NULL,
    status VARCHAR(50) DEFAULT 'offline',
    ip_address INET,
    mac_address MACADDR,
    firmware_version VARCHAR(50),
    last_seen TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create customers table
CREATE TABLE IF NOT EXISTS hecs.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    address TEXT,
    haguenau_customer_id VARCHAR(100),
    subscription_tier VARCHAR(50) DEFAULT 'basic',
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS hecs.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID REFERENCES hecs.devices(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    task_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    payload JSONB DEFAULT '{}',
    result JSONB,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit.logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    entity_type VARCHAR(100),
    entity_id UUID,
    action VARCHAR(50) NOT NULL,
    changes JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_email ON hecs.users(email);
CREATE INDEX idx_users_username ON hecs.users(username);
CREATE INDEX idx_devices_device_id ON hecs.devices(device_id);
CREATE INDEX idx_devices_customer_id ON hecs.devices(customer_id);
CREATE INDEX idx_devices_status ON hecs.devices(status);
CREATE INDEX idx_tasks_device_id ON hecs.tasks(device_id);
CREATE INDEX idx_tasks_status ON hecs.tasks(status);
CREATE INDEX idx_tasks_scheduled_at ON hecs.tasks(scheduled_at);
CREATE INDEX idx_customers_email ON hecs.customers(email);
CREATE INDEX idx_audit_logs_user_id ON audit.logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit.logs(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON hecs.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON hecs.devices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON hecs.customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON hecs.tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: admin123 - CHANGE IN PRODUCTION!)
INSERT INTO hecs.users (email, username, password_hash, full_name, is_superuser)
VALUES (
    'admin@hecs.local',
    'admin',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5aeWABfN7WZ.K',
    'System Administrator',
    true
) ON CONFLICT (email) DO NOTHING;

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA hecs TO hecs;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA hecs TO hecs;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA audit TO hecs;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA audit TO hecs;
