_=
{
  maxPassengers: 0,
  init: function(elevators, floors) {

    console.clear()

    // Register listeners for each of the lifts
    elevators.forEach((lift, idx) => {

      // Store the lift's index (for later reference in logs)
      lift.idx = idx

      // Determine the maximum capacity across all lifts
      this.maxPassengers += lift.maxPassengerCount()
      console.log("Lift", idx, "can carry max", lift.maxPassengerCount(), "passenger(s)")

      lift.on("idle", (floorNum) => {
        console.log("Lift", idx, "- now idle")
      })

      lift.on("floor_button_pressed", floorNum => {
        console.log("Lift", idx, "- requested floor", floorNum, `capacity ${lift.loadFactor() * 100}%`)
        this.dispatchTo(lift, floorNum)
      })

      lift.on("passing_floor", (floorNum, direction) => {
        console.log("Lift", idx, "- now passing floor", floorNum, "heading", direction, `capacity ${lift.loadFactor() * 100}%`)
        // Preemptively at a floor if it was scheduled at some point
        if(lift.destinationQueue.some(stop => stop == floorNum)) {
          this.removeStop(lift, floorNum)
          lift.goToFloor(floorNum, true)
        }
      })

      lift.on("stopped_at_floor", floorNum => {
        console.log("Lift", idx, "- stopped at floor", floorNum, `capacity ${lift.loadFactor() * 100}%`)
        this.removeStop(lift, floorNum)
      })

      // Initial floor selection
      lift.goToFloor(Math.floor(idx * (floors.length / elevators.length)))

    })

    // Register listeners for each of the floors
    floors.forEach((floor, idx) => {
      floor.on("up_button_pressed", () => {
        console.log("Floor", floor.floorNum(), "- up pressed")
        this.schedulePickup(elevators, floor, "up")
      })
      floor.on("down_button_pressed", () => {
        console.log("Floor", floor.floorNum(), "- down pressed")
        this.schedulePickup(elevators, floor, "down")
      })
    })

    // Report total capacity
    console.log("Total passenger capacity:", this.maxPassengers)

  },
  update: function(dt, elevators, floors) {
    // We normally don't need to do anything here
  },
  schedulePickup: function(elevators, floor, direction) {

    lift = null
    floorNum = floor.floorNum()

    // Search for the closest lift (with capacity) either stopped or heading in that direction
    lift = elevators
      .filter(lift => lift.loadFactor() < 0.6)
      .filter(lift => lift.destinationDirection() == "stopped" || ((lift.destinationDirection() == "up") != (lift.currentFloor() > floorNum)))
      .sort((a, b) => Math.abs(a.currentFloor() - floorNum) - Math.abs(b.currentFloor() - floorNum))[0]

    // Otherwise, find the lift with the least capacity
    lift = lift || elevators.sort((a, b) => a.loadFactor() - b.loadFactor())[0]

    // Dispatch it
    this.dispatchTo(lift, floorNum)

  },
  dispatchTo: function(lift, floorNum) {
    console.log("... dispatched lift", lift.idx)
    lift.goToFloor(floorNum)
  },
  removeStop: function(lift, floorNum) {
    console.log("... removing stop:", floorNum)
    lift.destinationQueue = lift.destinationQueue.filter(stop => stop != floorNum)
    lift.checkDestinationQueue()
    console.log("... destination queue:", lift.destinationQueue)
  }
}
