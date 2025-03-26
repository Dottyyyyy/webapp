import { navItems } from "../data/index";
import { getUser } from "../utils/helpers";

const Navbar = ({ activePage, handleNavClick }) => {
  const user = getUser();

  return (
    <div className="2xl:w-80 xl:w-52 w-44 h-full bg-[#f8f8f8] flex flex-col justify-between pt-5 pl-6 pb-14 md:pb-0">
      {user && user.role === "admin" && (
        <>
          <div className="flex flex-col flex-grow">
            {navItems.map((item, index) => (
              <a
                key={index}
                href="#"
                className="xl:w-36 lg:w-32 w-30 flex items-center justify-between my-3 text-left cursor-pointer"
                onClick={() => handleNavClick(index)}
              >
                <i className={`${item.icon} text-xl text-pink-400`}></i>
                <span className="text-sm text-gray-500 mr-auto mx-2.5 tracking-wider">
                  {item.label}
                </span>
                <i
                  className={`text-lg text-yellow-400 ${
                    activePage === index ? item.activeIcon : item.inactiveIcon
                  }`}
                ></i>
              </a>
            ))}
          </div>
          <div className="flex justify-between pr-6 pb-2">
            <a href="#">
              <i className="bx bxl-facebook txt-2xl text-blue-600"></i>
            </a>
          </div>
        </>
      )}

      {user && user.role === "vendor" && (
        <>
          <div className="flex flex-col flex-grow">
            {navItems.map((item, index) => (
              <a
                key={index}
                href="#"
                className="xl:w-36 lg:w-32 w-30 flex items-center justify-between my-3 text-left cursor-pointer"
                onClick={() => handleNavClick(index)}
              >
                <i className={`${item.icon} text-xl text-pink-400`}></i>
                <span className="text-sm text-gray-500 mr-auto mx-2.5 tracking-wider">
                  {item.label}
                </span>
                <i
                  className={`text-lg text-yellow-400 ${
                    activePage === index ? item.activeIcon : item.inactiveIcon
                  }`}
                ></i>
              </a>
            ))}
          </div>
          <div className="flex justify-between pr-6 pb-2">
            <a href="#">
              <i className="bx bxl-facebook txt-2xl text-blue-600"></i>
            </a>
          </div>
        </>
      )}

      {user && user.role === "farmer" && (
        <>
          <div className="flex flex-col flex-grow">
            {navItems.map((item, index) => (
              <a
                key={index}
                href="#"
                className="xl:w-36 lg:w-32 w-30 flex items-center justify-between my-3 text-left cursor-pointer"
                onClick={() => handleNavClick(index)}
              >
                <i className={`${item.icon} text-xl text-pink-400`}></i>
                <span className="text-sm text-gray-500 mr-auto mx-2.5 tracking-wider">
                  {item.label}
                </span>
                <i
                  className={`text-lg text-yellow-400 ${
                    activePage === index ? item.activeIcon : item.inactiveIcon
                  }`}
                ></i>
              </a>
            ))}
          </div>
          <div className="flex justify-between pr-6 pb-2">
            <a href="#">
              <i className="bx bxl-facebook txt-2xl text-blue-600"></i>
            </a>
          </div>
        </>
      )}

      {user && user.role === "composter" && (
        <>
          <div className="flex flex-col flex-grow">
            {navItems.map((item, index) => (
              <a
                key={index}
                href="#"
                className="xl:w-36 lg:w-32 w-30 flex items-center justify-between my-3 text-left cursor-pointer"
                onClick={() => handleNavClick(index)}
              >
                <i className={`${item.icon} text-xl text-pink-400`}></i>
                <span className="text-sm text-gray-500 mr-auto mx-2.5 tracking-wider">
                  {item.label}
                </span>
                <i
                  className={`text-lg text-yellow-400 ${
                    activePage === index ? item.activeIcon : item.inactiveIcon
                  }`}
                ></i>
              </a>
            ))}
          </div>
          <div className="flex justify-between pr-6 pb-2">
            <a href="#">
              <i className="bx bxl-facebook txt-2xl text-blue-600"></i>
            </a>
          </div>
        </>
      )}
    </div>
  );
};

export default Navbar;
