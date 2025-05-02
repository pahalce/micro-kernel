import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import type { ScoreComputed } from "@event-driven/events";
import { Topics } from "@event-driven/events";
import { kafka } from "@event-driven/kafka";

export const runtime = "nodejs"; // Edge でなく Node runtime を明示

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_req: NextRequest) {
  const consumer = kafka.consumer({ groupId: `web-${Date.now()}` });
  await consumer.connect();
  await consumer.subscribe({
    topic: Topics.ScoreComputed,
    fromBeginning: false,
  });

  const stream = new ReadableStream({
    start(controller) {
      consumer.run({
        eachMessage: async ({ message }) => {
          if (!message.value) return;
          const evt: ScoreComputed = JSON.parse(message.value.toString());
          controller.enqueue(`data: ${JSON.stringify(evt)}\n\n`);
        },
      });
    },
    cancel() {
      consumer.disconnect();
    },
  });

  return new NextResponse(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
