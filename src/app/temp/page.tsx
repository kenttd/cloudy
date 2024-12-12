import Random from "@/components/random";
import Sidebarx from "@/components/Sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function App() {
  return (
    <SidebarProvider>
      <Sidebarx user={{ avatar: "abc", email: "email", name: "kents" }} />
      <SidebarInset>
        <Random />
      </SidebarInset>
    </SidebarProvider>
  );
}
