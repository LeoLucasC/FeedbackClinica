import type { Metadata } from "next";

import { FeedbackForm } from "@/components/feedback/feedback-form";

export const metadata: Metadata = {
  title: "Cuéntanos de ti | Clínica Bolívar",
  description:
    "Déjanos tus datos y cuéntanos cómo te enteraste de Clínica Bolívar.",
};

export default function FeedbackPage() {
  return <FeedbackForm />;
}
