import { ExampleTopics } from "@/components/home/ExampleTopics";
import { HeroNumbers } from "@/components/home/HeroNumbers";
import { TopicForm } from "@/components/home/TopicForm";
import { Logo } from "@/components/ui/Logo";

export default function HomePage() {
  return (
    <main className="relative flex flex-1 flex-col overflow-hidden">
      <HeroNumbers />
      <div className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-10 px-4 py-12 sm:px-6">
        <div>
          <Logo size="lg" />
          <p className="mt-4 max-w-xl text-lg text-mute sm:text-xl">
            Countdowns on absolutely anything. Pick a topic, and we&apos;ll build a dramatic Top 10 with
            pictures, fun facts and sources.
          </p>
        </div>
        <TopicForm />
        <ExampleTopics />
      </div>
      <footer className="relative px-4 pb-6 text-center text-xs text-mute sm:px-6">
        Lists are written by AI and can contain mistakes, so check the sources. Images from Wikimedia Commons and
        Unsplash.
      </footer>
    </main>
  );
}
