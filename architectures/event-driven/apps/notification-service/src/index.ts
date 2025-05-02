import { kafka } from "@event-driven/kafka";
import {
  type ScoreComputed,
  ScoreComputedSchema,
  Topics,
} from "@event-driven/events";

const consumer = kafka.consumer({ groupId: "notification-service" });

async function kafkaLoop() {
  await consumer.connect();
  await consumer.subscribe({ topic: Topics.ScoreComputed });

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;
      const evt: ScoreComputed = ScoreComputedSchema.parse(
        JSON.parse(message.value.toString()),
      );

      // 実処理：ここではログ出力のみ
      if (evt.scores.motivation < -0.3) {
        console.log(
          `[notify] user=${evt.userId} 😓 stay motivated!`,
          evt.scores,
        );
      }
      if (evt.scores.goal > 0.7) {
        console.log(
          `[notify] user=${evt.userId} 🎯 great progress!`,
          evt.scores,
        );
      }
      if (evt.scores.efficiency > 0.7) {
        console.log(
          `[notify] user=${evt.userId} 🤖 stay efficient!`,
          evt.scores,
        );
      }
      if (evt.scores.creativity > 0.7) {
        console.log(
          `[notify] user=${evt.userId} 🎨 stay creative!`,
          evt.scores,
        );
      }
      if (evt.scores.effort > 0.7) {
        console.log(`[notify] user=${evt.userId} 💪 stay effort!`, evt.scores);
      }
    },
  });
}

kafkaLoop().catch((err) => {
  console.error(err);
  process.exit(1);
});
