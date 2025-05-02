export type Polarity = "joy" | "anger" | "sadness" | "fear" | "surprise";

/** ごく少量サンプル。実際は CSV などで拡張可 */
export const JA_SENTI_DICT: Record<string, Polarity> = {
  嬉しい: "joy",
  楽しい: "joy",
  幸せ: "joy",
  怒る: "anger",
  ムカつく: "anger",
  悲しい: "sadness",
  落ち込む: "sadness",
  怖い: "fear",
  不安: "fear",
  驚いた: "surprise",
  びっくり: "surprise",
};
