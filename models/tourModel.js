const mongoose = require("mongoose");
const validator = require("validator");
const slugify = require("slugify");
const tourSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, 'A Tour must have a name'],
      unique:  true,
      trim: true,
      maxLength: [40, 'A tour must have less or equal than 40 characters'],
      // validate: [validator.isAlpha, 'Tour name must only contain characters'] No util porque no acepta espacios
    },
    slug: String,
    duration: {
      type: Number, 
      required: [true, 'A duration must be required']
    },
    maxGroupSize: {
      type: Number, 
      required: [true, 'Tour must have a group size'],
    }, 
    difficulty: {
      type: String,
      required: [true, 'Tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either easy, medium or difficult'
      }
        
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'A tour must be above 1.0'],
      max: [5, 'A tour must be under 5.0']
    },
    ratingsQuantity: {
      type: Number,
      default: 0.0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val){
          return val < this.price; // /Compara el priceDiscount con el price 100 < 200
        },
        message: 'Descuento debe ser mas barato que el precio'
      }
    },
    summary: {
      type: String,
      trim: true
    }, 
    description: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description']
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have an image cover'] 
    },
    images: [String], 
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: {virtuals: true}
  }) // forma de describir la data y se especifica el tipo de dato 

tourSchema.virtual('durationweeks').get(function(){
  return this.duration / 7;
})

// Document Middleware: runs before .save() and .create()
tourSchema.pre('save', function(next){
  console.log(this);
  this.slug = slugify(this.name, {lower: true});
  next();
})

// tourSchema.pre('save', function(next){
//   console.log('Will save document');
//   next();
// })


// tourSchema.post('save', function(doc, next){
//   console.log(doc);
//   next();
// })

//QUERY MIDDLEWARE
tourSchema.pre(/^find/, function(next){
  // tourSchema.pre('find', function(next)
  this.find({secretTour: {$ne: true}});
  this.start = Date.now();
  next();
}) // Aplica para find y findOne
// tourSchema.pre('findOne', function(next){
//   this.find({secretTour: {$ne: true}});
//   next();
// })
tourSchema.post(/^find/, function(docs, next){
  console.log(`Query took ${Date.now() - this.start} miliseconds!`);
  
  next();
})

// Aggregation middleware
tourSchema.pre('aggregate', function(next){
  this.pipeline().unshift({ $match: {secretTour: {$ne: true}}})
  console.log(this.pipeline());
  next();
})
const Tour = mongoose.model('Tour', tourSchema); //Se crea un modelo a partir del schema anterior
module.exports = Tour;