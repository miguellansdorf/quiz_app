# quiz_app

This app serves as a small quiz game in which users can create their own questions-and-answers tests and compete against other users.
It can also be used to train new users in specific areas, for example creating a test about software related questions and letting a user answer the questions. In this way you can test their knowledge on the subject.

## installation guide

First the MySQL database has to be created. The mysql workbench model file is included in the source code and can be found in the databasemodel folder. Use the forward engineering function in MySQL Workbench to create the database. Make sure to also run the added necessary_inserts.sql file which adds necessary rows for the app and also creates a root user with password "secret".

Secondly run npm install to install the necessary node modules.

Start the server by running npm start
