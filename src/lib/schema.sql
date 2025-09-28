-- GameNight Database Schema
-- Run this SQL in your PostgreSQL database to create the necessary tables

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Game nights table
CREATE TABLE IF NOT EXISTS game_nights (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    host_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    scheduled_date TIMESTAMP NOT NULL,
    location VARCHAR(200),
    max_players INTEGER DEFAULT 8,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Game night participants table
CREATE TABLE IF NOT EXISTS game_night_participants (
    id SERIAL PRIMARY KEY,
    game_night_id INTEGER REFERENCES game_nights(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, declined
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(game_night_id, user_id)
);

-- Games table
CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    min_players INTEGER DEFAULT 1,
    max_players INTEGER DEFAULT 8,
    estimated_duration INTEGER, -- in minutes
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Game night games table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS game_night_games (
    id SERIAL PRIMARY KEY,
    game_night_id INTEGER REFERENCES game_nights(id) ON DELETE CASCADE,
    game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
    added_by_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(game_night_id, game_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_game_nights_host ON game_nights(host_user_id);
CREATE INDEX IF NOT EXISTS idx_game_nights_date ON game_nights(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_participants_game_night ON game_night_participants(game_night_id);
CREATE INDEX IF NOT EXISTS idx_participants_user ON game_night_participants(user_id);
