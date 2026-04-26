import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { DoorOpen, User, IdCard, ShieldCheck, CheckSquare, Trophy } from "lucide-react";

import { getHealthStatus, postChatMessage } from "../services/api";
import Logo from "./Logo";

const electionStages = ["Registration", "Campaign", "Voting", "Counting"];
const defaultCurrentStage = "Voting";
const votingExperienceSteps = [
  {
    id: "entry",
    title: "Arrival & Entry",
    description: "Step into the polling place, find your booth, and get oriented.",
    Icon: DoorOpen,
    badgeClass: "bg-blue-600 text-white",
    iconClass: "text-blue-600",
    accentClass: "bg-blue-50"
  },
  {
    id: "verification",
    title: "Identity Check",
    description: "Show your ID and confirm your registration with election staff.",
    Icon: IdCard,
    badgeClass: "bg-indigo-600 text-white",
    iconClass: "text-indigo-600",
    accentClass: "bg-indigo-50"
  },
  {
    id: "marking",
    title: "Voter Marking",
    description: "Receive your mark and follow the official instructions.",
    Icon: ShieldCheck,
    badgeClass: "bg-sky-600 text-white",
    iconClass: "text-sky-600",
    accentClass: "bg-sky-50"
  },
  {
    id: "voting",
    title: "Cast Your Vote",
    description: "Use the ballot or machine to make your selection securely.",
    Icon: CheckSquare,
    badgeClass: "bg-emerald-600 text-white",
    iconClass: "text-emerald-600",
    accentClass: "bg-emerald-50"
  }
];

const journeySteps = [
  {
    id: "registration",
    title: "Registration",
    description: "Confirm your voter registration and review local eligibility rules.",
    Icon: IdCard,
    status: "complete"
  },
  {
    id: "prepare",
    title: "Preparation",
    description: "Gather ID, polling details, and everything you need for voting day.",
    Icon: User,
    status: "active"
  },
  {
    id: "vote",
    title: "Vote",
    description: "Cast your ballot in a secure, official process with confidence.",
    Icon: CheckSquare,
    status: "upcoming"
  },
  {
    id: "results",
    title: "Confirmation",
    description: "Review your final next steps after voting is complete.",
    Icon: Trophy,
    status: "upcoming"
  }
];

const starterMessage = {
  id: 1,
  role: "bot",
  heading: "Welcome to Electo",
  text:
    "Electo helps you understand elections clearly.\n\n- Check whether you are eligible to vote.\n- Review the election steps in the right order.\n- Understand what happens on voting day."
};

const featureCards = [
  {
    id: "eligibility",
    href: "https://www.usa.gov/register-to-vote",
    title: "Check Eligibility",
    description: "Verify whether you can vote and what you need before election day.",
    cta: "Learn More"
  },
  {
    id: "steps",
    href: "https://www.usa.gov/election-office",
    title: "Election Steps",
    description: "See the full election journey from registration to voting.",
    cta: "See Steps"
  },
  {
    id: "guide",
    href: "https://www.usa.gov/voting",
    title: "Voting Day Guide",
    description: "Understand what happens at the polling station and how to prepare.",
    cta: "Explore Guide"
  }
];

const menuItems = [
  { label: "Home", href: "#home" },
  { label: "How it Works", href: "#features" },
  { label: "FAQ", href: "#faq" }
];

function AppShell() {
  const { pathname } = useLocation();
  const [messages, setMessages] = useState([starterMessage]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [isCheckingHealth, setIsCheckingHealth] = useState(true);
  const [timeline, setTimeline] = useState({
    stages: electionStages,
    currentStage: defaultCurrentStage
  });
  const [activeCard, setActiveCard] = useState("");
  const featureSectionRef = useRef(null);
  const chatSectionRef = useRef(null);
  const chatBottomRef = useRef(null);
  const hasScrolledMessagesRef = useRef(false);

  const currentStageIndex = Math.max(
    timeline.stages.indexOf(timeline.currentStage),
    0
  );
  const progressWidth = `${
    ((currentStageIndex + 1) / timeline.stages.length) * 100
  }%`;
  const journeyProgress = `${Math.round(
    ((journeySteps.findIndex((step) => step.status === "active") + 1) /
      journeySteps.length) *
      100
  )}%`;

  useLayoutEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    const scrollToTop = () => window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    window.history.scrollRestoration = "manual";
    scrollToTop();

    const animationFrameId = window.requestAnimationFrame(scrollToTop);
    window.addEventListener("load", scrollToTop);
    window.addEventListener("pageshow", scrollToTop);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("load", scrollToTop);
      window.removeEventListener("pageshow", scrollToTop);
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, [pathname]);

  useEffect(() => {
    let isMounted = true;

    async function checkBackendHealth() {
      setIsCheckingHealth(true);

      try {
        await getHealthStatus();
        if (isMounted) {
          setIsBackendConnected(true);
        }
      } catch (error) {
        if (isMounted) {
          setIsBackendConnected(false);
        }
      } finally {
        if (isMounted) {
          setIsCheckingHealth(false);
        }
      }
    }

    checkBackendHealth();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hasScrolledMessagesRef.current) {
      hasScrolledMessagesRef.current = true;
      return;
    }

    chatBottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  function scrollToSection(sectionRef) {
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function sendMessage(messageText, selectedCardId = "") {
    const trimmedMessage = messageText.trim();
    if (!trimmedMessage || isSending) {
      return;
    }

    if (selectedCardId) {
      setActiveCard(selectedCardId);
    }

    const userMessage = {
      id: Date.now(),
      role: "user",
      text: trimmedMessage
    };

    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setInputValue("");
    setIsSending(true);

    try {
      const data = await postChatMessage({ message: trimmedMessage });
      setIsBackendConnected(true);
      setTimeline({
        stages: electionStages,
        currentStage: data.state?.current_stage || defaultCurrentStage
      });

      const botMessage = {
        id: Date.now() + 1,
        role: "bot",
        heading: formatHeading(data.state?.topic),
        text: data.response || "No response received from the backend."
      };

      setMessages((currentMessages) => [...currentMessages, botMessage]);

    } catch (error) {
      setIsBackendConnected(false);

      const failedMessage = {
        id: Date.now() + 1,
        role: "bot",
        heading: "Connection Problem",
        text:
          `${error.message}\n\n- Check that FastAPI is running on http://127.0.0.1:8000\n- Restart the frontend dev server after backend changes\n- Confirm VITE_API_BASE_URL is set correctly\n- Try your action again`
      };

      setMessages((currentMessages) => [...currentMessages, failedMessage]);
    } finally {
      setIsSending(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await sendMessage(inputValue);
  }

  async function handleCardClick(card) {
    await sendMessage(card.message, card.id);
  }

  function formatHeading(topic) {
    if (topic === "eligibility") {
      return "Eligibility Guide";
    }

    if (topic === "registration") {
      return "Election Steps";
    }

    if (topic === "voting") {
      return "Voting Process";
    }

    return "Election Help";
  }

  function renderCardIcon(cardId) {
    if (cardId === "eligibility") {
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 3l7 3v5c0 4.5-2.8 7.8-7 10-4.2-2.2-7-5.5-7-10V6l7-3z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    }

    if (cardId === "steps") {
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M8 6h11" />
          <path d="M8 12h11" />
          <path d="M8 18h11" />
          <circle cx="4.5" cy="6" r="1" fill="currentColor" stroke="none" />
          <circle cx="4.5" cy="12" r="1" fill="currentColor" stroke="none" />
          <circle cx="4.5" cy="18" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    }

    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 4h12v16H6z" />
        <path d="M9 8h6" />
        <path d="M9 12h6" />
        <path d="M12 16h.01" />
      </svg>
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#eff6ff_0%,#f8fafc_30%,#ffffff_100%)] text-slate-900">
      <div className="mx-auto flex max-w-7xl flex-col px-4 pb-12 pt-4 sm:px-6 lg:px-8">
        <header
          id="home"
          className="sticky top-4 z-20 rounded-full border border-gray-200 bg-white/90 px-6 py-4 shadow-sm backdrop-blur section-fade-in"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Logo variant="full" size="md" />

            <nav className="flex flex-wrap gap-3 text-sm font-medium text-gray-600">
              <Link
                to="/"
                className="rounded-full px-3 py-2 transition duration-300 hover:bg-gray-100 hover:text-blue-700"
              >
                Home
              </Link>
              {menuItems.slice(1).map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="rounded-full px-3 py-2 transition duration-300 hover:bg-gray-100 hover:text-blue-700"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </header>

        <section className="section-fade-in mt-8 overflow-hidden rounded-[2rem] bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-16 text-center text-white shadow-[0_24px_60px_rgba(37,99,235,0.28)] sm:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-100">
            Electo
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Understand elections with confidence
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg font-medium text-blue-100">
            Electo gives voters practical guidance, clear next steps, and a
            professional experience that feels like a real civic product.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              className="rounded-lg bg-white px-6 py-3 font-medium text-blue-700 transition duration-300 hover:scale-105 hover:bg-blue-50 active:scale-95"
              onClick={() => scrollToSection(featureSectionRef)}
            >
              Get Started
            </button>
            <button
              type="button"
              className="rounded-lg border border-white/30 bg-transparent px-6 py-3 font-medium text-white transition duration-300 hover:scale-105 hover:bg-white/10 active:scale-95"
              onClick={() => scrollToSection(chatSectionRef)}
            >
              Open Chat
            </button>
          </div>
        </section>

        <section id="features" ref={featureSectionRef} className="section-fade-in py-12">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
              How It Works
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              Choose what you want help with
            </h2>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-gray-600">
              Start with a focused entry point. Every card triggers a real route,
              opens a dedicated page, and keeps the chat assistant in sync.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {featureCards.map((card) => (
              <a
                key={card.id}
                href={card.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-2xl border border-gray-100 bg-white p-6 text-left shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  {renderCardIcon(card.id)}
                </div>

                <h3 className="mt-4 text-lg font-semibold text-gray-800">
                  {card.title}
                </h3>

                <p className="mt-2 text-sm font-medium text-gray-500">
                  {card.description}
                </p>

                <div className="mt-4 flex items-center justify-between text-blue-600 font-medium">
                  <span>{card.cta}</span>
                  <span className="text-sm">{"->"}</span>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="section-fade-in py-6">
          <div className="rounded-[2rem] border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
                Election Journey
              </p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                Guided election progress
              </h2>
              <p className="mt-3 text-sm font-medium leading-7 text-gray-600">
                Follow a clear, professional journey from registration through election confirmation.
              </p>
            </div>

            <div className="mb-8 rounded-[1.75rem] bg-slate-50 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Progress
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {journeySteps.find((step) => step.status === "active")?.title}
                  </p>
                </div>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                  {journeySteps.filter((step) => step.status === "complete").length} of {journeySteps.length} completed
                </span>
              </div>
              <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-300"
                  style={{ width: journeyProgress }}
                />
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-4">
              {journeySteps.map((step) => {
                const isCompleted = step.status === "complete";
                const isActive = step.status === "active";

                return (
                  <div
                    key={step.id}
                    className={`group rounded-[1.75rem] border p-6 transition duration-300 ${
                      isActive
                        ? "border-blue-200 bg-blue-50 shadow-lg"
                        : "border-gray-100 bg-white shadow-sm hover:-translate-y-1 hover:shadow-xl"
                    }`}
                  >
                    <div
                      className={`mb-5 flex h-14 w-14 items-center justify-center rounded-3xl ${
                        isActive ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      <step.Icon className="h-6 w-6" />
                    </div>
                    <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${isActive ? "text-blue-700" : "text-slate-500"}`}>
                      {isCompleted ? "Completed" : isActive ? "In progress" : "Upcoming"}
                    </p>
                    <h3 className="mt-3 text-xl font-semibold text-slate-900">{step.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{step.description}</p>
                    <div className="mt-6 flex items-center gap-2 text-sm font-semibold">
                      <span
                        className={`rounded-full px-2 py-1 ${
                          isCompleted
                            ? "bg-slate-200 text-slate-700"
                            : isActive
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {isCompleted ? "Done" : isActive ? "Current" : "Next"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="rounded-2xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-blue-600 hover:-translate-y-0.5"
              >
                Start Journey
              </button>
              <p className="text-sm text-slate-500">
                A guided, professional view of the election journey with meaningful progress signals.
              </p>
            </div>
          </div>
        </section>

        <section className="section-fade-in py-6">
          <div className="rounded-[2rem] border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
                Voting Experience
              </p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                What happens on voting day
              </h2>
              <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-gray-600">
                This timeline gives a clearer and more guided view of what to expect.
              </p>
            </div>

            <div className="relative overflow-hidden pl-8">
              <div className="absolute left-6 top-10 bottom-0 w-px bg-slate-200" />
              <div className="space-y-6">
                {votingExperienceSteps.map((step, index) => (
                  <div
                    key={step.id}
                    className="relative flex gap-5 rounded-[1.75rem] border border-gray-100 bg-slate-50 p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="absolute left-0 top-6 h-3 w-3 rounded-full bg-blue-600 shadow-sm" />
                    <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-3xl bg-white shadow-sm">
                      <step.Icon className={`${step.iconClass} h-7 w-7`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex h-9 w-9 items-center justify-center rounded-2xl ${step.badgeClass}`}>
                          {index + 1}
                        </span>
                        <h3 className="text-xl font-semibold text-slate-900">{step.title}</h3>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-600">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                className="rounded-2xl bg-indigo-700 px-6 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-indigo-600 hover:-translate-y-0.5"
              >
                Simulate Voting
              </button>
              <p className="text-sm text-slate-500">
                A guided process view that feels less repetitive and more transparent.
              </p>
            </div>
          </div>
        </section>

        <section id="faq" className="section-fade-in py-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">
                FAQ
              </p>
              <h3 className="mt-3 text-xl font-bold text-slate-900">
                Who is Electo for?
              </h3>
              <p className="mt-3 text-sm font-medium leading-7 text-gray-600">
                Anyone who wants a simpler, clearer way to understand election eligibility and voting.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">
                FAQ
              </p>
              <h3 className="mt-3 text-xl font-bold text-slate-900">
                How should I use it?
              </h3>
              <p className="mt-3 text-sm font-medium leading-7 text-gray-600">
                Start with a feature card, review the answer in chat, and ask a follow-up question if you need more detail.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">
                FAQ
              </p>
              <h3 className="mt-3 text-xl font-bold text-slate-900">
                What makes it useful?
              </h3>
              <p className="mt-3 text-sm font-medium leading-7 text-gray-600">
                It turns election guidance into simple, readable steps instead of overwhelming information.
              </p>
            </div>
          </div>
        </section>

        <section ref={chatSectionRef} className="section-fade-in py-12">
          <div className="mx-auto max-w-4xl rounded-[2rem] border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
                Chat Assistant
              </p>
              <h2 className="mt-2 text-center text-3xl font-bold text-slate-900 sm:text-4xl">
                Ask anything about elections
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-center text-base font-medium leading-7 text-gray-600 sm:text-lg">
                Get clear, step-by-step guidance on voting, eligibility, and election processes.
              </p>
            </div>

            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-gray-100 bg-slate-50 px-6 py-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-semibold text-blue-700">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    isCheckingHealth || isSending
                      ? "animate-pulse bg-blue-500"
                      : isBackendConnected
                        ? "bg-emerald-500"
                        : "bg-rose-500"
                  }`}
                />
                {isCheckingHealth
                  ? "Checking backend..."
                  : isSending
                    ? "Typing..."
                    : isBackendConnected
                      ? "Connected"
                      : "Disconnected"}
              </span>
            </div>

            <form className="border-b border-gray-200 bg-white px-6 py-4" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">
                    Ask a Question
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-600">
                    Try: `Check eligibility`, `Show election steps`, or `Voting process`.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    className="min-w-0 flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition duration-300 placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 sm:text-base"
                    type="text"
                    placeholder="Type your election question"
                    value={inputValue}
                    onChange={(event) => setInputValue(event.target.value)}
                    disabled={isSending}
                  />
                  <button
                    className="rounded-2xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition duration-300 hover:scale-[1.02] hover:bg-blue-600 active:scale-95 disabled:opacity-60 sm:text-base"
                    type="submit"
                    disabled={isSending || !inputValue.trim()}
                  >
                    {isSending ? "Sending..." : "Send"}
                  </button>
                </div>
              </div>
            </form>

            <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
              <div className="flex flex-wrap gap-2">
                {featureCards.map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    className={`rounded-full border px-3 py-1 text-sm font-medium text-blue-700 transition duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 active:scale-95 disabled:opacity-60 ${
                      activeCard === card.id
                        ? "border-blue-300 bg-blue-50"
                        : "border-gray-200 bg-white"
                    }`}
                    onClick={() => handleCardClick(card)}
                    disabled={isSending}
                  >
                    {card.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-50 px-6 py-4">
              <div className="flex min-h-full flex-col justify-end gap-4">
                {messages.map((message) => (
                  <article
                    key={message.id}
                    className={`message-fade-in w-full rounded-2xl p-4 shadow-sm ${
                      message.role === "user"
                        ? "ml-auto max-w-[85%] bg-blue-700 text-white"
                        : message.heading === "Connection Problem"
                          ? "mr-auto max-w-full border border-rose-200 bg-rose-50 text-rose-900"
                          : "mr-auto max-w-full border border-gray-200 bg-white text-slate-900"
                    }`}
                  >
                    <span
                      className={`mb-1 inline-block text-xs font-bold uppercase tracking-[0.18em] ${
                        message.role === "user"
                          ? "text-blue-100"
                          : message.heading === "Connection Problem"
                            ? "text-rose-700"
                            : "text-blue-700"
                      }`}
                    >
                      {message.role === "user" ? "You" : "Bot"}
                    </span>

                    {message.heading ? (
                      <h3 className="mb-2 text-base font-semibold">
                        {message.heading}
                      </h3>
                    ) : null}

                    <p
                      className={`whitespace-pre-wrap text-sm font-medium leading-5 ${
                        message.role === "user"
                          ? "text-white"
                          : message.heading === "Connection Problem"
                            ? "text-rose-700"
                            : "text-gray-600"
                      }`}
                    >
                      {message.text}
                    </p>
                  </article>
                ))}

                {isSending ? (
                  <article className="message-fade-in mr-auto w-full max-w-full rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <span className="mb-1 inline-block text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                      Bot
                    </span>
                    <h3 className="mb-2 text-base font-bold text-slate-900">
                      Preparing your answer
                    </h3>
                    <div className="space-y-2">
                      <div className="h-2 w-3/4 animate-pulse rounded-full bg-gray-100" />
                      <div className="h-2 w-2/3 animate-pulse rounded-full bg-gray-100" />
                      <div className="h-2 w-1/2 animate-pulse rounded-full bg-gray-100" />
                    </div>
                  </article>
                ) : null}
                <div ref={chatBottomRef} />
              </div>
            </div>
          </div>
        </section>

        <footer className="section-fade-in py-8 text-center">
          <p className="text-sm font-medium text-gray-500">
            Electo is designed to make election guidance easier to understand.
          </p>
        </footer>
      </div>
    </main>
  );
}

export default AppShell;
