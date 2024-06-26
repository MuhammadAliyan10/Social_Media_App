import React from "react";
import "../assets/Css/Sidebar.css";
import { Link, useNavigate } from "react-router-dom";
import { useUserContext } from "../Context/UserContext";

const Sidebar = () => {
  const navigate = useNavigate();
  const { setIsLogIn } = useUserContext();
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLogIn(false);
    navigate("/login");
  };
  return (
    <>
      <div className="Sidebar">
        <div className="page-wrapper chiller-theme toggled">
          <a id="show-sidebar" className="btn btn-sm btn-dark" href="#">
            <i className="fas fa-bars"></i>
          </a>
          <nav id="sidebar" className="sidebar-wrapper">
            <div className="sidebar-content">
              <div className="sidebar-brand">
                <a href="#">DeBugger</a>
                <div id="close-sidebar">
                  <i className="fas fa-times"></i>
                </div>
              </div>
              {/* <div className="sidebar-header">
                <div className="user-pic">
                  <img
                    className="img-responsive img-rounded"
                    src="https://raw.githubusercontent.com/azouaoui-med/pro-sidebar-template/gh-pages/src/img/user.jpg"
                    alt="User picture"
                  />
                </div>
                <div className="user-info">
                  <span className="user-name">
                    Jhon
                    <strong>Smith</strong>
                  </span>
                  <span className="user-role">Administrator</span>
                  <span className="user-status">
                    <i className="fa fa-circle"></i>
                    <span>Online</span>
                  </span>
                </div>
              </div> */}

              <div className="sidebar-menu">
                <ul>
                  <li className="header-menu">
                    <span>General</span>
                  </li>
                  <li className="sidebar-dropdown">
                    <Link to="/">
                      <i className="fa-solid fa-house"></i>
                      <span>Home</span>
                    </Link>
                  </li>
                  <li className="sidebar-dropdown">
                    <Link to="/posts">
                      <i className="fa-solid fa-signs-post"></i>
                      <span>Posts</span>
                      <span className="badge badge-pill badge-danger">3</span>
                    </Link>
                  </li>
                  <li className="sidebar-dropdown">
                    <Link to="/findUsers">
                      <i className="fa-solid fa-magnifying-glass"></i>
                      <span>Find Friends</span>
                    </Link>
                  </li>
                  <li className="sidebar-dropdown">
                    <Link to="/profile">
                      <i className="fa-regular fa-user"></i>
                      <span>Profile</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="sidebar-footer">
              <a href="#">
                <i className="fa fa-bell"></i>
                <span className="badge badge-pill badge-warning notification">
                  3
                </span>
              </a>
              <a href="#">
                <i className="fa fa-envelope"></i>
                <span className="badge badge-pill badge-success notification">
                  7
                </span>
              </a>
              <a onClick={handleLogout}>
                <i className="fa fa-power-off"></i>
              </a>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
