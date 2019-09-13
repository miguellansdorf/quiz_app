INSERT INTO quiz_app.roles (id, name) VALUES (1, 'User'), (2, 'Administrator');
INSERT INTO quiz_app.users (role_id, username, firstname, lastname, password) VALUES (2, 'root', 'super', 'user', aes_encrypt('secret', 'root'));
INSERT INTO quiz_app.categories (id, created_by, category) VALUES (1, 1, 'Simple'), (2, 1, 'Complex');