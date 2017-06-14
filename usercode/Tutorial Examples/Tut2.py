### Introduction:
# You know how to move the car
# Now we're going to look at the car's sensors

# Cars have 10 sensors
number_sensors = 10
# The range of the sensors is 3
sensor_range = 3

### Objectives:
# When you drive a car, you use your eyes to avoid obstacles
# We're going to decide how to drive based on the car's sensors
# We'll stop the car if there's an obstacle coming up

# Make sure to import these packages for communication
import sys
import time

# We're going to be using this function to send our messages to the car
def sendCommand(command):
    print command
    sys.stdout.flush()

# Rev up the car's engine to make it move forward
sendCommand("set engineForce 1.0")

# This function will parse the car sensor input
def get_sensor_output():
    sendCommand("get rays") # This requests the ray distances from the race car
    sensor_output = []
    sendCommand("get rays")
    for i in range(number_sensors):
        next_ray = sys.stdin.readline() # Each ray distance is read from standard input
        sensor_output += [next_ray.split()[1]] # Add the ray distance to our collection
    return sensor_output; # Return all the ray distances

# The definition for when an object is too close
min_object_distance = sensor_range / 5
def object_too_close(sensor_a, sensor_b):
    return sensor_a < min_object_distance && sensor_b < min_object_distance

while (true):
    # Get the sensor input
    sensor_output = get_sensor_output()
    if (object_too_close(sensor_output[4], sensor_output[5]):
        # There is an obstacle in the way, reverse!
        sendCommand("set engineForce -1.0")
    else:
        # The path is clear, drive on!
        sendCommand("set engineForce 1.0")

# Now you've got a race car that reacts to changes in the environment!
