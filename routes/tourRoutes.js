const express = require("express");
const tourController = require("./../controllers/tourController");

const router = express.Router();
router.param("id", tourController.checkID); // Para obtener un parametro exclusivo, se le ingresan cuatro parametros diferentes.
// Create a checkbody middleware
// Check if body contains the name and price property
// If not, send 400 (bad request)
// Add it to the post handler stack
router.param("name", tourController.checkBody);
router
  .route("/")
  .get(tourController.getAllTours)
  .post(tourController.checkBody, tourController.createTour);

router
  .route("/:id")
  .get(tourController.getTour)
  .patch(tourController.deleteTour);

module.exports = router;
