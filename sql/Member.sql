CREATE TABLE member
(
    id       INT AUTO_INCREMENT PRIMARY KEY,
    login_id VARCHAR(30) UNIQUE NOT NULL,
    password VARCHAR(200)       NOT NULL,
    name     VARCHAR(50)        NOT NULL,
    phone    VARCHAR(20)        NOT NULL,
    email    VARCHAR(100)       NOT NULL,
    address  VARCHAR(255)       NOT NULL,
    birthday DATE               NOT NULL
);

# DROP TABLE member;

ALTER TABLE member
    ADD COLUMN privacy_agreed BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE member
    ADD zipcode VARCHAR(10) NOT NULL;

ALTER TABLE member
    ADD address_detail VARCHAR(255) NULL;

ALTER TABLE member
    ADD CONSTRAINT uq_member_email UNIQUE (email);

SELECT email, COUNT(*)
FROM member
GROUP BY email
HAVING COUNT(*) > 1;


ALTER TABLE member
    MODIFY COLUMN id INT AUTO_INCREMENT;

# 권한 테이블
CREATE TABLE role
(
    name VARCHAR(30) PRIMARY KEY
);


CREATE TABLE member_role
(
    member_id INT         NOT NULL,
    role_name VARCHAR(30) NOT NULL,
    PRIMARY KEY (member_id, role_name),
    FOREIGN KEY (member_id) REFERENCES member (id),
    FOREIGN KEY (role_name) REFERENCES role (name)
);

INSERT INTO member_role
    (member_id, role_name)
VALUES (139, 'admin');


