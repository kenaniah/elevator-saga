_=
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
        this.dispatchTo(lift, floorNum)
      })

      lift.on("passing_floor", (floorNum, direction) => {
        console.log(`Lift #${idx} - now passing floor #${floorNum} heading ${direction} capacity ${lift.loadFactor() * 100}%`)
      })

      lift.on("stopped_at_floor", (floorNum) => {
        console.log(`Lift #${idx} - stopped at floor #${floorNum} capacity ${lift.loadFactor() * 100}%`)
      })

    })

    // Register listeners for each of the floors
    floors.forEach((floor, idx) => {
      floor.on("up_button_pressed", () => {
        console.log(`Floor #${floor.floorNum()} - up pressed`)
        this.schedulePickup(elevators, floor, "up")
      })
      floor.on("down_button_pressed", () => {
        console.log(`Floor #${floor.floorNum()} - down pressed`)
        this.schedulePickup(elevators, floor, "down")
      })
    })

    // Report total capacity
    console.log(`Total passenger capacity: ${this.maxPassengers}`)

  },
  update: function(dt, elevators, floors) {
    // We normally don't need to do anything here
  },
  schedulePickup: function(elevators, floor, direction) {
    // Determine which lift based on proximity, route, capacity
    // Dispatch the lift to that floor
    lift = elevators[0]
    this.dispatchTo(lift, floor.floorNum())
  },
  dispatchTo: function(lift, floorNum) {
    lift.goToFloor(floorNum)
  },
}
