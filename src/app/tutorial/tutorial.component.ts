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
                    "# Make sure to import these packages for communication\nimport sys\nimport time\n\n# We're going to be using this function to send our messages to the car\ndef sendCommand(command):\n    print command\n    sys.stdout.flush()\n\n# Cars have 10 sensors\nnumber_sensors = 10\n# The range of the sensors is 3\nsensor_range = 3\n\n# Rev up the car's engine to make it move forward\nsendCommand(\"set engineForce 1.0\")\n\n# This function will parse the car sensor input\ndef get_sensor_output():\n    sendCommand(\"get rays\") # This requests the ray distances from the race car\n    sensor_output = []\n    for i in range(number_sensors):\n        next_ray = sys.stdin.readline() # Each ray distance is read from standard input\n        sensor_output += [float(next_ray.split()[1])] # Add the ray distance to our collection\n    return sensor_output; # Return all the ray distances\n\n# The definition for when an object is too close\nmin_object_distance = sensor_range / 2.0\ndef object_too_close(sensor_a, sensor_b):\n    print sensor_a\n    print (sensor_a < min_object_distance)\n    return (sensor_a < min_object_distance) or (sensor_b < min_object_distance)\n\nwhile (True):\n    # Get the sensor input\n    sensor_output = get_sensor_output()\n    if object_too_close(sensor_output[4], sensor_output[5]):\n        # There is an obstacle in the way, reverse!\n        sendCommand(\"set engineForce -1.0\")\n    else:\n        # The path is clear, drive on!\n        sendCommand(\"set engineForce 1.0\")\n\n# Now you've got a race car that reacts to changes in the environment!\n"]
    tutorial: Tutorials = {
        a: false,
        b: false,
        c: false
    };

    numTutorials = 3;
    tutorialSimIDBase = 100;

    constructor(private codeEditorService: CodeEditorService) { }

  ngOnInit() {
      this.codeEditorService.loadCodeEditor("tut1Editor", 1);
      this.codeEditorService.postCode(this.tutorialCode[1-1], 1);
      this.codeEditorService.loadCodeEditor("tut2Editor", 2);
      this.codeEditorService.postCode(this.tutorialCode[2-1], 2);
  }

    tutorial1() {
        return this.tutorial.a;
    }
    tryTutorial(num) {
        this.tutorial.a = !this.tutorial.a;
        let canvasName = "TutorialCanvas" + num;
        let x : any = document.getElementById(canvasName);
        x.height = 500;

        // document.getElementById(canvasName).height = 500;
        communication.initGraphics(canvasName);
        communication.init(this.tutorialSimIDBase + num);
        console.log(this.codeEditorService.getCode(num))
        communication.runTutorial(this.codeEditorService.getCode(num), num);
    }
}
