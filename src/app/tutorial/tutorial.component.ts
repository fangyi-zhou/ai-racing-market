import { Component, OnInit } from '@angular/core';
import {ScriptService} from '../scripts/script.service';
import { Script } from '../scripts/script';
import { AuthService } from '../auth.service';
import {CodeEditorService} from "../code-editor.service";

declare var communication: any;

interface Tutorials {
    a: boolean;
    b: boolean;
    c: boolean;
}

@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.component.html',
  styleUrls: ['./tutorial.component.css'],
  providers: [CodeEditorService]
})
export class TutorialComponent implements OnInit {

    tutorialCode = ["# Make sure to import these packages for communication\nimport sys\nimport time\n\n# We're going to be using this function to send our messages to the car\ndef sendCommand(command):\n    print command\n    sys.stdout.flush()\n\n# Now rev up the car's engine to make it move forward\nsendCommand(\"set engineForce 0.35\")\ntime.sleep(1.0)\n\n# Now move the steering wheel to the left\nsendCommand(\"set steerValue 0.2\")\ntime.sleep(1.0)\n\n# Now move the steering wheel to the right\nsendCommand(\"set steerValue -0.2\")\ntime.sleep(3.0)\n\n# And that's it, you're done! Run this and you'll see your car drive on it's own!",
                    "# Make sure to import these packages for communication\nimport sys\nimport time\n\n# We're going to be using this function to send our messages to the car\ndef sendCommand(command):\n    print command\n    sys.stdout.flush()\n\n# Cars have 10 sensors\nnumber_sensors = 10\n# The range of the sensors is 3\nsensor_range = 3\n\n# Rev up the car's engine to make it move forward\nsendCommand(\"set engineForce 1.0\")\n\n# This function will parse the car sensor input\ndef get_sensor_output():\n    sendCommand(\"get rays\") # This requests the ray distances from the race car\n    sensor_output = []\n    for i in range(number_sensors):\n        next_ray = sys.stdin.readline() # Each ray distance is read from standard input\n        sensor_output += [float(next_ray.split()[1])] # Add the ray distance to our collection\n    return sensor_output; # Return all the ray distances\n\n# The definition for when an object is too close\nmin_object_distance = sensor_range / 2.0\ndef object_too_close(sensor_a, sensor_b):\n    print sensor_a\n    print (sensor_a < min_object_distance)\n    return (sensor_a < min_object_distance) or (sensor_b < min_object_distance)\n\nwhile (True):\n    # Get the sensor input\n    sensor_output = get_sensor_output()\n    if object_too_close(sensor_output[4], sensor_output[5]):\n        # There is an obstacle in the way, reverse!\n        sendCommand(\"set engineForce -1.0\")\n    else:\n        # The path is clear, drive on!\n        sendCommand(\"set engineForce 1.0\")\n\n# Now you've got a race car that reacts to changes in the environment!\n",
                    "# /****************** Imports ****************************/\nimport sys\n\ndef sendCommand(command):\n    print command\n    sys.stdout.flush()\n\nsendCommand(\"Loading child..\")\n\nimport time\nimport numpy as np\nimport math\n\n# /******************* Creature Class **********************/\n\"\"\" Creature class \"\"\"\n\nimport random as rd\nimport numpy as np\nimport math\n\nclass Creature:\n    # All creatures move at a constant speed\n\n    def __init__(self, config):\n        # Characteristics\n        self.life = 0\n        self.positive_life = 0\n        self.scale = 0\n        self.max_engine_force = 1\n        self.max_steer_force = 2\n\n        # Genome\n        self.weights = self.create_weights(config)\n\n    def create_weights(self, config):\n        mat_list = []\n        for i in range(len(config)-1):\n            mat_list.append(np.random.rand(config[i+1], config[i]) - np.full((config[i+1], config[i]), 0.5))\n        return mat_list\n\n    def feed_forward(self, inputs):\n        # Apply weights to inputs to get (output == angle)\n        for weight in self.weights:\n            inputs = np.array(np.mat(weight)* np.mat(inputs))\n            inputs = inputs\n            # inputs = self.sigmoid(inputs)\n        return inputs\n\n    def sigmoid(self, x):\n        return 1 / (1 + math.e**(-x))\n\n    def step(self, inputs):\n        out = self.feed_forward(inputs)\n        sendCommand(\"set engineForce \" + str(self.max_engine_force * (out[0][0])))\n        sendCommand(\"set steerValue \" + str(self.max_steer_force * (out[1][0])))\n        sendCommand(\"world step\");\n\n# /******************* Genetics Class **********************/\n\nimport random\nimport copy\n\ndef crossover_mutate(creatures, mutation_rate):\n  #Calculate fitness scale for each creature to determine how likely they are to pass on their genes\n  #Find mininum fitness\n  min_fitness = sys.maxint\n  for creature in creatures:\n    creature.life = creature.life * creature.life\n    min_fitness = min(min_fitness, creature.life)\n  #Positive shift life to remove any negative life\n  for creature in creatures:\n    creature.positive_life = creature.life - min_fitness\n  #Find total fitness of all creatures\n  total_positive_life = sum(creature.positive_life for creature in creatures)\n  if total_positive_life != 0:\n    for creature in creatures:\n      #Find proportion of total life that creature held (i.e. their gene share)\n      creature.scale = creature.positive_life / total_positive_life\n  else: #Edge case: total_life = 0 would incur a divide by 0\n    num_creatures = len(creatures)\n    for creature in creatures:\n      #All creatures must have attained 0 life so should be given equal gene shares\n      creature.scale = 1 / num_creatures\n\n  copy_creatures = copy.deepcopy(creatures) #Deep copy creatures\n  sorted_parents = sorted(copy_creatures, key=lambda x: x.life) #Sort copied creatures to serve as parents\n  new_creatures = sorted(creatures, key=lambda x: x.life)       #Sort original creatures to serve as new creatures\n\n  for creature_index, new_creature in enumerate(new_creatures):\n    for layer_index, layer in enumerate(new_creature.weights):\n      for row_index, row in enumerate(layer):\n        for gene_index, gene in enumerate(row):\n          mutation_chooser = random.uniform(0, 1)\n          if mutation_chooser < mutation_rate:\n            new_creatures[creature_index].weights[layer_index][row_index][gene_index] = random.uniform(0, 1) - 0.5\n            break\n          parent_chooser = random.uniform(0, 1)\n          cumulated_probability = 0\n          for possible_parent in sorted_parents:\n            cumulated_probability += possible_parent.scale\n            if cumulated_probability > parent_chooser:\n              new_creatures[creature_index].weights[layer_index][row_index][gene_index] = possible_parent.weights[layer_index][row_index][gene_index]\n              break\n  return new_creatures\n\n\nnumber_of_steps_per_episode = 4000\nnumber_of_episodes = 250\ntotal_learning_steps = number_of_episodes * number_of_steps_per_episode\nnumber_of_creatures = 25\nnumber_sensors_per_creature = 10\nsensor_length = 3\ncreatures = []\n\nsendCommand('Evolution starting')\nstep = 0\naverage_scores = []\n\nfor i in range(number_of_creatures):\n    creatures.append(Creature([number_sensors_per_creature, 4, 2]))\n\n# sensory_input1 = np.random.rand(number_sensors_per_creature, 1)\n# sensory_input1 = np.full((number_sensors_per_creature, 1), 0.0)\n# # print creatures[0].weights\n# print creatures[0].feed_forward(sensory_input1)\n# sensory_input1 = np.full((number_sensors_per_creature, 1), 0.5)\n# print creatures[0].feed_forward(sensory_input1)\n# sensory_input1 = np.full((number_sensors_per_creature, 1), 1)\n# print creatures[0].feed_forward(sensory_input1)\n# for mat in creatures[0].weights:\n#     print np.asarray(mat.tolist())\n#     print mat\n\ndef sendCommandDelay(command):\n    print command\n    time.sleep(0.01)\n    sys.stdout.flush()\n    time.sleep(0.01)\n\ndef print_weights():\n    sorted_parents = sorted(creatures, key=lambda x: -x.life) #Sort copied creatures to serve as parents\n    sendCommandDelay('Best creature life')\n    c = sorted_parents[0]\n    sendCommandDelay(c.life)\n    for mat in c.weights:\n        sendCommandDelay(mat.tolist())\n\ndef get_input():\n    sendCommand('get rays')\n    sensory_input = np.full((number_sensors_per_creature, 1), 0.0)\n    for i in range(number_sensors_per_creature):\n        next_ray = sys.stdin.readline().split()\n        # ray_dist = min(float(next_ray[1]) / sensor_length, 1)\n        ray_dist = float(next_ray[1]) / sensor_length\n        sensory_input[i] = ray_dist\n    # sensory_input = np.random.rand(number_sensors_per_creature, 1)\n    # sendCommand(sensory_input)\n    return sensory_input;\n\ndown_count_max = 600\nfor i in range(number_of_episodes):\n    for creature in creatures:\n        sendCommand('world reset')\n        down_count = 0\n        for j in range(number_of_steps_per_episode):\n            sensory_input = get_input()\n            creature.step(sensory_input)\n\n            sendCommand(\"get speed\")\n            speed = float(sys.stdin.readline())\n            if (speed < 0.001):\n                down_count += 1\n                if (down_count >= down_count_max):\n                    break\n            else:\n                down_count = 0\n\n            # if (i == number_of_episodes - 1):\n            #     time.sleep(0.02)\n        sendCommand('get totalReward')\n        creature.life = float(sys.stdin.readline())\n\n    if (i % 5 == 0):\n        print_weights()\n\n    creatures = crossover_mutate(creatures, 0.05)\n    sendCommand('------------ Training epoch ' + str(i))\n    sendCommand(\"Best fitness: \" + str(creatures[number_of_creatures - 1].life))\n    median_fitness = creatures[int(number_of_creatures / 2)].life\n    average_fitness = 0;\n    for c in creatures:\n      average_fitness += c.life\n      sendCommand(c.life)\n      c.life = 0\n    average_fitness /= number_of_creatures\n    average_scores.append(average_fitness)\n\n    sendCommand(\"Average fitness: \" + str(average_fitness))\n    sendCommand(\"Median fitness: \" + str(median_fitness))\n"]
    tutorial3 = false;

    numTutorials = 3;
    tutorialSimIDBase = 100;

    constructor(private codeEditorService: CodeEditorService) { }

  ngOnInit() {
      this.codeEditorService.loadCodeEditor("tut1Editor", 1);
      this.codeEditorService.postCode(this.tutorialCode[1-1], 1);
      this.codeEditorService.loadCodeEditor("tut2Editor", 2);
      this.codeEditorService.postCode(this.tutorialCode[2-1], 2);
      this.codeEditorService.loadCodeEditor("tut3Editor", 3);
      this.codeEditorService.postCode(this.tutorialCode[3-1], 3);
      let x : any = document.getElementById("tut3Editor");
      x.style.height = "0px";
  }

    revealTutorial3() {
        let x : any = document.getElementById("tut3Editor");
        this.tutorial3 = !this.tutorial3;
        if (this.tutorial3) {
            x.style.height = "300px";
        } else {
            x.style.height = "0px";
        }
    }

    checkTutorial3Revealed() {
        return this.tutorial3;
    }

    tryTutorial(num) {
        let canvasName = "TutorialCanvas" + num;
        let x : any = document.getElementById(canvasName);
        x.height = 300;
        // x.scrollTo();

        // document.getElementById(canvasName).height = 500;
        communication.initGraphics(canvasName);
        communication.init(this.tutorialSimIDBase + num);
        communication.runTutorial(this.codeEditorService.getCode(num), num);
    }
}
