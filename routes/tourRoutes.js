const express = require("express");
const tourController = require("./../controllers/tourController");

const router = express.Router();
// router.param("id", tourController.checkID); // Para obtener un parametro exclusivo, se le ingresan cuatro parametros diferentes.
// Create a checkbody middleware
// Check if body contains the name and price property
// If not, send 400 (bad request)
// Add it to the post handler stack
// router.param("name", tourController.checkBody);
router.route("/tour-stats").get(tourController.getTourStats);
router.route("/monthly-plan/:year").get(tourController.getMonthlyPlan);
router.route("/top-5-cheap").get(tourController.aliasTopTour, tourController.getAllTours);
router
  .route("/")
  .get(tourController.getAllTours)
  .post(tourController.createTour);
  

router
  .route("/:id")
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
