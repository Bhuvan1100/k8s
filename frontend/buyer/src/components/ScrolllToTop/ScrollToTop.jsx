import { useLayoutEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

function ScrollToTop() {
  const location = useLocation();
  const navigationType = useNavigationType();

  // Disable browser scroll restoration
  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  // Scroll behavior
  useLayoutEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior:"smooth",
    });
  }, [location.key, navigationType]);

  return null;
}

export default ScrollToTop;
