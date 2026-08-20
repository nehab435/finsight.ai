import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sun,
  Moon,
  LayoutDashboard,
  Wallet,
  FileText,
  Settings,
  Bell,
  User,
  LogOut,
  Calculator,
  TrendingUp,
  PiggyBank,
  Landmark,
  IndianRupee,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

import { getUserProfile, getDocuments } from "../api/api";

export default function SavingsAdvisor() {
  const navigate = useNavigate();

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : true;
  });

  const [userName, setUserName] = useState("Loading...");
  const [profilePhoto, setProfilePhoto] = useState("");

  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [advisorData, setAdvisorData] = useState({
    totalIncome: 0,
    estimatedSavings: 0,
    monthlySavings: 0,
    deductor: "Not available",
    savingsRate: 0,
    recommendations: [],
  });

  // ---------------------------------------------------------
  // THEME
  // ---------------------------------------------------------

  useEffect(() => {
    const root = document.documentElement;

    if (isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  // ---------------------------------------------------------
  // SAFE NUMBER PARSER
  // ---------------------------------------------------------

  const parseValue = (value) => {
    if (value === undefined || value === null) return 0;

    if (typeof value === "number") {
      return Number.isNaN(value) ? 0 : value;
    }

    const cleaned = String(value)
      .replace(/,/g, "")
      .replace(/[^0-9.-]/g, "");

    const parsed = parseFloat(cleaned);

    return Number.isNaN(parsed) ? 0 : parsed;
  };

  // ---------------------------------------------------------
  // GET VALUE FROM MULTIPLE POSSIBLE DOCUMENT SCHEMAS
  // ---------------------------------------------------------

  const getDocumentValue = (doc, keys) => {
    const data = doc?.extractedData || {};

    const nestedData =
      data?.extractedData ||
      data?.data ||
      {};

    for (const key of keys) {
      const value =
        data?.[key] ??
        nestedData?.[key] ??
        doc?.[key];

      const parsed = parseValue(value);

      if (parsed > 0) {
        return parsed;
      }
    }

    return 0;
  };

  // ---------------------------------------------------------
  // EXTRACT AMOUNTS FROM TEXT AS FALLBACK
  // ---------------------------------------------------------

  const extractNumbersFromText = (text) => {
    if (!text) return [];

    const matches = String(text).match(
      /(?:₹|Rs\.?|INR)?\s*([0-9]{1,3}(?:,[0-9]{3})+(?:\.[0-9]+)?|[0-9]+(?:\.[0-9]+)?)/gi
    );

    if (!matches) return [];

    return matches
      .map((match) => parseValue(match))
      .filter((value) => value > 100);
  };

  // ---------------------------------------------------------
  // FIND INCOME
  // ---------------------------------------------------------

  const extractIncome = (doc) => {
    const income = getDocumentValue(doc, [
      "grossIncome",
      "annualIncome",
      "totalIncome",
      "income",
      "salary",
      "grossSalary",
      "totalEarnings",
      "netIncome",
    ]);

    if (income > 0) return income;

    const data = doc?.extractedData || {};
    const nested =
      data?.extractedData ||
      data?.data ||
      {};

    const text =
      data?.summary ||
      nested?.summary ||
      data?.analysis ||
      nested?.analysis ||
      data?.text ||
      nested?.text ||
      doc?.summary ||
      doc?.text ||
      "";

    const numbers = extractNumbersFromText(text);

    return numbers.length ? Math.max(...numbers) : 0;
  };

  // ---------------------------------------------------------
  // GET DOCUMENT SOURCE / EMPLOYER DYNAMICALLY
  // ---------------------------------------------------------

  const extractSource = (doc) => {
    const data = doc?.extractedData || {};

    const nestedData =
      data?.extractedData ||
      data?.data ||
      {};

    const possibleFields = [
      "employer",
      "employerName",
      "company",
      "companyName",
      "organization",
      "organizationName",
      "organisation",
      "organisationName",
      "deductor",
      "deductorName",
      "source",
      "documentSource",
      "issuer",
      "issuerName",
    ];

    for (const key of possibleFields) {
      const value =
        data?.[key] ??
        nestedData?.[key] ??
        doc?.[key];

      if (
        value &&
        typeof value === "string" &&
        value.trim().length > 0
      ) {
        return value.trim();
      }
    }

    // Fallback: search inside AI-extracted text
    const text = String(
      data?.summary ||
      nestedData?.summary ||
      data?.analysis ||
      nestedData?.analysis ||
      data?.text ||
      nestedData?.text ||
      doc?.summary ||
      doc?.text ||
      ""
    );

    const patterns = [
      /(?:Employer|Employer Name)\s*[:\-]\s*([^\n,;]+)/i,
      /(?:Company|Company Name)\s*[:\-]\s*([^\n,;]+)/i,
      /(?:Organization|Organisation)\s*[:\-]\s*([^\n,;]+)/i,
      /(?:Deductor|Deductor Name)\s*[:\-]\s*([^\n,;]+)/i,
      /(?:Name of Employer)\s*[:\-]\s*([^\n,;]+)/i,
      /(?:Name of Deductor)\s*[:\-]\s*([^\n,;]+)/i,
      /(?:Issued By)\s*[:\-]\s*([^\n,;]+)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);

      if (match?.[1]) {
        return match[1].trim();
      }
    }

    return "Extracted Financial Document";
  };

  // ---------------------------------------------------------
  // BUILD REAL ADVICE
  // ---------------------------------------------------------

  const generateRecommendations = ({
    totalIncome,
    savingsRate,
    documentCount,
  }) => {
    const recommendations = [];

    if (totalIncome <= 0) {
      return [
        {
          type: "info",
          title: "Upload financial documents",
          description:
            "Upload salary slips, bank statements, tax documents, or investment documents to generate personalized financial insights.",
        },
      ];
    }

    if (savingsRate < 20) {
      recommendations.push({
        type: "warning",
        title: "Increase your savings rate",
        description:
          "Your estimated savings allocation is below the recommended 20% benchmark. Consider automating monthly transfers into savings or investments.",
      });
    } else if (savingsRate < 35) {
      recommendations.push({
        type: "good",
        title: "Healthy savings potential",
        description:
          "Your current financial profile supports a balanced savings strategy. Consider splitting savings between an emergency fund and long-term investments.",
      });
    } else {
      recommendations.push({
        type: "excellent",
        title: "Strong savings capacity",
        description:
          "Your financial profile indicates strong saving potential. Consider diversifying surplus funds into suitable long-term investment instruments.",
      });
    }

    if (documentCount < 2) {
      recommendations.push({
        type: "info",
        title: "Add more financial data",
        description:
          "Upload additional financial documents to improve the accuracy of income analysis and personalized financial recommendations.",
      });
    }

    recommendations.push({
      type: "investment",
      title: "Build an emergency fund",
      description:
        "Aim to maintain approximately 3–6 months of essential expenses in a liquid emergency fund before allocating more aggressively toward long-term investments.",
    });

    return recommendations;
  };

  // ---------------------------------------------------------
  // FETCH USER + DOCUMENTS
  // ---------------------------------------------------------

  const fetchAdvisorData = async () => {
    try {
      setLoading(true);

      const [userResponse, documentsResponse] =
        await Promise.all([
          getUserProfile(),
          getDocuments(),
        ]);

      const userData =
        userResponse?.data?.user ||
        userResponse?.data ||
        {};

      setUserName(
        userData?.name ||
          userData?.username ||
          "User"
      );

      setProfilePhoto(
        userData?.profilePhoto || ""
      );

      const docs =
        documentsResponse?.data?.documents ||
        documentsResponse?.data ||
        [];

      const safeDocuments = Array.isArray(docs)
        ? docs
        : [];

      setDocuments(safeDocuments);

      let totalIncome = 0;
      let source = "Not available";

      safeDocuments.forEach((doc) => {
        const income = extractIncome(doc);

        totalIncome += income;

        if (source === "Not available") {
          const extractedSource =
            extractSource(doc);

          if (
            extractedSource &&
            extractedSource !==
              "Extracted Financial Document"
          ) {
            source = extractedSource;
          }
        }
      });

      /*
       * Recommended savings calculation.
       * Based on detected income without inventing
       * expenses or bank balances.
       */

      const recommendedSavingsRate =
        totalIncome > 0 ? 20 : 0;

      const estimatedSavings =
        (totalIncome *
          recommendedSavingsRate) /
        100;

      const monthlySavings =
        estimatedSavings / 12;

      const recommendations =
        generateRecommendations({
          totalIncome,
          savingsRate:
            recommendedSavingsRate,
          documentCount:
            safeDocuments.length,
        });

      setAdvisorData({
        totalIncome,
        estimatedSavings,
        monthlySavings,
        deductor: source,
        savingsRate:
          recommendedSavingsRate,
        recommendations,
      });
    } catch (error) {
      console.error(
        "Failed to load savings advisor data:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvisorData();
  }, []);

  // ---------------------------------------------------------
  // LOGOUT
  // ---------------------------------------------------------

  const handleLogout = () => {
    localStorage.removeItem("token");

    navigate("/", {
      replace: true,
    });
  };

  // ---------------------------------------------------------
  // FORMAT CURRENCY
  // ---------------------------------------------------------

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // ---------------------------------------------------------
  // RECOMMENDATION ICON
  // ---------------------------------------------------------

  const getRecommendationIcon = (type) => {
    switch (type) {
      case "good":
      case "excellent":
        return <TrendingUp size={20} />;

      case "investment":
        return <Landmark size={20} />;

      case "warning":
        return <AlertCircle size={20} />;

      default:
        return <ShieldCheck size={20} />;
    }
  };

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------

  return (
    <div
      className={`flex min-h-screen font-sans transition-colors ${
        isDarkMode
          ? "bg-[#040B16] text-white"
          : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* ================= SIDEBAR ================= */}

      <aside
        className={`w-64 border-r hidden md:flex flex-col ${
          isDarkMode
            ? "bg-[#060E1D] border-white/10"
            : "bg-white border-slate-200"
        }`}
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-tight">
            finsight
            <span className="text-[#00DF81]">
              .ai
            </span>
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link
            to="/dashboard"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              isDarkMode
                ? "text-gray-400 hover:text-white hover:bg-white/5"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </Link>

          <Link
            to="/accounts"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              isDarkMode
                ? "text-gray-400 hover:text-white hover:bg-white/5"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Wallet size={20} />
            Accounts
          </Link>

          <Link
            to="/documents"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              isDarkMode
                ? "text-gray-400 hover:text-white hover:bg-white/5"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <FileText size={20} />
            Documents
          </Link>

          <Link
            to="/savings-advisor"
            className="flex items-center gap-3 px-4 py-3 bg-[#00DF81]/10 text-[#00DF81] rounded-xl font-medium border-l-4 border-[#00DF81]"
          >
            <Calculator size={20} />
            Savings Advisor
          </Link>

          <Link
            to="/settings"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              isDarkMode
                ? "text-gray-400 hover:text-white hover:bg-white/5"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Settings size={20} />
            Settings
          </Link>
        </nav>

        <div className="p-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* ================= MAIN ================= */}

      <main className="flex-1 min-w-0">
        {/* ================= HEADER ================= */}

        <header
          className={`h-20 border-b flex items-center justify-between px-6 md:px-8 ${
            isDarkMode
              ? "bg-[#060E1D]/50 border-white/10"
              : "bg-white border-slate-200"
          }`}
        >
          <div>
            <h2 className="text-xl font-semibold">
              AI Savings & Wealth Advisor
            </h2>

            <p className="text-sm text-gray-400 mt-1">
              Personalized insights based on your uploaded financial documents
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={fetchAdvisorData}
              className={`p-2.5 rounded-full transition ${
                isDarkMode
                  ? "hover:bg-white/10"
                  : "hover:bg-slate-100"
              }`}
              title="Refresh data"
            >
              <RefreshCw size={19} />
            </button>

            <button
              onClick={toggleTheme}
              className={`p-2.5 border rounded-full ${
                isDarkMode
                  ? "bg-white/10 border-white/10"
                  : "bg-slate-100 border-slate-200"
              }`}
            >
              {isDarkMode ? (
                <Sun
                  size={18}
                  className="text-yellow-400"
                />
              ) : (
                <Moon size={18} />
              )}
            </button>

            {/* NOTIFICATIONS */}

            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen(
                    !notificationsOpen
                  );
                  setProfileOpen(false);
                }}
                className="relative p-2"
              >
                <Bell size={20} />

                {documents.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[#00DF81] rounded-full" />
                )}
              </button>

              {notificationsOpen && (
                <div
                  className={`absolute right-0 mt-3 w-72 p-4 rounded-2xl border shadow-xl z-50 ${
                    isDarkMode
                      ? "bg-[#060E1D] border-white/10"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <h4 className="font-semibold mb-3">
                    Financial Data
                  </h4>

                  <p className="text-sm text-gray-400">
                    {documents.length} uploaded document
                    {documents.length !== 1
                      ? "s"
                      : ""}{" "}
                    analyzed.
                  </p>
                </div>
              )}
            </div>

            {/* PROFILE */}

            <div className="relative">
              <button
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-2"
              >
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt="Profile"
                    className="w-9 h-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#00DF81]/20 text-[#00DF81] flex items-center justify-center">
                    <User size={18} />
                  </div>
                )}

                <span className="hidden sm:block text-sm font-medium">
                  {userName}
                </span>
              </button>

              {profileOpen && (
                <div
                  className={`absolute right-0 mt-3 w-52 p-3 rounded-2xl border shadow-xl z-50 ${
                    isDarkMode
                      ? "bg-[#060E1D] border-white/10"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-3 py-2 text-red-500 rounded-lg hover:bg-red-500/10"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ================= CONTENT ================= */}

        <div className="w-full px-6 md:px-10 lg:px-16 xl:px-20 2xl:px-28 py-7">
          {loading ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <RefreshCw
                  className="animate-spin mx-auto mb-4 text-[#00DF81]"
                  size={32}
                />

                <p className="text-gray-400">
                  Analyzing your financial documents...
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* ================= TOP CARDS ================= */}

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-7">
                {/* DETECTED INCOME */}

                <div
                  className={`min-h-[134px] p-6 rounded-2xl border ${
                    isDarkMode
                      ? "bg-[#060E1D] border-white/10"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-400">
                      Detected Income
                    </span>

                    <IndianRupee
                      className="text-[#00DF81]"
                      size={20}
                    />
                  </div>

                  <h3 className="text-2xl font-bold">
                    {formatCurrency(
                      advisorData.totalIncome
                    )}
                  </h3>
                </div>

                {/* ANNUAL SAVINGS */}

                <div
                  className={`min-h-[134px] p-6 rounded-2xl border ${
                    isDarkMode
                      ? "bg-[#060E1D] border-white/10"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-400">
                      Recommended Annual Savings
                    </span>

                    <PiggyBank
                      className="text-[#00DF81]"
                      size={20}
                    />
                  </div>

                  <h3 className="text-2xl font-bold">
                    {formatCurrency(
                      advisorData.estimatedSavings
                    )}
                  </h3>

                  <p className="text-xs text-gray-400 mt-2">
                    Based on a{" "}
                    {advisorData.savingsRate}%
                    savings target
                  </p>
                </div>

                {/* MONTHLY SAVINGS */}

                <div
                  className={`min-h-[134px] p-6 rounded-2xl border ${
                    isDarkMode
                      ? "bg-[#060E1D] border-white/10"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-400">
                      Monthly Savings Target
                    </span>

                    <TrendingUp
                      className="text-purple-400"
                      size={20}
                    />
                  </div>

                  <h3 className="text-2xl font-bold">
                    {formatCurrency(
                      advisorData.monthlySavings
                    )}
                  </h3>
                </div>
              </div>

              {/* ================= TWO COLUMN LAYOUT ================= */}

              <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2.1fr)_minmax(320px,0.9fr)] gap-6 items-start">
                {/* LEFT SIDE */}

                <div className="min-w-0">
                  <div className="mb-5">
                    <h3 className="text-xl font-semibold">
                      Personalized Recommendations
                    </h3>

                    <p className="text-sm text-gray-400 mt-1">
                      Generated from your uploaded financial data
                    </p>
                  </div>

                  <div className="space-y-5">
                    {advisorData.recommendations.map(
                      (recommendation, index) => (
                        <div
                          key={index}
                          className={`w-full p-5 rounded-2xl border flex gap-4 ${
                            isDarkMode
                              ? "bg-[#060E1D] border-white/10"
                              : "bg-white border-slate-200"
                          }`}
                        >
                          <div className="w-11 h-11 shrink-0 rounded-xl bg-[#00DF81]/10 text-[#00DF81] flex items-center justify-center">
                            {getRecommendationIcon(
                              recommendation.type
                            )}
                          </div>

                          <div className="min-w-0">
                            <h4 className="font-semibold mb-1">
                              {recommendation.title}
                            </h4>

                            <p className="text-sm text-gray-400 leading-relaxed">
                              {
                                recommendation.description
                              }
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* RIGHT SIDE */}

                <div
                  className={`w-full p-6 rounded-2xl border ${
                    isDarkMode
                      ? "bg-[#060E1D] border-white/10"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-7">
                    <div className="w-10 h-10 rounded-xl bg-[#00DF81]/10 text-[#00DF81] flex items-center justify-center">
                      <Calculator size={20} />
                    </div>

                    <div>
                      <h3 className="font-semibold">
                        Financial Summary
                      </h3>

                      <p className="text-xs text-gray-400">
                        Based on analyzed documents
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <p className="text-xs text-gray-400 mb-2">
                        Document Source
                      </p>

                      <p className="text-sm font-semibold break-words">
                        {advisorData.deductor}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400 mb-2">
                        Documents Analyzed
                      </p>

                      <p className="text-sm font-semibold">
                        {documents.length}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400 mb-2">
                        Detected Income
                      </p>

                      <p className="text-sm font-semibold">
                        {formatCurrency(
                          advisorData.totalIncome
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400 mb-2">
                        Recommended Annual Savings
                      </p>

                      <p className="text-sm font-semibold">
                        {formatCurrency(
                          advisorData.estimatedSavings
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400 mb-2">
                        Monthly Savings Target
                      </p>

                      <p className="text-sm font-semibold">
                        {formatCurrency(
                          advisorData.monthlySavings
                        )}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`mt-7 pt-5 border-t ${
                      isDarkMode
                        ? "border-white/10"
                        : "border-slate-200"
                    }`}
                  >
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Insights are generated from the
                      financial information available in
                      your uploaded documents. Upload more
                      documents for richer and more
                      accurate analysis.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}