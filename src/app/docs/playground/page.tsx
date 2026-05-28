import { MantouStudio } from "@/components/flow/MantouStudio";
import { AGENT_GRAPH } from "@/lib/mantou";

export const metadata = {
  title: "Playground — Mantou docs",
  description: "Edit Mantou diagram source and watch reactive styles recompute.",
};

export default function PlaygroundPage() {
  return (
    <div className="mx-auto max-w-[1100px]">
      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#9a3f1a]">
        Try it
      </p>
      <h1 className="mb-2 text-4xl font-black tracking-tight text-[#3a2a20]">
        Playground
      </h1>
      <p className="mb-8 max-w-2xl text-[15px] leading-relaxed text-[#6b5a48]">
        Edit the diagram source, switch samples, and test expressions. Styles
        recompute on every keystroke, selection, and state change.
      </p>
      <MantouStudio initialSource={AGENT_GRAPH} />
    </div>
  );
}
