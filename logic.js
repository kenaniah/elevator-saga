_ = // Remove this line when pasting into the editor
{
  maxPassengers: 0,
  init: function(elevators, floors) {

    // Register listeners for each of the lifts
    elevators.forEach((lift, idx) => {

      // Determine the maximum capacity across all lifts
      this.maxPassengers += lift.maxPassengerCount()
      console.log(`Lift #${idx} can carry max ${lift.maxPassengerCount()} passenger(s)`)

      lift.on("idle", (floorNum) => {
        console.log(`Lift #${idx} - now idle`)
      })

      lift.on("floor_button_pressed", (floorNum) => {
        console.log(`Lift #${idx} - requested floor #${floorNum} capacity ${lift.loadFactor() * 100}%`)
      })

      lift.on("passing_floor", (floorNum, direction) => {
        console.log(`Lift #${idx} - now passing floor #${floorNum} heading ${direction} capacity ${lift.loadFactor() * 100}%`)
        console.log(`Lift #${idx} - now passing floor #${floorNum} heading ${direction}`)
      })

      lift.on("stopped_at_floor", (floorNum) => {
        console.log(`Lift #${idx} - stopped at floor #${floorNum} capacity ${lift.loadFactor() * 100}%`)
      })

    })

    // Register listeners for each of the floors
    floors.forEach((floor, idx) => {
      floor.on("up_button_pressed", () => {
        console.log(`Floor #${floor.floorNum()} - up pressed`)
      })
      floor.on("down_button_pressed", () => {
        console.log(`Floor #${floor.floorNum()} - down pressed`)
      })
    })

    // Report on capacity
    console.log(`Total passenger capacity: ${this.maxPassengers}`)

    var elevator = elevators[0]; // Let's use the first elevator

    // Whenever the elevator is idle (has no more queued destinations) ...
    elevator.on("idle", function() {
      // let's go to all the floors (or did we forget one?)
      elevator.goToFloor(0);
      elevator.goToFloor(1);
      elevator.goToFloor(2);
      elevator.goToFloor(1);
    });

  },
  update: function(dt, elevators, floors) {
    // We normally don't need to do anything here
  },
}
