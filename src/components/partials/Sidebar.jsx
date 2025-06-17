import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import SidebarLinkGroup from "./SidebarLinkGroup";
import { logout } from "../../utils/helpers";

function Sidebar({ sidebarOpen, setSidebarOpen, variant = "default" }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { pathname } = location;

  const trigger = useRef(null);
  const sidebar = useRef(null);

  const storedSidebarExpanded = localStorage.getItem("sidebar-expanded");
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === "true"
  );

  // Close on click outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  }, [sidebarOpen]);

  // Close on ESC
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  }, [sidebarOpen]);

  useEffect(() => {
    localStorage.setItem("sidebar-expanded", sidebarExpanded);
    if (sidebarExpanded) {
      document.body.classList.add("sidebar-expanded");
    } else {
      document.body.classList.remove("sidebar-expanded");
    }
  }, [sidebarExpanded]);

  const handleLogout = () => {
    logout(() => {
      navigate("/login");
      window.location.reload();
    });
  };

  return (
    <div className="min-w-fit">
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-200 ${sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <div
        ref={sidebar}
        className={`flex flex-col fixed z-40 left-0 top-0 lg:static h-[100dvh] overflow-y-scroll lg:overflow-y-auto no-scrollbar transition-all duration-200 ease-in-out
${sidebarOpen ? "translate-x-0" : "lg:translate-x-0 -translate-x-200"}
        ${sidebarExpanded ? "lg:w-64" : "lg:w-16"}
        w-64 shrink-0 p-4
        ${variant === "v2"
            ? "border-r border-gray-200 dark:border-gray-700/60"
            : "rounded-r-2xl shadow-xs"
          }
        bg-[#EBFFF3]`}
      >
        {/* Header */}
        <div className="flex justify-between mb-10 pr-3 sm:px-2">
          <button
            ref={trigger}
            className="lg:hidden text-gray-500 hover:text-gray-400"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-controls="sidebar"
            aria-expanded={sidebarOpen}
          >
            <span className="sr-only">Close sidebar</span>
            <svg
              className="w-6 h-6 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M10.7 18.7l1.4-1.4L7.8 13H20v-2H7.8l4.3-4.3-1.4-1.4L4 12z" />
            </svg>
          </button>
        </div>

        {/* Links */}
        <div className="space-y-8">
          <div>
            <h3 className="text-xs uppercase text-gray-400 dark:text-gray-500 font-semibold pl-3">
              <span
                className={`text-center w-full block ${sidebarExpanded ? "hidden" : "block"}`}
              >
                •••
              </span>
              <span
                className={`transition-all duration-200 ${sidebarExpanded ? "block" : "hidden"}`}
              >
               DASHBOARD
              </span>
            </h3>

            <ul>
              <SidebarLinkGroup
                activecondition={pathname === "/" || pathname.includes("dashboard")}
              >
                {(handleClick, open) => (
                  <>
                    <a
                      href="#0"
                      className="text-gray-800 dark:text-gray-100 hover:text-green-700"
                      onClick={(e) => {
                        e.preventDefault();
                        handleClick();
                        setSidebarExpanded(true);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {/* <svg
                            className={`shrink-0 fill-current ${pathname.includes("dashboard")
                              ? "text-green-500"
                              : "text-gray-400"
                              }`}
                            width="16"
                            height="16"
                            // viewBox="0 0 16 16"
                          >
                            <path d="M5.936.278A7.983 7.983 0 0 1 8 0a8 8 0 1 1-8 8c0-.722.104-1.413.278-2.064a1 1 0 1 1 1.932.516A5.99 5.99 0 0 0 2 8a6 6 0 1 0 6-6c-.53 0-1.045.076-1.548.21A1 1 0 1 1 5.936.278Z" />
                            <path d="M6.068 7.482A2.003 2.003 0 0 0 8 10a2 2 0 1 0-.518-3.932L3.707 2.293a1 1 0 0 0-1.414 1.414l3.775 3.775Z" />
                          </svg> */}
                          {/* <span
                            className={`ml-4 text-sm font-medium transition-all duration-200
                              ${sidebarExpanded ? "opacity-100 visible" : "opacity-0 invisible"}`}
                          >
                            Dashboard
                          </span> */}
                        </div>
                        {/* <div className={`ml-2 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
                          <svg
                            className="w-3 h-3 fill-current text-gray-400"
                            viewBox="0 0 12 12"
                          >
                            <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
                          </svg>
                        </div> */}
                      </div>
                    </a>

                    <div className="space-y-10">
                      <div>
                       
                        <ul className="space-y-2">
                          {[
                            { label: "Overview", path: "/" },
                            { label: "Market", path: "/admin/dashboard" },
                            { label: "Vendor", path: "/admin/vendors" },
                            { label: "Farmer", path: "/admin/farmers" },
                            { label: "Composter", path: "/admin/composters" },
                          ].map(item => (
                            <li key={item.path}>
                              <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                  `block px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${isActive
                                    ? "bg-gradient-to-r from-green-400 to-green-300 text-white shadow-md"
                                    : "text-gray-700 hover:bg-green-100 hover:text-green-700"
                                  } ${!sidebarExpanded && "text-center"}`
                                }
                              >
                                {sidebarExpanded ? item.label : item.label.charAt(0)}
                              </NavLink>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className={`text-xs font-bold text-gray-500 uppercase px-4 mb-2 ${!sidebarExpanded && "hidden"}`}>Manage</h3>
                        <ul className="space-y-2">
                          <li>
                            <NavLink
                              to="#"
                              onClick={handleLogout}
                              className="block px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-green-100 hover:text-green-700"
                            >
                              {sidebarExpanded ? "Log out" : "🚪"}
                            </NavLink>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </>
                )}
              </SidebarLinkGroup>
            </ul>
          </div>
        </div>

        {/* Collapse toggle */}
        <div className="pt-3 hidden lg:inline-flex justify-end mt-auto">
          <div className="w-12 pl-4 pr-3 py-2">
            <button
              className="text-gray-400 hover:text-gray-500"
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
            >
              <span className="sr-only">Toggle sidebar</span>
              <svg
                className={`shrink-0 fill-current ${sidebarExpanded ? "rotate-180" : ""}`}
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
              >
                <path d="M15 16a1 1 0 0 1-1-1V1a1 1 0 1 1 2 0v14a1 1 0 0 1-1 1ZM8.586 7H1a1 1 0 1 0 0 2h7.586l-2.793 2.793a1 1 0 1 0 1.414 1.414l4.5-4.5A.997.997 0 0 0 12 8.01M11.924 7.617a.997.997 0 0 0-.217-.324l-4.5-4.5a1 1 0 0 0-1.414 1.414L8.586 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;