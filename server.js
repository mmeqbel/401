
// including - importing libraries
const express = require('express');
const superAgent = require('superagent');
const pg = require('pg');
const cors = require('cors');
const methodOverride = require('method-override');
const database = require('mime-db');

// setup and configuration
require('dotenv').config();
const app = express();
app.use(cors());
app.use(methodOverride('_method'));
app.set('view engine','ejs');
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
const client = new pg.Client(process.env.DATABASE_URL);   // on your machine
//const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }); // for heroku

//end point 

//HOME 
app.get("/",homePageHandler);
//contry result
app.get("/contryresult",contryResultHandler);
//all contry
app.get("/allcontry",allContryHandler);

//contryrecord
app.post("/contryrecord",postContryHandler);

//my records
app.get("/myrecords",myRecordsHandler);

//record details
app.get("/contrydetails",contryDetailHandler);




//handlers 
function homePageHandler(req,res) {
    //res.render("home");
    getHomePageData(req,res);
}
function contryResultHandler(req,res) {
    //res.render("home");
    getContryResultData(req,res);
}
function allContryHandler(req,res) {
    //res.render("home");
    getAllContryData(req,res);
}
function postContryHandler(req,res) {
    //res.render("home");
    //getAllContryData(req,res);
    console.log("to be posted",req.body)
    addRecord(req.body);
}
function myRecordsHandler(req,res) {
  getMyRecords(req,res);
}
function contryDetailHandler(req,res) {
    //console.log("id is :",req.query)
    getDetailsPage(req,res);
}

//getters
function getContryResultData(req,res) {
    let query=req.query;
    console.log("query is ",query);
    let apiUrl=`https://api.covid19api.com/country/${query.contry}/status/confirmed?from=${query.from}&to=${query.to}`
    superAgent.get(apiUrl)
    .then(data=>{
        const recivedData=JSON.parse(data.text);
        // if (recivedData.length>10) {
        //     recivedData.length=10;
        // }
        
        res.render("contryResult",{data:recivedData})
        
    }).catch(error=>{
        console.log("an error ocuured while connecting to api",error);

    })
}
function getHomePageData(req,res) {
    let apiUrl=`https://api.covid19api.com/world/total`;
    superAgent
    .get(apiUrl)
    .then(data=>{
        const recivedData=JSON.parse(data.text);
        //console.log(JSON.parse(data.text));
        res.render("home",{data:recivedData});

    }).catch(error=>{
        console.log("an error ocuured while connecting to api",error);
    })
    
}
function getAllContryData(req,res) {
    let apiUrl=`https://api.covid19api.com/summary`
    superAgent
    .get(apiUrl)
    .then(data=>{
        const recivedData=JSON.parse(data.text).Countries;
        
        res.render("allContries",{data:recivedData})
    }).catch(error=>{
        console.log("an error ocuured while from api",error);
    })
}
function getMyRecords(req,res) {
    let dbQuery=`SELECT * from contry`;
    client.query(dbQuery).then(data=>{
        //console.log("data is : ",);
        res.render("myrecords",{data:data.rows})
    }).catch(error=>{
       console.log( "an error ocuured",error);
    })
}
function getDetailsPage(req,res) {
    let id =req.query.id;
    let dbQuery=`select * from contry where id= $1`;
    let safeValues=[id];
    client.query(dbQuery,safeValues).then(data=>{
        console.log(data.rows);
       res.render("contrydetails",{x:data.rows[0]})
    }).catch(error=>{
        console.log("ann error ocuuer",error);
    })
}
//helpers 
function addRecord(record) {
    let dbQuery=`INSERT INTO contry (Country,TotalConfirmed,TotalDeaths,TotalRecovered,Date)
    VALUES ($1,$2,$3,$4,$5);`
    const contry=new Contry(JSON.parse(record.record));
    let safeValues=[contry.Contry,contry.TotalConfirmed,contry.TotalDeaths,contry.TotalRecovered,contry.Date];
    client.query(dbQuery,safeValues).then((data)=>{
        console.log("succesfully inserted into db")
    }).catch(error=>{
        console.log("an error ocuuerd while insrerting into db",error);
    })
    
}
// Country, Total Confirmed Cases, Total Deaths Cases, Total Recovered Cases, Date, and add-to-my-records button)
function Contry(record){
this.Contry=record.Country;
this.TotalConfirmed=record.TotalConfirmed;
this.TotalDeaths=record.TotalDeaths;
this.TotalRecovered=record.TotalRecovered;
this.Date=record.Date;
}
client.connect().then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log("the app is listenning now on port",process.env.PORT);
    })
}).catch(error=>{
    console.log("an error ocuured while connecting to database",error);
})