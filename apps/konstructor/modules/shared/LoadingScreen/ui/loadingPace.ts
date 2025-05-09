import 'pace-js';

const loadingPace = (onDone: () => void) => {
    const addDoneClass = () => {
      const preloader = document.querySelector("#preloader");
      const loadingText = document.querySelector(".loading-text");
      if (preloader) preloader.classList.add("isdone");
      if (loadingText) loadingText.classList.add("isdone");
      onDone();
    };
  
    // Если Pace.js уже загружен, привязываем события
    if (typeof window !== "undefined" && typeof window.Pace !== "undefined") {
      window.Pace.on("start", () => {
        console.log("Pace started");
      });
  
      window.Pace.on("done", () => {
        console.log("Pace done");
        addDoneClass();
      });
  
      if (document.readyState === "complete") {
        addDoneClass();
      } else {
        window.addEventListener("load", addDoneClass);
      }
    }
  };
  
  export default loadingPace;
  