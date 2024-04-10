import React, { useState, useEffect, useRef } from "react";
import AudioControls from "./AudioControls";
import Backdrop from "./Backdrop";
import "./styles.css";

const AudioPlayer = ({ tracks }) => {
    // Состояние
    const [trackIndex, setTrackIndex] = useState(0);//Индекс воспроизводимого трека
    const [trackProgress, setTrackProgress] = useState(0);//Текущий прогресс трека.
    const [isPlaying, setIsPlaying] = useState(false);//Воспроизводится трек или нет.
    // Структура для краткости
    const { title, artist, color, image, audioSrc } = tracks[trackIndex];
    // Refs
    const audioRef = useRef(new Audio(audioSrc));//Аудиоэлемент, созданный с помощью Audio конструктора.
    const intervalRef = useRef();//Ссылка на setIntervalтаймер.
    const isReady = useRef(false);//Логическое значение для определения того, когда определенные действия готовы к запуску.
    // Структура для краткости
    const { duration } = audioRef.current;
    const currentPercentage = duration
        ? `${(trackProgress / duration) * 100}%`
        : "0%";
    const trackStyling = `
    -webkit-gradient(linear, 0% 0%, 100% 0%, color-stop(${currentPercentage}, #fff), color-stop(${currentPercentage}, #777))`;
    const startTimer = () => {
        clearInterval(intervalRef.current);
        /*Каждую секунду мы проверяем, закончился ли / завершено воспроизведение. Если завершено, перейдити к следующей дорожке, в противном случае
         обновить trackProgress состояние.
         Идентификатор интервала хранится внутри intervalRef, используется для того, чтобы был доступ к таймеру в других частях нашего компонента
         и чтобы очистить его.
        startTimer Функция вызывается как часть useEffect хуков, которые мы добавили в предыдущем разделе. Сначала добавьте его, когда isPlaying состояние
        изменится и будет истинным.*/
        intervalRef.current = setInterval(() => {
            if (audioRef.current.ended) {
                toNextTrack();
            } else {
                setTrackProgress(audioRef.current.currentTime);
            }
        }, [1000]);
    };
    const onScrub = (value) => {
        // Очистить все уже запущенные таймеры
        clearInterval(intervalRef.current);
        audioRef.current.currentTime = value;
        setTrackProgress(audioRef.current.currentTime);
    };
    const onScrubEnd = () => {
        // Начать воспроизведение, если ещё не началось
        if (!isPlaying) {
            setIsPlaying(true);
        }
        startTimer();
    };
    const toPrevTrack = () => {//обрабатывает нажатие кнопки предыдущего трека
        if (trackIndex - 1 < 0) {
            setTrackIndex(tracks.length - 1);
        } else {
            setTrackIndex(trackIndex - 1);
        }
    };
    const toNextTrack = () => {//обрабатывает следующее нажатие кнопки
        if (trackIndex < tracks.length - 1) {
            setTrackIndex(trackIndex + 1);
        } else {
            setTrackIndex(0);
        }
    };
    useEffect(() => {//используется для запуска или остановки (паузы) звука при нажатии кнопки воспроизведения или паузы
        //isPlaying, когда состояние изменяется, мы вызываем метод play() или pause() в audioRefзависимости от его значения.
        if (isPlaying) {
            audioRef.current.play();
            startTimer(); //startTimer Функция также должна запускаться при изменении trackIndex значения.
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying]);
    // Выполняет очистку и настройку при смене треков
    useEffect(() => {
        audioRef.current.pause();
        audioRef.current = new Audio(audioSrc);
        setTrackProgress(audioRef.current.currentTime);
        if (isReady.current) {
            audioRef.current.play();
            setIsPlaying(true);
            startTimer();
        } else {
            // Установите isReady ref как true для следующего прохода
            isReady.current = true;
        }
    }, [trackIndex]);
    useEffect(() => {
        return () => {
            audioRef.current.pause();
            clearInterval(intervalRef.current);
        };
    }, []);
    return (//отображает изображение трека, название и исполнителя, по умолчанию для первого трека в списке.
        <div className="audio-player">
            <div className="track-info">
                <img
                    className="artwork"
                    src={image}
                    alt={`track artwork for ${title} by ${artist}`}
                />
                <h2 className="title">{title}</h2>
                <h3 className="artist">{artist}</h3>
                <AudioControls
                    isPlaying={isPlaying}
                    onPrevClick={toPrevTrack}
                    onNextClick={toNextTrack}
                    onPlayPauseClick={setIsPlaying}
                />
                <input
                    type="range"
                    value={trackProgress}
                    step="1"
                    min="0"
                    max={duration ? duration : `${duration}`}
                    className="progress"
                    onChange={(e) => onScrub(e.target.value)}
                    onMouseUp={onScrubEnd}
                    onKeyUp={onScrubEnd}
                    style={{ background: trackStyling }}
                />
            </div>
            <Backdrop
                trackIndex={trackIndex}
                activeColor={color}
                isPlaying={isPlaying}
            />
        </div>
    );
};
export default AudioPlayer;
