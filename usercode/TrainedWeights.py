import random as rd
import numpy as np
import math
import sys

number_sensors_per_creature = 10
sensor_length = 3

def sendCommand(command):
    print command
    sys.stdout.flush()

class Creature:
    # All creatures move at a constant speed

    def __init__(self, config):
        # Characteristics
        self.life = 0
        self.positive_life = 0
        self.scale = 0
        self.max_engine_force = 0.2
        self.max_steer_force = 1

        # Genome
        self.weights = self.create_weights(config)

    def create_weights(self, config):
        mat_list = []
        for i in range(len(config)-1):
            mat_list.append(np.random.rand(config[i+1], config[i]) - np.full((config[i+1], config[i]), 0.5))
        return mat_list

    def feed_forward(self, inputs):
        # Apply weights to inputs to get (output == angle)
        for weight in self.weights:
            inputs = np.array(np.mat(weight)* np.mat(inputs))
            inputs = inputs
            # inputs = self.sigmoid(inputs)
        return inputs

    def sigmoid(self, x):
        return 1 / (1 + math.e**(-x))

    def step(self, inputs):
        out = self.feed_forward(inputs)
        sendCommand("set engineForce " + str(self.max_engine_force * (out[0][0])))
        sendCommand("set steerValue " + str(self.max_steer_force * (out[1][0])))
        sendCommand("world step");

layer1 = [[-0.3164229928020217, 0.046697112931872065, 0.2845645125168833, -0.06852127983071954, -0.09137858856189185, -0.023470568569317063, 0.21368532084359837, -0.3767863216961498, -0.1367753358300423, 0.02724419181788329],
          [-0.4503372832517123, -0.10775805725221388, -0.35916881896038444, 0.35009249822735733, -0.2677892016031308, 0.25067958247751865, -0.42553980331885444, 0.387145877928753, -0.28799958842046314, 0.23719208280464132],
          [0.41095728974991896, 0.20479014398146855, -0.25316933926440677, -0.010544110253563499, -0.14996223209979254, 0.022742814408590828, -0.2484337682105816, -0.3805038703847273, -0.39499234750558276, -0.34593934318964703],
          [0.1321885090953493, -0.1942639468642744, -0.43045673776831905, -0.25735394982808557, -0.23761563411937558, 0.12075973678003682, 0.27032211400311423, 0.47904238118255016, -0.3158002534210711, -0.28880075536559846]]
layer2 = [[-0.007377233110597681, -0.2870484942881575, -0.42231461846835516, -0.0678207569947441],
          [0.05243875461350922, -0.1774817782162471, 0.4629329245610636, -0.4407344377370518]]

creature = Creature([number_sensors_per_creature, 4, 2])
creature.weights = [np.asarray(layer1), np.asarray(layer2)]

test_out = creature.feed_forward(np.matrix([1, 1, 1, 1, 1, 1, 0, 0, 0, 0]).T)
# sendCommand(test_out)

def get_input():
    sendCommand('get rays')
    sensory_input = np.full((number_sensors_per_creature, 1), 0.0)
    for i in range(number_sensors_per_creature):
        next_ray = sys.stdin.readline().split()
        ray_dist = float(next_ray[1]) / sensor_length
        sensory_input[i] = ray_dist
    return sensory_input;

while (True):
    sensory_input = get_input()
    creature.step(sensory_input)
