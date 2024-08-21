const Campground=require('../models/campground');
const {cloudinary}=require('../cloudinary/index');
// Or import only the bits you need
const maptilerClient = require('@maptiler/client');
const { config, geocoding, geolocation, coordinates, data, staticMaps, elevation, math } = require('@maptiler/client');

// Initialize the map
const maptiler_key=process.env.MAPTILER_API_KEY;
maptilerClient.config.apiKey = maptiler_key;
// const map = new maptiler.Map({
//     container: 'map', // container id in your HTML
//     style: `https://api.maptiler.com/maps/streets/style.json?key=${maptiler_key}`,
//     center: [-97.7485, 30.2711], // starting position [lng, lat]
//     zoom: 9 // starting zoom
// });

// Add geocoding functionality
// const geocoder = new maptiler.Geocoder({
//     accessToken:maptiler_key
// });



module.exports.index=async(req,res)=>{
    const campgrounds=await Campground.find({});
    res.render('campgrounds/index',{campgrounds});
}

module.exports.renderNewForm=(req,res)=>{
    res.render('campgrounds/new');
}

module.exports.createCampground=async(req,res,next)=>{
    const result = await maptilerClient.geocoding.forward(req.body.campground.location,{limit:1});
    const campground=new Campground(req.body.campground);
    campground.geometry=result.features[0].geometry;
    campground.image=req.files.map(f=>({ url:f.path,filename:f.filename }));
    campground.author=req.user._id;
    await campground.save();
    req.flash('success','Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCampground=async(req,res)=>{
    const campground=await Campground.findById(req.params.id).populate({
        path:'reviews',
        populate:{ path : 'author'}
    }).populate('author');
    if(!campground){
        req.flash('error','Cannot find the campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show',{campground});
}

module.exports.renderEditForm=async(req,res)=>{
    const {id}=req.params;
    const campground=await Campground.findById(id);
    if(!campground){
        req.flash('error','Cannot find the campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit',{campground});
}

module.exports.updateCampground=async(req,res)=>{
    const {id}=req.params;
    const campground=await Campground.findByIdAndUpdate(id,{...req.body.campground});
    const imgs=req.files.map(f=>({ url:f.path,filename:f.filename }));
    campground.image.push(...imgs);
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({$pull:{image:{filename:{$in:req.body.deleteImages}}}});
    }
    await campground.save();
    req.flash('success','Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCampground=async(req,res)=>{
    const {id}=req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success','Successfully deleted Campground!')
    res.redirect('/campgrounds');
}