import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Page } from "../App";
import { extractDomain, useStore } from "../hooks/useStore";

interface Props {
  onLogin: (role: "student" | "shopOwner") => void;
  navigate: (page: Page, shopId?: string) => void;
}

type Step = "select" | "college" | "company";

const floatingEmojis = [
  {
    id: "f1",
    emoji: "🍕",
    top: "8%",
    left: "5%",
    size: "2.8rem",
    rotate: "-15deg",
  },
  {
    id: "f2",
    emoji: "🍔",
    top: "15%",
    right: "8%",
    size: "2.2rem",
    rotate: "12deg",
  },
  {
    id: "f3",
    emoji: "🥗",
    top: "40%",
    left: "3%",
    size: "2rem",
    rotate: "8deg",
  },
  {
    id: "f4",
    emoji: "🌮",
    bottom: "30%",
    right: "5%",
    size: "2.5rem",
    rotate: "-10deg",
  },
  {
    id: "f5",
    emoji: "🍜",
    bottom: "12%",
    left: "10%",
    size: "2.2rem",
    rotate: "20deg",
  },
  {
    id: "f6",
    emoji: "🥘",
    top: "60%",
    right: "3%",
    size: "1.8rem",
    rotate: "-8deg",
  },
  {
    id: "f7",
    emoji: "🍱",
    top: "75%",
    left: "6%",
    size: "2rem",
    rotate: "15deg",
  },
  {
    id: "f8",
    emoji: "🧆",
    top: "28%",
    left: "12%",
    size: "1.6rem",
    rotate: "-20deg",
  },
  {
    id: "f9",
    emoji: "🍛",
    bottom: "20%",
    right: "12%",
    size: "1.9rem",
    rotate: "5deg",
  },
];

const cardStyle = {
  background: "#ffffff",
  border: "1px solid rgba(139,92,246,0.25)",
};

export default function LoginPage({ onLogin }: Props) {
  const store = useStore();
  const [step, setStep] = useState<Step>("select");

  // College form state
  const [collegeUserName, setCollegeUserName] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [collegeEmail, setCollegeEmail] = useState("");
  const [collegeRole, setCollegeRole] = useState<"student" | "shopOwner">(
    "student",
  );
  const [collegeEmailError, setCollegeEmailError] = useState("");

  // Company form state
  const [companyUserName, setCompanyUserName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyRole, setCompanyRole] = useState<"student" | "shopOwner">(
    "student",
  );

  const [loading, setLoading] = useState(false);

  function validateCollegeEmail(email: string): string {
    if (!email.includes("@")) return "Enter a valid email address";
    return "";
  }

  function handleCollegeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!collegeUserName.trim()) {
      toast.error("Enter your name");
      return;
    }
    if (!collegeName.trim()) {
      toast.error("Enter your college name");
      return;
    }
    const err = validateCollegeEmail(collegeEmail);
    if (err) {
      setCollegeEmailError(err);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      store.setSession({
        name: collegeUserName.trim(),
        email: collegeEmail.toLowerCase().trim(),
        role: collegeRole,
        collegeDomain: extractDomain(collegeEmail),
        userType: "college",
        orgName: collegeName.trim(),
      });
      setLoading(false);
      onLogin(collegeRole);
    }, 600);
  }

  function handleCompanySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!companyUserName.trim()) {
      toast.error("Enter your name");
      return;
    }
    if (!companyName.trim()) {
      toast.error("Enter your company name");
      return;
    }
    if (!companyEmail.trim() || !companyEmail.includes("@")) {
      toast.error("Enter a valid work email");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      store.setSession({
        name: companyUserName.trim(),
        email: companyEmail.toLowerCase().trim(),
        role: companyRole,
        collegeDomain: extractDomain(companyEmail),
        userType: "company",
        orgName: companyName.trim(),
      });
      setLoading(false);
      onLogin(companyRole);
    }, 600);
  }

  const logoSection = (
    <div className="text-center mb-6">
      <div className="relative inline-block">
        <img
          src="/assets/uploads/logo.png-1.jpeg"
          alt="YumGo"
          className="relative w-24 h-24 rounded-2xl mx-auto shadow-lg"
          style={{
            filter:
              "drop-shadow(0 4px 16px rgba(124,58,237,0.6)) drop-shadow(0 0 8px rgba(219,39,119,0.4))",
          }}
        />
      </div>
    </div>
  );

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #2d1b69 0%, #5b21b6 25%, #7c3aed 50%, #a21caf 75%, #db2777 100%)",
      }}
    >
      {floatingEmojis.map((item) => (
        <div
          key={item.id}
          className="absolute pointer-events-none select-none"
          style={{
            top: (item as any).top,
            left: (item as any).left,
            right: (item as any).right,
            bottom: (item as any).bottom,
            fontSize: item.size,
            opacity: 0.22,
            transform: `rotate(${item.rotate})`,
          }}
        >
          {item.emoji}
        </div>
      ))}

      <div className="w-full max-w-sm relative z-10">
        {logoSection}

        <AnimatePresence mode="wait">
          {step === "select" && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="rounded-3xl shadow-2xl p-6"
              style={cardStyle}
            >
              <h2 className="text-center text-xl font-bold text-gray-900 mb-1">
                Welcome 🎉
              </h2>
              <p className="text-center text-sm text-gray-600 mb-6">
                Select how you'd like to continue
              </p>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  data-ocid="login.college_button"
                  onClick={() => setStep("college")}
                  className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 border-purple-200 bg-purple-50 hover:border-purple-500 hover:bg-purple-100 transition-all active:scale-95"
                >
                  <span className="text-4xl">🎓</span>
                  <span className="font-bold text-purple-900 text-sm">
                    College
                  </span>
                  <span className="text-xs text-purple-700 text-center">
                    For students &amp; staff
                  </span>
                </button>
                <button
                  type="button"
                  data-ocid="login.company_button"
                  onClick={() => setStep("company")}
                  className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 border-purple-200 bg-purple-50 hover:border-purple-500 hover:bg-purple-100 transition-all active:scale-95"
                >
                  <span className="text-4xl">🏢</span>
                  <span className="font-bold text-purple-900 text-sm">
                    Company
                  </span>
                  <span className="text-xs text-purple-700 text-center">
                    For corporate teams
                  </span>
                </button>
              </div>
            </motion.div>
          )}

          {step === "college" && (
            <motion.div
              key="college"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="rounded-3xl shadow-2xl p-6"
              style={cardStyle}
            >
              <div className="flex items-center gap-2 mb-5">
                <button
                  type="button"
                  data-ocid="login.back_button"
                  onClick={() => setStep("select")}
                  className="p-1.5 rounded-xl hover:bg-purple-100 text-purple-800 transition-colors"
                  aria-label="Go back"
                >
                  <svg
                    role="img"
                    aria-label="Go back"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <h2 className="text-lg font-bold text-gray-900">
                  College Login
                </h2>
                <span className="ml-1 text-xl">🎓</span>
              </div>

              <form onSubmit={handleCollegeSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="collegeUserName"
                    className="text-sm font-semibold text-gray-800"
                  >
                    Your Name
                  </Label>
                  <Input
                    id="collegeUserName"
                    type="text"
                    placeholder="e.g. Rahul Kumar"
                    value={collegeUserName}
                    onChange={(e) => setCollegeUserName(e.target.value)}
                    className="h-12 text-base rounded-xl bg-white border-gray-300"
                    data-ocid="login.input"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="collegeName"
                    className="text-sm font-semibold text-gray-800"
                  >
                    College Name
                  </Label>
                  <Input
                    id="collegeName"
                    type="text"
                    placeholder="e.g. MIT College of Engineering"
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    className="h-12 text-base rounded-xl bg-white border-gray-300"
                    data-ocid="login.input"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="collegeEmail"
                    className="text-sm font-semibold text-gray-800"
                  >
                    College Email
                  </Label>
                  <Input
                    id="collegeEmail"
                    type="email"
                    placeholder="yourname@college.edu"
                    value={collegeEmail}
                    onChange={(e) => {
                      setCollegeEmail(e.target.value);
                      if (collegeEmailError)
                        setCollegeEmailError(
                          validateCollegeEmail(e.target.value),
                        );
                    }}
                    className={`h-12 text-base rounded-xl bg-white ${
                      collegeEmailError
                        ? "border-red-400 focus-visible:ring-red-300"
                        : "border-gray-300"
                    }`}
                    data-ocid="login.input"
                    required
                  />
                  {collegeEmailError && (
                    <p
                      className="text-xs text-red-600 font-medium"
                      data-ocid="login.error_state"
                    >
                      {collegeEmailError}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-gray-800">
                    I am a...
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setCollegeRole("student")}
                      data-ocid="login.role_student_button"
                      className={`p-4 rounded-2xl border-2 text-center transition-all ${
                        collegeRole === "student"
                          ? "border-purple-500 bg-purple-50 text-purple-800"
                          : "border-gray-200 bg-gray-50 hover:border-purple-300 text-gray-700"
                      }`}
                    >
                      <div className="text-3xl mb-1">🎓</div>
                      <div className="font-semibold text-sm">Student</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCollegeRole("shopOwner")}
                      data-ocid="login.role_owner_button"
                      className={`p-4 rounded-2xl border-2 text-center transition-all ${
                        collegeRole === "shopOwner"
                          ? "border-purple-500 bg-purple-50 text-purple-800"
                          : "border-gray-200 bg-gray-50 hover:border-purple-300 text-gray-700"
                      }`}
                    >
                      <div className="text-3xl mb-1">🏪</div>
                      <div className="font-semibold text-sm">Shop Owner</div>
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl text-base font-semibold bg-purple-600 hover:bg-purple-700 text-white"
                  disabled={loading}
                  data-ocid="login.submit_button"
                >
                  {loading ? "Signing in..." : "Continue →"}
                </Button>
              </form>
            </motion.div>
          )}

          {step === "company" && (
            <motion.div
              key="company"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="rounded-3xl shadow-2xl p-6"
              style={cardStyle}
            >
              <div className="flex items-center gap-2 mb-5">
                <button
                  type="button"
                  data-ocid="login.back_button"
                  onClick={() => setStep("select")}
                  className="p-1.5 rounded-xl hover:bg-purple-100 text-purple-800 transition-colors"
                  aria-label="Go back"
                >
                  <svg
                    role="img"
                    aria-label="Go back"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <h2 className="text-lg font-bold text-gray-900">
                  Company Login
                </h2>
                <span className="ml-1 text-xl">🏢</span>
              </div>

              <form onSubmit={handleCompanySubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="companyUserName"
                    className="text-sm font-semibold text-gray-800"
                  >
                    Your Name
                  </Label>
                  <Input
                    id="companyUserName"
                    type="text"
                    placeholder="e.g. Priya Sharma"
                    value={companyUserName}
                    onChange={(e) => setCompanyUserName(e.target.value)}
                    className="h-12 text-base rounded-xl bg-white border-gray-300"
                    data-ocid="login.input"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="companyName"
                    className="text-sm font-semibold text-gray-800"
                  >
                    Company Name
                  </Label>
                  <Input
                    id="companyName"
                    type="text"
                    placeholder="e.g. Acme Corp"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="h-12 text-base rounded-xl bg-white border-gray-300"
                    data-ocid="login.input"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="companyEmail"
                    className="text-sm font-semibold text-gray-800"
                  >
                    Work Email
                  </Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    placeholder="you@company.com"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    className="h-12 text-base rounded-xl bg-white border-gray-300"
                    data-ocid="login.input"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-gray-800">
                    I am a...
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setCompanyRole("student")}
                      data-ocid="login.role_employee_button"
                      className={`p-4 rounded-2xl border-2 text-center transition-all ${
                        companyRole === "student"
                          ? "border-purple-500 bg-purple-50 text-purple-800"
                          : "border-gray-200 bg-gray-50 hover:border-purple-300 text-gray-700"
                      }`}
                    >
                      <div className="text-3xl mb-1">👔</div>
                      <div className="font-semibold text-sm">Employee</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCompanyRole("shopOwner")}
                      data-ocid="login.role_owner_button"
                      className={`p-4 rounded-2xl border-2 text-center transition-all ${
                        companyRole === "shopOwner"
                          ? "border-purple-500 bg-purple-50 text-purple-800"
                          : "border-gray-200 bg-gray-50 hover:border-purple-300 text-gray-700"
                      }`}
                    >
                      <div className="text-3xl mb-1">🏪</div>
                      <div className="font-semibold text-sm">Shop Owner</div>
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl text-base font-semibold bg-purple-600 hover:bg-purple-700 text-white"
                  disabled={loading}
                  data-ocid="login.submit_button"
                >
                  {loading ? "Signing in..." : "Continue →"}
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
