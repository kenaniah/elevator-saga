_= 
{
  maxPassengers: 0,
  maxLifts: 10,
  goal: "speed", // Optimize for moves or speed
  init: function(elevators, floors) {

    console.clear()

    num_lifts = Math.min(this.maxLifts, elevators.length)
    idle_spacing = floors.length / num_lifts

    // Register listeners for each of the lifts
    elevators.forEach((lift, idx) => {

      // Augment the lift object
      lift.idx = idx
      lift.enabled = true
      lift.idleFloor = 0
      lift.isFull = function() {
        count = this.maxPassengerCount()
        threshold = (count - 1) / count
        full = this.loadFactor() >= threshold
        if(full) console.log("... lift", this.idx, "is full", `capacity ${this.loadFactor() * 100}%`);
        return full
      }

      // Disable lifts if goal is movement-constrained
      if(idx >= this.maxLifts) {
        lift.enabled = false
        lift.goingUpIndicator(false)
        lift.goingDownIndicator(false)
        return
      }

      // Set the default idle floor per lift
      if(this.goal != "moves") {
        lift.idleFloor = Math.round(idx * idle_spacing)
      }

      // Determine the maximum capacity across all lifts
      this.maxPassengers += lift.maxPassengerCount()
      console.log("Lift", idx, "can carry max", lift.maxPassengerCount(), "passenger(s)")

      lift.on("idle", (floorNum) => {
        console.log("Lift", idx, "- now idle")
        if(lift.currentFloor() != lift.idleFloor) this.dispatchTo(lift, lift.idleFloor)
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
        this.cancelPickup(elevators, floorNum)
      })

      // Initial floor selection
      if(lift.enabled && this.goal != "moves"){
        lift.goToFloor(lift.idleFloor)
      }

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
    // TODO: cancel pickups if the elevator is full
  },
  schedulePickup: function(elevators, floor, direction) {

    lift = null
    floorNum = floor.floorNum()

    // Search for the closest lift (with capacity) either stopped or heading in that direction
    lift = elevators
      .filter(lift => lift.enabled)
      .filter(lift => !lift.isFull())
      .filter(lift => lift.destinationDirection() == "stopped" || ((lift.destinationDirection() == "up") != (lift.currentFloor() > floorNum)))
      .sort((a, b) => Math.abs(a.currentFloor() - floorNum) - Math.abs(b.currentFloor() - floorNum))[0]

    // Otherwise, find the lift with the least capacity
    lift = lift || elevators.filter(lift => lift.enabled).sort((a, b) => a.loadFactor() - b.loadFactor())[0]

    // If we're close to full, ignore the call
    if(lift.isFull()) {
      console.log("... ignoring pickup for floor", floorNum, "as lift", lift.idx, "is full", `capacity ${lift.loadFactor() * 100}%`)
      return
    } 

    // If we're not full and movement-constrainted, ignore the call
    if(lift.loadFactor < 0.75 && this.goal == "moves") {
      console.log("... ignoring pickup for floor", floorNum, "as lift", lift.idx, "is not yet fully occupied", `capacity ${lift.loadFactor() * 100}%`)
      return
    }

    // Dispatch it
    this.dispatchTo(lift, floorNum)

  },
  dispatchTo: function(lift, floorNum) {
    console.log("... dispatched lift", lift.idx, "to floor", floorNum, `capacity ${lift.loadFactor() * 100}%`)
    lift.goToFloor(floorNum)
  },
  removeStop: function(lift, floorNum) {
    console.log("... removing stop:", floorNum)
    lift.destinationQueue = lift.destinationQueue.filter(stop => stop != floorNum)
    lift.checkDestinationQueue()
    console.log("... destination queue:", lift.destinationQueue)
  },
  cancelPickup: function(elevators, floorNum) {
    elevators
      .filter(lift => lift.destinationQueue.includes(floorNum))
      .filter(lift => !lift.getPressedFloors().includes(floorNum))
      .forEach(lift => {
        console.log("Lift", lift.idx, "- cancelling pickup")
        this.removeStop(lift, floorNum)
      })
  }
}
