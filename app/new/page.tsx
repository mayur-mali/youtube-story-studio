import { lintAvailable } from "@/lib/lint-availability";
import NewScriptClient from "./NewScriptClient";

export const dynamic = "force-dynamic";

export default function NewScriptPage() {
  return <NewScriptClient canLint={lintAvailable()} />;
}
