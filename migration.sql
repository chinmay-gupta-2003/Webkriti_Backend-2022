create table users (email varchar(50) not null primary key, name varchar(50) not null, password varchar(100) not null);


create table events (id serial not null primary key, name varchar(30) not null unique, startDate date not null, endDate date not null, shortDescription varchar(1000) not null, longDescription varchar(5000) not null, mediaImage varchar(300), mediaVideo varchar(300));


create table usereventregistration (id varchar(50) primary key not null,eventid int not null,useremail varchar not null,regdate date,foreign key (eventid) references events(id), foreign key (useremail) references users(email));