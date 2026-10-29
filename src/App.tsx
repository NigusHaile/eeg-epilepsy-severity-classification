import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Pipeline } from "@/components/Pipeline";
import { Projects } from "@/components/Projects";
import { Results } from "@/components/Results";
import { SignalLab } from "@/components/SignalLab";
import { ProjectProvider } from "@/hooks/useProject";
import { useSignals } from "@/hooks/useSignals";

export default function App() {
  const lab = useSignals();

  return (
    <ProjectProvider>
      <Header />
      <main>
        <Hero trace={lab.signals[0]?.values} />
        <SignalLab {...lab} />
        <Pipeline />
        <Results />
        <About />
        <Projects />
        <Contact />
      </main>
      <Footer />
    </ProjectProvider>
  );
}
