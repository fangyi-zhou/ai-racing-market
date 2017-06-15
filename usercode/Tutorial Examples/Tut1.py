### Introduction:
# Your race car is ready and waiting on the track
# Train it to complete the course!

### Objectives:
# We're going to make it move by powering up the engine
# Then we're going to make it turn left, and then right

# Make sure to import these packages for communication
import sys
import time

# We're going to be using this function to send our messages to the car
def sendCommand(command):
    print command
    sys.stdout.flush()

# Now rev up the car's engine to make it move forward
sendCommand("set engineForce 1.0")

# Now move the steering wheel to the left
sendCommand("set steerForce 1.0")

# Let the car wait for a second
time.sleep(1.0)

# Now move the steering wheel to the right
sendCommand("set steerForce -1.0")

# And that's it, you're done! Run this in Train mode and you'll see your car move forward!
