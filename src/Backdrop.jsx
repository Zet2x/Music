import React, { useEffect } from "react";

const Backdrop = ({ activeColor, trackIndex, isPlaying }) => {//Компонента динамического изменения цвета фона
  useEffect(() => {
    document.documentElement.style.setProperty("--active-color", activeColor);//setProperty метод обновит значение переменной CSS при trackIndex изменении
  }, [trackIndex, activeColor]);
  return <div className={`color-backdrop ${isPlaying ? "playing" : "idle"}`} />;
};
export default Backdrop;
