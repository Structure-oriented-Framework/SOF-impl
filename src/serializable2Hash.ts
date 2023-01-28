import { Serializable, safeJsonStringify } from "./serializableType.js";
import { createHash } from "node:crypto";

export type PropsVersion = string;

export function serializable2Hash(v: Serializable): PropsVersion {
  return createHash("sha256").update(safeJsonStringify(v)).digest("hex");
}
