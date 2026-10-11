import amqp from "amqplib/callback_api.js";
import axios from "axios";
import DockerCompiler from "./DockerCompiler.js";
import { languages } from "./languages.js";
import 'dotenv/config';

export const subscribe = async () => {
  const url = process.env.CLOUDAMQP_URL || "amqp://127.0.0.1"
  const managerUrl = process.env.MANAGER_URL || 'http://localhost:7070'
  amqp.connect(url, function(error, connection) {
    if (error) {
      console.log('error connecting to task queue')
      throw error;
    }

    connection.createChannel(function(error, channel) {
      if (error) {
        throw error;
      }
      let queue = "test-q";

      channel.assertQueue(queue, {
        durable: false,
      });

      console.log("Waiting for message");

      channel.consume(
        queue,
        function(msg) {
          const data = JSON.parse(msg.content);
          console.log('worker data', data)
          let idx = languages.findIndex(
            (el) => el.lang === data.problem.language
          );

          console.log(idx)
          let DockCompiler = new DockerCompiler(
            data.jobId,
            data.code,
            languages[idx].lang,
            languages[idx].executor,
            languages[idx].fileExt,
            languages[idx].dockerImage,
            data.problem.filePrefix,
            data.problem.inputCode,
            data.problem.output,
            data.problem.callerCode
          );

          DockCompiler.run(function(stdout, error, success) {
            if (success) {
              console.log("success, patching to manager");
              axios
                .patch(`${managerUrl}/compile`, {
                  jobId: DockCompiler.jobId,
                  update: { status: "completed", output: stdout },
                })
                .then((res) => {
                  console.log('Sent successful update to manager');
                })
                .catch((err) => {
                  console.error(
                    "error caught sending patch to manager service",
                    err
                  );
                });
            } else {
              axios
                .patch(`${managerUrl}/compile`, {
                  jobId: DockCompiler.jobId,
                  update: { status: "failed", output: error },
                })
                .then((res) => {
                  console.log('Sent error message to manager');
                })
                .catch((err) => {
                  console.error(
                    "error caught sending patch to manager service",
                    err
                  );
                });
            }
          });
        },
        {
          noAck: true,
        }
      );
    });
  });
};
