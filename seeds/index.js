const {createClient}=require('pexels');
const client = createClient('NVTdqGRhDy83FJ5KX8sfQOxS6xe3suRnAno73O6MRCEyyRwfb1kNzAa5');

const mongoose=require('mongoose');
const Campground=require('../models/campground');
const cities=require('./cities');
const {places,descriptors}=require('./seedHelpers');
const campground = require('../models/campground');

const username = encodeURIComponent('pc');
const password = encodeURIComponent('sourav');
const dbName = 'yelp-camp';

const uri = `mongodb://${username}:${password}@localhost:27017/${dbName}?authSource=admin`;

mongoose.connect(uri);

const db=mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("Database connected");
});

const sample=(array)=>array[Math.floor(Math.random()*array.length)];


const seedDB=async()=>{
    await Campground.deleteMany({});
    for(let i=0;i<400;i++){
        const random1000=Math.floor(Math.random()*1000);
        const price=Math.floor(Math.random()*20)+10;
        // const photos= await client.photos.search({query:'forest',page:i+1, per_page: 1 });
        const camp=new Campground({
            author:'66b9d94d76160e53e8f5b887',
            location:`${cities[random1000].city},${cities[random1000].state}`,
            geometry: {
              type: 'Point',
              coordinates: [cities[random1000].longitude, cities[random1000].latitude]
            },
            title:`${sample(descriptors)} ${sample(places)}`,
            description:'Lorem ipsum dolor sit amet consectetur adipisicing elit. Soluta quidem odit impedit optio in ratione iste totam? Facilis omnis ut enim tempora sit, aspernatur, repudiandae voluptatibus placeat nam architecto ab?',
            price:price,
            image:[
                {
                  url: 'https://res.cloudinary.com/desbzqtjy/image/upload/v1723621142/YelpCamp/ogrqibnakf9kjh3tcwfi.jpg',
                  filename: 'YelpCamp/ogrqibnakf9kjh3tcwfi',
                },
                {
                  url: 'https://res.cloudinary.com/desbzqtjy/image/upload/v1723621150/YelpCamp/nz8xfpcf4odzoppmcbgl.jpg',
                  filename: 'YelpCamp/nz8xfpcf4odzoppmcbgl',
                },
                {
                  url: 'https://res.cloudinary.com/desbzqtjy/image/upload/v1723621151/YelpCamp/km0uwfrolbaedmmrsahq.jpg',
                  filename: 'YelpCamp/km0uwfrolbaedmmrsahq',
                }
              ]
        })
        await camp.save();
    }
}

seedDB().then(()=>{
    mongoose.connection.close();
})