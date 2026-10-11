import fs from "fs";
import { exec } from "node:child_process";

/**
 * DockerCompiler is a class that facilitates running user-submitted code within a Docker container.
 *
 * @class DockerCompiler
 */

export default class DockerCompiler {
  /**
   * Creates an instance of DockerCompiler.
   *
   * @constructor
   * @param {string} code - The user's code to be executed.
   * @param {string} lang - The programming language of the code.
   * @param {string} executor - The executor or compiler for the code (e.g., "node").
   * @param {string} fileExt - The file extension of the code file (e.g., ".js").
   * @param {string} dockerImage - The Docker image to run the code.
   */

  constructor(
    jobId,
    code,
    lang,
    executor,
    fileExt,
    dockerImage,
    problem,
    input,
    output,
    caller
  ) {
    this.jobId = jobId;
    this.code = code;
    this.lang = lang;
    this.executor = executor;
    this.fileExt = fileExt;
    this.dockerImage = dockerImage;
    this.problem = problem;
    this.input = input;
    this.output = output;
    this.caller = caller;
    this.fileName = `${this.problem}${this.fileExt}`;
    this.inputFile = `${this.problem}.input${this.fileExt}`;
  }

  /**
   * Runs the DockerCompiler build process to execute the user's code.
   *
   * @param {function} success - The callback function to handle the result of code execution.
   */
  run(success) {
    this.prepare(success);
  }

  /**
   * Prepares the files for execution.
   *
   * @param {function} success - The callback function to handle the result of code execution.
   */

  prepare(success) {

    fs.writeFileSync(`./tests/${this.fileName}`, this.code);
    fs.appendFileSync(
      `./tests/${this.fileName}`,
      this.input
    );
    fs.appendFileSync(`./tests/${this.fileName}`, this.caller);
    fs.writeFileSync(`./tests/${this.problem}.output.txt`, this.output);

    this.execute(success);
  }

  /**
   * Executes the user's code within a Docker container and handles the result.
   *
   * @param {function} success - The callback function to handle the result of code execution.
   */

  execute(success) {
    console.time();
    let start = performance.now();


    // Command to start Docker and the compilation process
    const cmd = `./docker.sh ${this.fileName} ${this.executor} ${this.dockerImage} ${this.fileExt} ${this.problem}.output.txt ${this.problem}.input${this.fileExt}`;

    exec(cmd); //! Async

    console.log('spawned docker')
    const timeout = 10;
    let numberIntervals = 0;

    //* Timer to poll checking for stderr.log, errors.txt, or success.txt from docker container.

    let timer = setInterval(() => {
      numberIntervals++;

      fs.readFile("./temp/success.txt", "utf-8", (err, data) => {
        if (err && numberIntervals < timeout) {
          //* No success.txt found, look for errors.txt

          fs.readFile("./temp/errors.txt", "utf-8", (err, data) => {
            if (err) {
              //* No error.txt found, keep going
              return;
            } else {
              //* Found error.txt, call the CB with error data read from file

              console.log("Found error file");
              exec("rm ./temp/errors.txt");
              console.log("error file deleted");

              let end = performance.now();
              console.log(`Request took ${end - start}ms`);
              success("", data, false);
              clearInterval(timer);
            }
          });
        } else if (err && numberIntervals >= timeout) {
          //* Timeout is up, return timeout error

          console.log("Request timed out. Time limit exceeded");
          success(
            "",
            "Compilation Timeout Occured: Timelimit exceeded.",
            false
          );
          clearInterval(timer);
        } else if (data) {
          //* found success.txt, return the file data to CB
          success("all tests passed!", data, true);
          exec("rm ./temp/success.txt");


          clearInterval(timer);
        }
      });

      console.log(`completed ${numberIntervals} interval`);
    }, 2000); // 1 second intervals
  }

  cleanup() {
    exec("rm ./temp/stderr.log");
    exec("rm ./temp/test.txt/");
    exec("rm ./temp/twoSum.input.mjs");
    exec("rm test.mjs");
  }
}
