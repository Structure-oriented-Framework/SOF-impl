import { Serializable, safeJSONStringify } from "./serializableType.js";
import { createHash } from "node:crypto";

export type PropsVersion = string;

export function serializable2Hash(v: Serializable): PropsVersion {
  return createHash("sha256").update(safeJSONStringify(v)).digest("hex");
}
