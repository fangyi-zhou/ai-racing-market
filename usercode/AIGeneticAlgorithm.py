# /****************** Imports ****************************/
import sys

def sendCommand(command):
    print command
    sys.stdout.flush()

sendCommand("Loading child..")

import time
import numpy as np
import math

# /******************* Creature Class **********************/
""" Creature class """

import random as rd
import numpy as np
import math

class Creature:
    # All creatures move at a constant speed

    def __init__(self, config):
        # Characteristics
        self.life = 0
        self.positive_life = 0
        self.scale = 0
        self.max_engine_force = 0.5
        self.max_steer_force = 0.25

        # Genome
        self.weights = self.create_weights(config)

    def create_weights(self, config):
        mat_list = []
        for i in range(len(config)-1):
            mat_list.append(np.random.rand(config[i+1], config[i]))
        return mat_list

    def feed_forward(self, inputs):
        # Apply weights to inputs to get (output == angle)
        for weight in self.weights:
            inputs = np.array(np.mat(weight)* np.mat(inputs))
            inputs = inputs - 1.55 * len(inputs)
            inputs = self.sigmoid(inputs)
        return inputs

    def sigmoid(self, x):
        return 1 / (1 + math.e**(-x))

    def step(self, inputs):
        out = self.feed_forward(inputs)
        sendCommand("set engineForce " + str(self.max_engine_force * (out[0][0] - 0.5)))
        sendCommand("set steerValue " + str(self.max_steer_force * (out[1][0] - 0.85)))
        sendCommand("world step");

# /******************* Genetics Class **********************/

import random
import copy

def crossover_mutate(creatures, mutation_rate):
  #Calculate fitness scale for each creature to determine how likely they are to pass on their genes
  #Find mininum fitness
  min_fitness = sys.maxint
  for creature in creatures:
    min_fitness = min(min_fitness, creature.life)
  #Positive shift life to remove any negative life
  for creature in creatures:
    creature.positive_life = creature.life - min_fitness
  #Find total fitness of all creatures
  total_positive_life = sum(creature.positive_life for creature in creatures)
  if total_positive_life != 0:
    for creature in creatures:
      #Find proportion of total life that creature held (i.e. their gene share)
      creature.scale = creature.positive_life / total_positive_life
  else: #Edge case: total_life = 0 would incur a divide by 0
    num_creatures = len(creatures)
    for creature in creatures:
      #All creatures must have attained 0 life so should be given equal gene shares
      creature.scale = 1 / num_creatures

  copy_creatures = copy.deepcopy(creatures) #Deep copy creatures
  sorted_parents = sorted(copy_creatures, key=lambda x: x.life) #Sort copied creatures to serve as parents
  new_creatures = sorted(creatures, key=lambda x: x.life)       #Sort original creatures to serve as new creatures

  for creature_index, new_creature in enumerate(new_creatures):
    for layer_index, layer in enumerate(new_creature.weights):
      for row_index, row in enumerate(layer):
        for gene_index, gene in enumerate(row):
          mutation_chooser = random.uniform(0, 1)
          if mutation_chooser < mutation_rate:
            new_creatures[creature_index].weights[layer_index][row_index][gene_index] = random.uniform(0, 1)
            break
          parent_chooser = random.uniform(0, 1)
          cumulated_probability = 0
          for possible_parent in sorted_parents:
            cumulated_probability += possible_parent.scale
            if cumulated_probability > parent_chooser:
              new_creatures[creature_index].weights[layer_index][row_index][gene_index] = possible_parent.weights[layer_index][row_index][gene_index]
              break
  return new_creatures


number_of_steps_per_episode = 3000
number_of_episodes = 500
total_learning_steps = number_of_episodes * number_of_steps_per_episode
number_of_creatures = 20
number_sensors_per_creature = 10
sensor_length = 5
creatures = []

sendCommand('Evolution starting')
step = 0
average_scores = []

for i in range(number_of_creatures):
    creatures.append(Creature([number_sensors_per_creature, 2]))

# sensory_input1 = np.random.rand(number_sensors_per_creature, 1)
# sensory_input1 = np.full((number_sensors_per_creature, 1), 1)
# print creatures[0].feed_forward(sensory_input1)

def get_input():
    sendCommand('get rays')
    sensory_input = np.full((number_sensors_per_creature, 1), 0.0)
    for i in range(number_sensors_per_creature):
        next_ray = sys.stdin.readline().split()
        ray_dist = min(float(next_ray[1]) / sensor_length, 1)
        sensory_input[i] = ray_dist
    # sensory_input = np.random.rand(number_sensors_per_creature, 1)
    sys.stdout.flush()
    return sensory_input;

for i in range(number_of_episodes):

    for creature in creatures:
        sendCommand('world reset')
        for j in range(number_of_steps_per_episode):
            sensory_input = get_input()
            creature.step(sensory_input)
        sendCommand('get totalReward')
        creature.life = float(sys.stdin.readline())

    creatures = crossover_mutate(creatures, 0.01)
    sendCommand('------------ Training epoch ' + str(i))
    sendCommand("Best fitness: " + str(creatures[number_of_creatures - 1].life))
    median_fitness = creatures[int(number_of_creatures / 2)].life
    average_fitness = 0;
    for c in creatures:
      average_fitness += c.life
      sendCommand(c.life)
      c.life = 0
    average_fitness /= number_of_creatures
    average_scores.append(average_fitness)

    sendCommand("Average fitness: " + str(average_fitness))
    sendCommand("Median fitness: " + str(median_fitness))

for c in creatures:
    sendCommand(c.weights)
