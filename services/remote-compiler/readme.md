# AlgoRace Remote Compiler Service
The AlgoRace Remote Compiler Service is a worker service designed to handle code compilation for AlgoRace, a competitive coding platform. This service is hosted on AWS EC2 and seamlessly integrates with Rabbit MQ for efficient task handling.

## Overview
When a compilation task is submitted, the service leverages a DockerCompiler class to encapsulate the compilation process. The DockerCompiler class assembles the delivered code, along with the necessary metadata, into two files: an executable code file and a test.txt file containing relevant test cases expected output in a dash
seperated format. eg:
test number-output
1-foo
2-bar
3-baz

### Compilation Process
Code Assembly: The delivered code and test cases are assembled into two files, one for the executable code and another for test cases.

Docker Container: The service spawns a Docker container and mounts these files into a volume along with a runner.sh script.

Script Execution: The runner.sh script is executed within the Docker container, running the code file and comparing its stdout to the test cases in the test.txt file.

Output Handling: The output is captured and written to either success.txt or errors.txt, depending on whether an error occurred during the execution.

### Result Notification
The service continuously polls the file system, monitoring for the presence of success.txt or errors.txt. Upon detection, it sends a patch request to the manager service, updating the CompileJob with the correct status and output.

## Getting Started
To use the AlgoRace Remote Compiler Service, follow the setup instructions in the documentation. Ensure that Docker is properly installed on your system.

## Contributions
We welcome contributions! If you have ideas, improvements, or bug fixes, feel free to open an issue or submit a pull request.

Happy coding with AlgoRace! 🚀
