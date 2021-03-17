DROP TABLE IF EXISTS contry; 

CREATE TABLE contry(
	id serial PRIMARY KEY,
	Country VARCHAR (255),
	TotalConfirmed VARCHAR (255),
	TotalDeaths VARCHAR (255),
    TotalRecovered VARCHAR (255),
	Date VARCHAR (255)
);