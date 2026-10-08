import { createFileRoute } from "@tanstack/react-router";
import { WizardMascot } from "@/components/wizard-mascot";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <WizardMascot />;
}
