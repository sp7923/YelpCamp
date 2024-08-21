const express=require('express');
const reviews=require('../controllers/reviews');
const catchAsync=require('../utils/catchAsync');
const {validateReview,isLoggedIn,isReviewAuthor}=require('../middleware');

const router=express.Router({mergeParams: true});

router.get('/:reviewId',isLoggedIn,isReviewAuthor,reviews.renderReview);

router.post('/',isLoggedIn,validateReview,catchAsync(reviews.createReview));

router.delete('/:reviewId',isLoggedIn,isReviewAuthor,catchAsync(reviews.deleteReview));

module.exports=router;