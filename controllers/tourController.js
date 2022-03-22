const fs = require("fs");
const APIFeatures = require("../utils/apiFeatures");
const Tour = require("../models/tourModel");

exports.aliasTopTour = (req, res, next) => {
  
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';

  
  next();
}


// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// exports.checkID = (req, res, next, val) => {
//   console.log(`Tour id is: ${val}`);
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: "fail",
//       message: "Invalid ID",
//     });
//   }
//   next();
// }; Middleware implementation

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: "fail",
//       message: "Error, name or price not found",
//     });
//   }
//   next();
// };

exports.getAllTours = async (req, res) => {
  try{
    // const queryObject = {...req.query}; // destructuring
    // const excludedFields = ['page', 'sort', 'limit', 'fields'];
    
    // console.log(req.query);
    // excludedFields.forEach(el => delete queryObject[el]);
    // // const toursTest = await Tour.find().where('duration').equals(5).where('difficulty').equals('easy')
    
    // // 2) Advanced filtering
    // let queryStr = JSON.stringify(queryObject);
    // queryStr = queryStr.replace(/\b(gte|gt|lt|lte)\b/g, match => `$${match}`);
    // console.log(JSON.parse(queryStr));
    
    // let query = Tour.find(JSON.parse(queryStr));
    
    // // Sorting

    // if(req.query.sort) {
    //   const sortBy = req.query.sort.split(',').join(' ');
    //   console.log(sortBy);
    //   query = query.sort(req.query.sort)
    // } else {
    //     query = query.sort('-createdAt');
    // }

    // // 3 Field limiting
    // if(req.query.fields){
    //   const fieldBy = req.query.fields.split(',').join(' ');
    //   query = query.select(fieldBy);
    // } else {
    //   query = query.select('-__v');
    // }

    // // Pagination
    // const page = req.query.page*1 || 1;
    // const limit = req.query.limit * 1 || 100;
    // const skip = (page - 1) * limit;
    
    // query = query.skip(skip).limit(limit);

    // if (req.query.page) {
    //   const numTours = await Tour.countDocuments();
    //   if(skip >= numTours) {
    //     throw new Error('This page does not exist');
    //   }
    // }

    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .pagination();
    const tours = await features.query; 

    res.status(200).json({
      status: "success",
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(404).json({
      status: "fail",
      message: err
    
    });
  }

};

exports.getTour = async (req, res) => {
  try{
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: "success",
      data: {
        tour
      }
    })

  }catch (err){
    res.status(400).json({
      status: "fail",
      message: err
    })
  }

  // // if(id > tours.length) {
  // if (!tour) {
  //   return res.status(404).json({
  //     status: "fail",
  //     message: "Invalid ID",
  //   });
  // }

  // res.status(200).json({
  //   status: "success",
  //   data: {
  //     tour,
  //   },
  // });
};

exports.createTour = async (req, res) => {
  // const newTour = new Tour({})
  // newTour.save()
  try{
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err
    })
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, { 
      new: true,
      runValidators: true
     });

    res.status(200).json({
      status: 'success', 
      data: {
        tour: tour
      }
    })

  }catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err
    })
  }
}

exports.deleteTour = async (req, res) => {
  // if(id > tours.length) {
  // if (req.params.id * 1 > tours.length) {
  //   return res.status(404).json({
  //     status: "fail",
  //     message: "Invalid ID",
  //   });
  // }
  try{
    await Tour.findOneAndDelete(req.params.id);
    res.status(200).json({
      status: 'success',
      data: null
    })
  }catch (err){
    res.status(400).json({
      status: 'success',
      message: err
    })
  }
};

exports.getTourStats = async (req, res) => {
  try{
    const stats = await Tour.aggregate([
      {
        $match: {ratingsAverage:{$gte: 4.5}}
      },
      {

        $group: {
          _id: '$difficulty',
          numRatings: {$sum: '$ratingsQuantity'},
          numTours: {$sum: 1},
          avgRating: {$avg: '$ratingsAverage'},
          avgPrice: {$avg: '$price'},
          minPrice: {$min:'$price'},
          maxPrice: {$max: '$price'},
        }
      },
      {$sort: {avgPrice: 1}},
      // {
      //   $match: {_id: {$ne: 'easy'}}
      // }
    ])
    res.status(200).json({
      status: 'success',
      data: {stats}
    })
  }catch (err){
    res.status(400).json({
      status: 'success',
      message: err
    })
  }
}

exports.getMonthlyPlan = async (req, res) => {
  try{
    const year = req.params.year*1; //2021

    const plan = await Tour.aggregate([{
      $unwind: '$startDates'
    },
  {
    $match: {
      startDates: {
        $gte: new Date(`${year}-01-01`),
        $lte: new Date(`${year}-12-31`)
      }
    },
    
  },
  {
    $group: {
      _id: { $month: '$startDates'},
      numTour: { $sum: 1},
      tours: { $push: '$name' }
    }
  },
  {
    $addFields: {
      month: '$_id'
    }
  },
  {
    $project: {
      _id: 0
    }
  },
  {
    $sort: {
      numTour: -1
    }
  },
  {
    $limit: 12
  }
]);
    res.status(200).json({
      status: 'success',
      data: {plan}
    })
  }catch (err){
    res.status(400).json({
      status: 'success',
      message: err
    })
  }
}