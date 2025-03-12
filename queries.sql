-- Create the users table (assuming user_id is from this table)
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name VARCHAR(45),
    color VARCHAR(15)
);


-- Create the items table with a foreign key to users
CREATE TABLE items (
    item_id INTEGER PRIMARY KEY,
    title VARCHAR(100),
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
