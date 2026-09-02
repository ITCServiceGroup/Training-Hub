import { useState, useEffect, useRef } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useRBAC } from "../../contexts/RBACContext";
import { useFullscreen } from "../../contexts/FullscreenContext";
import {
  MdDashboard,
  MdQuiz,
  MdOutlinePermMedia,
  MdChevronLeft,
  MdChevronRight,
  MdClose,
  MdMenu,
} from "react-icons/md";
import { BiBook } from "react-icons/bi";
import {
  FiSettings,
  FiUsers,
  FiCheckCircle,
  FiClipboard,
} from "react-icons/fi";
import { PERMISSIONS } from "../../config/authorization";
import CategoryContext from "./CategoryContext";

const AdminLayout = () => {
  const { canManageUsers, isAdmin, hasPermission } = useRBAC();
  const { isFullscreen, exitFullscreen } = useFullscreen();
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [resetStudyGuideSelection, setResetStudyGuideSelection] = useState(
    () => () => {},
  );
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const mobileSidebarRef = useRef(null);
  const mobileMenuButtonRef = useRef(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem("adminSidebarCollapsed");
    return saved !== null ? JSON.parse(saved) : false;
  });

  // Auto-exit fullscreen when navigating away from content editing
  useEffect(() => {
    const isOnStudyGuidesPage = location.pathname.startsWith(
      "/admin/study-guides",
    );
    if (isFullscreen && !isOnStudyGuidesPage) {
      exitFullscreen();
    }
  }, [location.pathname, isFullscreen, exitFullscreen]);

  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(
      "adminSidebarCollapsed",
      JSON.stringify(sidebarCollapsed),
    );
  }, [sidebarCollapsed]);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileSidebarOpen) return undefined;

    const sidebar = mobileSidebarRef.current;
    const menuButton = mobileMenuButtonRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusableSelector =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusFirstControl = () =>
      sidebar?.querySelector(focusableSelector)?.focus();
    const animationFrame = window.requestAnimationFrame(focusFirstControl);

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMobileSidebarOpen(false);
        return;
      }

      if (event.key !== "Tab" || !sidebar) return;
      const focusable = [...sidebar.querySelectorAll(focusableSelector)];
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(animationFrame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      menuButton?.focus();
    };
  }, [mobileSidebarOpen]);

  // Determine active tab based on the current path
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === "/admin") return "dashboard";
    if (path.includes("/admin/study-guides")) return "study-guides";
    if (path.includes("/admin/media")) return "media";
    if (path.includes("/admin/quizzes")) return "quizzes";
    if (path.includes("/admin/users")) return "users";
    if (path.includes("/admin/approvals")) return "approvals";
    if (path.includes("/admin/training")) return "training";
    if (path.includes("/admin/settings")) return "settings";
    return "dashboard";
  };

  const activeTab = getActiveTab();

  // Get page title based on active tab
  const getPageTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return "Admin Dashboard";
      case "study-guides":
        return "Creation Management";
      case "media":
        return "Media Library";
      case "quizzes":
        return "Quiz Management";
      case "users":
        return "User Management";
      case "approvals":
        return "Approval Queue";
      case "training":
        return "Training Operations";
      case "settings":
        return "Settings";
      default:
        return "Admin Dashboard";
    }
  };

  return (
    <CategoryContext.Provider
      value={{
        selectedCategory,
        setSelectedCategory,
        resetStudyGuideSelection,
        setResetStudyGuideSelection,
      }}
    >
      <div className="flex flex-1 overflow-hidden w-full m-0 p-0 min-h-0">
        {!isFullscreen && (
          <>
            {mobileSidebarOpen && (
              <button
                type="button"
                aria-label="Close admin navigation"
                className="fixed inset-0 z-30 bg-slate-950/40 md:hidden"
                onClick={() => setMobileSidebarOpen(false)}
              />
            )}
            <aside
              ref={mobileSidebarRef}
              aria-label="Admin navigation"
              aria-modal={mobileSidebarOpen || undefined}
              role={mobileSidebarOpen ? "dialog" : undefined}
              className={`${sidebarCollapsed ? "md:w-[72px]" : "md:w-[250px]"} ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-40 flex w-[250px] flex-shrink-0 flex-col border-r border-slate-200 bg-slate-100 text-white shadow-md transition-all duration-300 ease-in-out dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:shadow-lg md:static md:translate-x-0`}
            >
              <div className="flex justify-end border-b border-slate-200 p-2 dark:border-slate-600 md:hidden">
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="rounded-md p-2 text-slate-700 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white dark:hover:bg-slate-600"
                  aria-label="Close admin navigation"
                >
                  <MdClose className="text-xl" />
                </button>
              </div>
              <ul className="list-none p-0 m-0 flex-1">
                <li
                  className={`group cursor-pointer transition-colors ${activeTab === "dashboard" ? "bg-primary" : "hover:bg-primary"}`}
                >
                  <Link
                    to="/admin"
                    className={`no-underline hover:no-underline flex items-center px-6 w-full py-3 ${activeTab === "dashboard" ? "text-white" : "text-slate-800 dark:text-white group-hover:text-white"}`}
                    title={sidebarCollapsed ? "Dashboard" : ""}
                  >
                    <MdDashboard className="text-lg flex-shrink-0" />
                    <span
                      className={`ml-3 transition-all duration-300 ${sidebarCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}
                    >
                      Dashboard
                    </span>
                  </Link>
                </li>
                <li
                  className={`group cursor-pointer transition-colors ${activeTab === "study-guides" ? "bg-primary" : "hover:bg-primary"}`}
                >
                  <Link
                    to="/admin/study-guides"
                    className={`no-underline hover:no-underline flex items-center px-6 w-full py-3 ${activeTab === "study-guides" ? "text-white" : "text-slate-800 dark:text-white group-hover:text-white"}`}
                    title={sidebarCollapsed ? "Create" : ""}
                  >
                    <BiBook className="text-lg flex-shrink-0" />
                    <span
                      className={`ml-3 transition-all duration-300 ${sidebarCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}
                    >
                      Create
                    </span>
                  </Link>
                </li>
                <li
                  className={`group cursor-pointer transition-colors ${activeTab === "media" ? "bg-primary" : "hover:bg-primary"}`}
                >
                  <Link
                    to="/admin/media"
                    className={`no-underline hover:no-underline flex items-center px-6 w-full py-3 ${activeTab === "media" ? "text-white" : "text-slate-800 dark:text-white group-hover:text-white"}`}
                    title={sidebarCollapsed ? "Media Library" : ""}
                  >
                    <MdOutlinePermMedia className="text-lg flex-shrink-0" />
                    <span
                      className={`ml-3 transition-all duration-300 whitespace-nowrap ${sidebarCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}
                    >
                      Media Library
                    </span>
                  </Link>
                </li>
                <li
                  className={`group cursor-pointer transition-colors ${activeTab === "quizzes" ? "bg-primary" : "hover:bg-primary"}`}
                >
                  <Link
                    to="/admin/quizzes"
                    className={`no-underline hover:no-underline flex items-center px-6 w-full py-3 ${activeTab === "quizzes" ? "text-white" : "text-slate-800 dark:text-white group-hover:text-white"}`}
                    title={sidebarCollapsed ? "Quiz" : ""}
                  >
                    <MdQuiz className="text-lg flex-shrink-0" />
                    <span
                      className={`ml-3 transition-all duration-300 ${sidebarCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}
                    >
                      Quiz
                    </span>
                  </Link>
                </li>
                {canManageUsers() && (
                  <li
                    className={`group cursor-pointer transition-colors ${activeTab === "users" ? "bg-primary" : "hover:bg-primary"}`}
                  >
                    <Link
                      to="/admin/users"
                      className={`no-underline hover:no-underline flex items-center px-6 w-full py-3 ${activeTab === "users" ? "text-white" : "text-slate-800 dark:text-white group-hover:text-white"}`}
                      title={sidebarCollapsed ? "Users" : ""}
                    >
                      <FiUsers className="text-lg flex-shrink-0" />
                      <span
                        className={`ml-3 transition-all duration-300 ${sidebarCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}
                      >
                        Users
                      </span>
                    </Link>
                  </li>
                )}
                {hasPermission(PERMISSIONS.TRAINING_MANAGE) && (
                  <li
                    className={`group cursor-pointer transition-colors ${activeTab === "training" ? "bg-primary" : "hover:bg-primary"}`}
                  >
                    <Link
                      to="/admin/training"
                      className={`no-underline hover:no-underline flex items-center px-6 w-full py-3 ${activeTab === "training" ? "text-white" : "text-slate-800 dark:text-white group-hover:text-white"}`}
                      title={sidebarCollapsed ? "Training" : ""}
                    >
                      <FiClipboard className="text-lg flex-shrink-0" />
                      <span
                        className={`ml-3 transition-all duration-300 ${sidebarCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}
                      >
                        Training
                      </span>
                    </Link>
                  </li>
                )}
                {isAdmin() && (
                  <li
                    className={`group cursor-pointer transition-colors ${activeTab === "approvals" ? "bg-primary" : "hover:bg-primary"}`}
                  >
                    <Link
                      to="/admin/approvals"
                      className={`no-underline hover:no-underline flex items-center px-6 w-full py-3 ${activeTab === "approvals" ? "text-white" : "text-slate-800 dark:text-white group-hover:text-white"}`}
                      title={sidebarCollapsed ? "Approvals" : ""}
                    >
                      <FiCheckCircle className="text-lg flex-shrink-0" />
                      <span
                        className={`ml-3 transition-all duration-300 ${sidebarCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}
                      >
                        Approvals
                      </span>
                    </Link>
                  </li>
                )}
                {isAdmin() && (
                  <li
                    className={`group cursor-pointer transition-colors ${activeTab === "settings" ? "bg-primary" : "hover:bg-primary"}`}
                  >
                    <Link
                      to="/admin/settings"
                      className={`no-underline hover:no-underline flex items-center px-6 w-full py-3 ${activeTab === "settings" ? "text-white" : "text-slate-800 dark:text-white group-hover:text-white"}`}
                      title={sidebarCollapsed ? "Settings" : ""}
                    >
                      <FiSettings className="text-lg flex-shrink-0" />
                      <span
                        className={`ml-3 transition-all duration-300 ${sidebarCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}
                      >
                        Settings
                      </span>
                    </Link>
                  </li>
                )}
              </ul>
              {/* Toggle button at bottom - entire area is clickable */}
              <button
                type="button"
                className="hidden w-full justify-center border-t border-slate-300 p-4 text-slate-800 transition-colors hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:border-slate-600 dark:text-white dark:hover:bg-slate-600 md:flex"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-label={
                  sidebarCollapsed
                    ? "Expand admin navigation"
                    : "Collapse admin navigation"
                }
              >
                {sidebarCollapsed ? (
                  <MdChevronRight className="text-lg" />
                ) : (
                  <MdChevronLeft className="text-lg" />
                )}
              </button>
            </aside>
          </>
        )}

        <div
          className={`flex-1 ${isFullscreen ? "p-0" : "p-4"} bg-slate-50 dark:bg-slate-800 min-w-0 w-full overflow-y-auto min-h-0`}
        >
          {!isFullscreen && (
            <div className="mb-4 flex items-center gap-3 md:hidden">
              <button
                ref={mobileMenuButtonRef}
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                className="rounded-md border border-slate-300 bg-white p-2 text-slate-700 shadow-sm hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
                aria-label="Open admin navigation"
                aria-expanded={mobileSidebarOpen}
              >
                <MdMenu className="text-xl" />
              </button>
              <h1 className="truncate text-lg font-semibold text-slate-900 dark:text-white">
                {getPageTitle()}
              </h1>
            </div>
          )}
          {/* Render the child routes */}
          <Outlet />
        </div>
      </div>
    </CategoryContext.Provider>
  );
};

export default AdminLayout;
