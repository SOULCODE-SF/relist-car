CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(250) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user';
    name VARCHAR(250),
    location VARCHAR(250),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

insert into users(username, email, password, name, location) values('username', 'user@gmail.com', '12345', 'user user', 'Indonesia');

select * from users;

ALTER TABLE users
ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'user' AFTER password;


CREATE TABLE banners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    adsname TEXT NOT NULL,
    type ENUM('code', 'image') NOT NULL,
    position VARCHAR(250) NOT NULL,
    date_start DATE,
    date_end DATE,
    status ENUM('enabled', 'disabled') NOT NULL DEFAULT 'disabled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE banner_code (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code TEXT NOT NULL,
    banner_id INT NOT NULL
);

CREATE TABLE banner_image (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image TEXT NOT NULL,
    url VARCHAR(250) NOT NULL,
    banner_id INT NOT NULL
);

create table banner_positions (
	value VARCHAR(250) not null,
	label VARCHAR(250) not null
);

insert into banner_positions (value, label) values('paling-awal','Paling Awal')


