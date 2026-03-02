import { AppProvider } from "@/context/AppContext";
import { Shell } from "@/components/layout/Shell";

export default function UpaUpa() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
