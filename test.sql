DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Journal;

CREATE TABLE IF NOT EXISTS Users
(
    user_id INT AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    PRIMARY KEY (user_id)
);

CREATE TABLE IF NOT EXISTS Journal 
(   
    journal_id INT NOT NULL,
    content VARCHAR(255) NOT NULL,
    users_user_id INT NOT NULL,
    PRIMARY KEY (journal_id)
);